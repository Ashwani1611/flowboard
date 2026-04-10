import uuid
from django.db import models
from django.conf import settings


class Task(models.Model):

    class Priority(models.IntegerChoices):
        LOW = 1, 'Low'
        MEDIUM = 2, 'Medium'
        HIGH = 3, 'High'
        CRITICAL = 4, 'Critical'

    class Status(models.TextChoices):
        TODO = 'todo', 'Todo'
        IN_PROGRESS = 'in_progress', 'In Progress'
        DONE = 'done', 'Done'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    priority = models.IntegerField(choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    
    # Used by the Min-Heap: lower score = higher urgency
    priority_score = models.IntegerField(default=0)
    
    deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['priority_score']   # DB-level ordering by heap score

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class ActionLog(models.Model):
    """Stack: every status change is logged here. Undo = pop last entry."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action = models.CharField(max_length=50)       # e.g. "status_change"
    prev_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    acted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-acted_at']   # latest first — top of stack

    def __str__(self):
        return f"{self.task.title}: {self.prev_status} → {self.new_status}"