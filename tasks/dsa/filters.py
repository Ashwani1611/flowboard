import bisect
from datetime import datetime


def filter_tasks_by_deadline(tasks_qs, start: datetime, end: datetime):
    """
    Binary Search on deadline field.

    Instead of a full table scan, we:
    1. Extract sorted deadline list from the queryset
    2. Use bisect to find left and right indices in O(log n)
    3. Slice — only tasks within range are returned

    This works because Task.Meta orders by priority_score and 
    we sort by deadline here for the binary search pass.
    """
    # Sort by deadline (only tasks that have a deadline set)
    tasks = list(tasks_qs.exclude(deadline__isnull=True).order_by('deadline'))

    if not tasks:
        return tasks_qs.none()

    deadlines = [t.deadline.replace(tzinfo=None) 
                 if t.deadline.tzinfo else t.deadline 
                 for t in tasks]

    start_naive = start.replace(tzinfo=None) if start.tzinfo else start
    end_naive = end.replace(tzinfo=None) if end.tzinfo else end

    left = bisect.bisect_left(deadlines, start_naive)
    right = bisect.bisect_right(deadlines, end_naive)

    filtered_ids = [t.id for t in tasks[left:right]]
    return tasks_qs.filter(id__in=filtered_ids)