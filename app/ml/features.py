from datetime import datetime


def day_of_week_from_datetime(dt: datetime) -> str:
    return dt.strftime("%A").lower()


def season_from_datetime(dt: datetime) -> str:
    month = dt.month
    if month in (12, 1, 2):
        return "winter"
    if month in (3, 4, 5):
        return "summer"
    if month in (6, 7, 8, 9):
        return "monsoon"
    return "autumn"
