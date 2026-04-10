import heapq
from datetime import datetime , timezone
from typing import Optional
from rest_framework import serializers
from .models import Task, ActionLog


def compute_priority_score(priority: int, deadline: Optional[datetime]) -> int:
    """
    Min-Heap score: lower number = more urgent.
    
    Formula: invert priority (4=Critical becomes 1, 1=Low becomes 4)
             then subtract urgency bonus if deadline is soon.
    
    Score range: 1 (most urgent) → 100 (least urgent)
    """
    base = (5 - priority) * 20          # Critical=20, High=40, Medium=60, Low=80

    if deadline:
        now = datetime.now(timezone.utc)
        hours_left = (deadline - now).total_seconds() / 3600
        if hours_left < 0:
            base -= 15                  # already overdue → push to top
        elif hours_left < 24:
            base -= 10                  # due today
        elif hours_left < 72:
            base -= 5                   # due in 3 days

    return max(1, base)                 # never go below 1


class TaskSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Task
        fields = (
            'id', 'user', 'title', 'description',
            'priority', 'status', 'priority_score',
            'deadline', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'user', 'priority_score', 'created_at', 'updated_at')

    def create(self, validated_data):
        # Auto-compute priority_score on create
        score = compute_priority_score(
            validated_data.get('priority', 2),
            validated_data.get('deadline'),
        )
        validated_data['priority_score'] = score
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Recompute score if priority or deadline changed
        priority = validated_data.get('priority', instance.priority)
        deadline = validated_data.get('deadline', instance.deadline)
        validated_data['priority_score'] = compute_priority_score(priority, deadline)
        return super().update(instance, validated_data)


class ActionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionLog
        fields = ('id', 'task', 'action', 'prev_status', 'new_status', 'acted_at')
        read_only_fields = fields