from datetime import datetime
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Task, ActionLog
from .serializers import TaskSerializer, ActionLogSerializer
from .dsa.filters import filter_tasks_by_deadline
from .dsa.analytics import sliding_window_analytics


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Only return tasks belonging to the logged-in user."""
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # ─── Binary Search filter endpoint ───────────────────────────────────
    @action(detail=False, methods=['get'], url_path='by-deadline')
    def by_deadline(self, request):
        """
        GET /api/tasks/by-deadline/?start=2025-04-01&end=2025-04-30

        Uses binary search to find tasks in the given deadline range.
        """
        start_str = request.query_params.get('start')
        end_str = request.query_params.get('end')

        if not start_str or not end_str:
            return Response(
                {'error': 'Provide both start and end as YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            start = datetime.strptime(start_str, '%Y-%m-%d')
            end = datetime.strptime(end_str, '%Y-%m-%d').replace(
                hour=23, minute=59, second=59
            )
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        qs = self.get_queryset()
        filtered = filter_tasks_by_deadline(qs, start, end)
        serializer = self.get_serializer(filtered, many=True)
        return Response(serializer.data)

    # ─── Priority Queue endpoint ──────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='priority-queue')
    def priority_queue(self, request):
        """
        GET /api/tasks/priority-queue/

        Returns tasks sorted by priority_score (Min-Heap order).
        Most urgent task is always first.
        """
        qs = self.get_queryset().exclude(
            status='done'
        ).order_by('priority_score')

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    # ─── Status change with Stack logging ────────────────────────────────
    @action(detail=True, methods=['patch'], url_path='change-status')
    def change_status(self, request, pk=None):
        """
        PATCH /api/tasks/<id>/change-status/
        Body: {"status": "in_progress"}

        Changes task status and logs the change to ActionLog (Stack).
        """
        task = self.get_object()
        new_status = request.data.get('status')

        valid = [s[0] for s in Task.Status.choices]
        if new_status not in valid:
            return Response(
                {'error': f'Invalid status. Choose from: {valid}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Push to Stack (ActionLog)
        ActionLog.objects.create(
            task=task,
            user=request.user,
            action='status_change',
            prev_status=task.status,
            new_status=new_status,
        )

        task.status = new_status
        task.save()

        return Response(TaskSerializer(task).data)

    # ─── Undo last action (Stack pop) ────────────────────────────────────
    @action(detail=True, methods=['post'], url_path='undo')
    def undo(self, request, pk=None):
        """
        POST /api/tasks/<id>/undo/

        Pops the last ActionLog entry and reverses the status change.
        """
        task = self.get_object()

        # Pop from stack = get latest log entry
        last_log = ActionLog.objects.filter(task=task).first()

        if not last_log:
            return Response(
                {'error': 'Nothing to undo.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Reverse the change
        task.status = last_log.prev_status
        task.save()

        last_log.delete()   # remove from stack

        return Response({
            'message': f'Undone. Status reverted to "{task.status}"',
            'task': TaskSerializer(task).data,
        })
    @action(detail=False, methods=['get'], url_path='analytics')
    def analytics(self, request):
        """
        GET /api/tasks/analytics/?days=7

        Returns task completion data for the last N days
        using a Sliding Window algorithm.
        """
        days = int(request.query_params.get('days', 7))

        if days < 1 or days > 30:
            return Response(
                {'error': 'days must be between 1 and 30'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get all status change logs for this user's tasks
        logs = ActionLog.objects.filter(
            task__user=request.user,
            new_status='done',
        ).order_by('acted_at')

        data = sliding_window_analytics(logs, days=days)

        # Summary stats
        total_completed = sum(d['completed'] for d in data)
        best_day = max(data, key=lambda d: d['completed'])

        return Response({
            'window_days': days,
            'total_completed': total_completed,
            'best_day': best_day,
            'chart_data': data,
        })  


class ActionLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only history of all status changes for a task."""
    serializer_class = ActionLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ActionLog.objects.filter(task__user=self.request.user)