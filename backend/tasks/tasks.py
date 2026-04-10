from datetime import datetime, timedelta, timezone
from celery import shared_task


@shared_task
def check_upcoming_deadlines():
    """
    Runs every 60 seconds via Celery Beat.

    Sliding Window: find all tasks with deadline
    in the next 30 minutes and notify the user via WebSocket.
    """
    from .models import Task
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync

    now = datetime.now(timezone.utc)
    window_end = now + timedelta(minutes=30)

    # Sliding window: tasks due between now and now+30min
    upcoming = Task.objects.filter(
        deadline__gte=now,
        deadline__lte=window_end,
        status__in=['todo', 'in_progress'],
    ).select_related('user')

    if not upcoming.exists():
        return 'No upcoming deadlines'

    channel_layer = get_channel_layer()

    for task in upcoming:
        minutes_left = int((task.deadline - now).total_seconds() / 60)

        # Push to user's WebSocket channel group (wired fully on Day 6)
        async_to_sync(channel_layer.group_send)(
            f'notifications_{task.user.id}',
            {
                'type': 'send_notification',
                'message': f'"{task.title}" is due in {minutes_left} minutes!',
                'task_id': str(task.id),
            }
        )

    return f'Notified for {upcoming.count()} tasks'