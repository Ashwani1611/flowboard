from collections import deque
from datetime import datetime, timedelta, timezone


def sliding_window_analytics(action_logs, days: int = 7) -> list:
    """
    Sliding Window over the last N days.

    For each day in the window, count how many tasks
    were marked 'done' on that day.

    Returns a list of dicts ready for the frontend chart:
    [
        {"date": "2025-04-09", "completed": 3, "overdue": 1},
        ...
    ]
    """
    now = datetime.now(timezone.utc)

    # Build the window: last N days as a deque
    window = deque()
    for i in range(days - 1, -1, -1):
        day = (now - timedelta(days=i)).date()
        window.append({
            "date": str(day),
            "completed": 0,
            "overdue": 0,
        })

    # Map date string → index for O(1) lookup
    date_index = {entry["date"]: idx for idx, entry in enumerate(window)}

    # Slide through logs and count
    for log in action_logs:
        log_date = str(log.acted_at.date())
        if log_date not in date_index:
            continue  # outside the window

        idx = date_index[log_date]
        if log.new_status == 'done':
            window[idx]["completed"] += 1

    return list(window)