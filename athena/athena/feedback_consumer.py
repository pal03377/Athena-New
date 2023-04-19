from functools import wraps
from typing import Callable

from .app import app
from .models import Exercise, Submission, Feedback
from .storage import store_feedback


def feedback_consumer(func: Callable[[Exercise, Submission, Feedback], None]):
    @app.post("/feedback")
    @wraps(func)
    def wrapper(exercise: Exercise, submission: Submission, feedback: Feedback):
        store_feedback(feedback)
        func(exercise, submission, feedback)

    return wrapper
