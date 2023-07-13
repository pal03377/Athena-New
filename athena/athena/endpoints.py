# type: ignore # too much weird behavior of mypy with decorators
import inspect
from fastapi import Depends

from typing import TypeVar, Callable, List, Dict, Union, Any, Coroutine, Optional

from athena.app import app
from athena.authenticate import authenticated
from athena.metadata import with_meta
from athena.module_config import get_dynamic_module_config
from athena.logger import logger
from athena.schemas import Exercise, Submission, Feedback
from athena.storage import get_stored_submission_meta, get_stored_exercise_meta, get_stored_feedback_meta, \
    store_exercise, store_feedback, store_feedback_suggestions, store_submissions, get_stored_submissions


E = TypeVar('E', bound=Exercise)
S = TypeVar('S', bound=Submission)
F = TypeVar('F', bound=Feedback)


module_responses = {
    403: {
        "description": "API secret is invalid - set the environment variable SECRET and the X-API-Secret header "
                       "to the same value",
    }
}


def submissions_consumer(func: Union[
    Callable[[E, List[S]], None],
    Callable[[E, List[S], Optional[dict]], None],
    Callable[[E, List[S]], Coroutine[Any, Any, None]],
    Callable[[E, List[S], Optional[dict]], Coroutine[Any, Any, None]]
]):
    """
    Receive submissions from the Assessment Module Manager.
    The submissions consumer is usually called whenever the deadline for an exercise is reached.
    
    This decorator can be used with several types of functions: synchronous or asynchronous, with or without a module config.

    Examples:
        Below are some examples of possible functions that you can decorate with this decorator:

        Without using module config (both synchronous and asynchronous forms):
        >>> @submissions_consumer
        ... def sync_receive_submissions(exercise: Exercise, submissions: List[Submission]):
        ...     # process submissions synchronously here

        >>> @submissions_consumer
        ... async def async_receive_submissions(exercise: Exercise, submissions: List[Submission]):
        ...     # process submissions asynchronously here

        With using module config (both synchronous and asynchronous forms):
        >>> @submissions_consumer
        ... def sync_receive_submissions_with_config(exercise: Exercise, submissions: List[Submission], module_config: Optional[dict]):
        ...     # process submissions synchronously here using module_config

        >>> @submissions_consumer
        ... async def async_receive_submissions_with_config(exercise: Exercise, submissions: List[Submission], module_config: Optional[dict]):
        ...     # process submissions asynchronously here using module_config
    """
    exercise_type = inspect.signature(func).parameters["exercise"].annotation
    submission_type = inspect.signature(func).parameters["submissions"].annotation.__args__[0]

    @app.post("/submissions", responses=module_responses)
    @authenticated
    @with_meta
    async def wrapper(
            exercise: exercise_type,
            submissions: List[submission_type],
            module_config: Optional[Dict] = Depends(get_dynamic_module_config)):
        
        # Retrieve existing metadata for the exercise and submissions
        exercise_meta = get_stored_exercise_meta(exercise) or {}
        exercise_meta.update(exercise.meta)
        exercise.meta = exercise_meta
        submissions_dict = {s.id: s for s in submissions}
        if submissions:
            stored_submissions = get_stored_submissions(
                submissions[0].__class__, exercise.id, [s.id for s in submissions])
            for stored_submission in stored_submissions:
                if stored_submission.id in submissions_dict:
                    submission_meta = get_stored_submission_meta(stored_submission) or {}
                    submission_meta.update(stored_submission.meta)
                    submissions_dict[stored_submission.id].meta = submission_meta
        submissions = list(submissions_dict.values())

        store_exercise(exercise)
        store_submissions(submissions)

        kwargs = {}
        if "module_config" in inspect.signature(func).parameters:
            kwargs["module_config"] = module_config

        # Call the actual consumer
        if inspect.iscoroutinefunction(func):
            await func(exercise, submissions, **kwargs)
        else:
            func(exercise, submissions, **kwargs)

        return None
    return wrapper


def submission_selector(func: Union[
    Callable[[E, List[S]], S],
    Callable[[E, List[S], Optional[dict]], S],
    Callable[[E, List[S]], Coroutine[Any, Any, S]],
    Callable[[E, List[S], Optional[dict]], Coroutine[Any, Any, S]]
]):
    """
    Receive an exercise and some (not necessarily all!) submissions from the Assessment Module Manager and
    return the submission that should ideally be assessed next.
    If the selector returns None, the LMS will select a random submission in the end.

    This decorator can be used with several types of functions: synchronous or asynchronous, with or without a module config.

    Examples:
        Below are some examples of possible functions that you can decorate with this decorator:

        Without using module config (both synchronous and asynchronous forms):
        >>> @submission_selector
        ... def sync_select_submission(exercise: Exercise, submissions: List[Submission]):
        ...     # process submissions here and return the chosen submission

        >>> @submission_selector
        ... async def async_select_submission(exercise: Exercise, submissions: List[Submission]):
        ...     # process submissions here and return the chosen submission

        With using module config (both synchronous and asynchronous forms):
        >>> @submission_selector
        ... def sync_select_submission_with_config(exercise: Exercise, submissions: List[Submission], module_config: Optional[dict]):
        ...     # process submissions here using module_config and return the chosen submission

        >>> @submission_selector
        ... async def async_select_submission_with_config(exercise: Exercise, submissions: List[Submission], module_config: Optional[dict]):
        ...     # process submissions here using module_config and return the chosen submission
    """
    exercise_type = inspect.signature(func).parameters["exercise"].annotation
    submission_type = inspect.signature(func).parameters["submissions"].annotation.__args__[0]

    @app.post("/select_submission", responses=module_responses)
    @authenticated
    @with_meta
    async def wrapper(
            exercise: exercise_type,
            submission_ids: List[int],
            module_config: Optional[Dict] = Depends(get_dynamic_module_config)):
        # The wrapper handles only transmitting submission IDs for efficiency, but the actual selection logic
        # only works with the full submission objects.

        exercise.meta.update(get_stored_exercise_meta(exercise) or {})

        # Get the full submission objects
        submissions = list(get_stored_submissions(submission_type, exercise.id, submission_ids))
        if len(submission_ids) != len(submissions):
            logger.warning("Not all submissions were found in the database! "
                           "Have you sent all submissions to the submission consumer before?")
        if not submissions:
            # Nothing to select from
            return -1

        kwargs = {}
        if "module_config" in inspect.signature(func).parameters:
            kwargs["module_config"] = module_config

        # Select the submission
        if inspect.iscoroutinefunction(func):
            submission = await func(exercise, submissions, **kwargs)
        else:
            submission = func(exercise, submissions, **kwargs)

        if submission is None:
            return -1
        return submission.id

    return wrapper


def feedback_consumer(func: Union[
    Callable[[E, S, F], None],
    Callable[[E, S, F, Optional[dict]], None],
    Callable[[E, S, F], Coroutine[Any, Any, None]],
    Callable[[E, S, F, Optional[dict]], Coroutine[Any, Any, None]]
]):
    """
    Receive feedback from the Assessment Module Manager.
    The feedback consumer is usually called whenever the LMS gets feedback from a tutor.

    This decorator can be used with several types of functions: synchronous or asynchronous, with or without a module config.

    Examples:
        Below are some examples of possible functions that you can decorate with this decorator:

        Without using module config (both synchronous and asynchronous forms):
        >>> @feedback_consumer
        ... def sync_process_feedback(exercise: Exercise, submission: Submission, feedback: Feedback):
        ...     # process feedback here

        >>> @feedback_consumer
        ... async def async_process_feedback(exercise: Exercise, submission: Submission, feedback: Feedback):
        ...     # process feedback here

        With using module config (both synchronous and asynchronous forms):
        >>> @feedback_consumer
        ... def sync_process_feedback_with_config(exercise: Exercise, submission: Submission, feedback: Feedback, module_config: Optional[dict]):
        ...     # process feedback here using module_config

        >>> @feedback_consumer
        ... async def async_process_feedback_with_config(exercise: Exercise, submission: Submission, feedback: Feedback, module_config: Optional[dict]):
        ...     # process feedback here using module_config
    """
    exercise_type = inspect.signature(func).parameters["exercise"].annotation
    submission_type = inspect.signature(func).parameters["submission"].annotation
    feedback_type = inspect.signature(func).parameters["feedback"].annotation

    @app.post("/feedback", responses=module_responses)
    @authenticated
    @with_meta
    async def wrapper(
            exercise: exercise_type,
            submission: submission_type,
            feedback: feedback_type,
            module_config: Optional[Dict] = Depends(get_dynamic_module_config)):

        # Retrieve existing metadata for the exercise, submission and feedback
        exercise.meta.update(get_stored_exercise_meta(exercise) or {})
        submission.meta.update(get_stored_submission_meta(submission) or {})
        feedback.meta.update(get_stored_feedback_meta(feedback) or {})

        store_feedback(feedback)

        kwargs = {}
        if "module_config" in inspect.signature(func).parameters:
            kwargs["module_config"] = module_config

        # Call the actual consumer
        if inspect.iscoroutinefunction(func):
            await func(exercise, submission, feedback, **kwargs)
        else:
            func(exercise, submission, feedback, **kwargs)

        return None
    return wrapper


def feedback_provider(func: Union[
    Callable[[E, S], List[F]],
    Callable[[E, S, Optional[dict]], List[F]],
    Callable[[E, S], Coroutine[Any, Any, List[F]]],
    Callable[[E, S, Optional[dict]], Coroutine[Any, Any, List[F]]]
]):
    """
    Provide feedback to the Assessment Module Manager.
    The feedback provider is usually called whenever the tutor requests feedback for a submission in the LMS.

    This decorator can be used with several types of functions: synchronous or asynchronous, with or without a module config.

    Examples:
        Below are some examples of possible functions that you can decorate with this decorator:

        Without using module config (both synchronous and asynchronous forms):
        >>> @feedback_provider
        ... def sync_suggest_feedback(exercise: Exercise, submission: Submission):
        ...     # suggest feedback here and return it as a list

        >>> @feedback_provider
        ... async def async_suggest_feedback(exercise: Exercise, submission: Submission):
        ...     # suggest feedback here and return it as a list

        With using module config (both synchronous and asynchronous forms):
        >>> @feedback_provider
        ... def sync_suggest_feedback_with_config(exercise: Exercise, submission: Submission, module_config: Optional[dict]):
        ...     # suggest feedback here using module_config and return it as a list

        >>> @feedback_provider
        ... async def async_suggest_feedback_with_config(exercise: Exercise, submission: Submission, module_config: Optional[dict]):
        ...     # suggest feedback here using module_config and return it as a list
    """
    exercise_type = inspect.signature(func).parameters["exercise"].annotation
    submission_type = inspect.signature(func).parameters["submission"].annotation

    @app.post("/feedback_suggestions", responses=module_responses)
    @authenticated
    @with_meta
    async def wrapper(
            exercise: exercise_type,
            submission: submission_type,
            module_config: Optional[Dict] = Depends(get_dynamic_module_config)):
        
        # Retrieve existing metadata for the exercise, submission and feedback
        exercise.meta.update(get_stored_exercise_meta(exercise) or {})
        submission.meta.update(get_stored_submission_meta(submission) or {})

        store_exercise(exercise)
        store_submissions([submission])

        kwargs = {}
        if "module_config" in inspect.signature(func).parameters:
            kwargs["module_config"] = module_config

        # Call the actual provider
        if inspect.iscoroutinefunction(func):
            feedbacks = await func(exercise, submission, **kwargs)
        else:
            feedbacks = func(exercise, submission, **kwargs)

        store_feedback_suggestions(feedbacks)

        return feedbacks
    return wrapper


def config_schema_provider(func: Union[Callable[[], dict], Callable[[], Coroutine[Any, Any, dict]]]):
    """
    Get available configuration options of a module.
    """

    @app.get("/config_schema", responses=module_responses)
    @authenticated
    async def wrapper():
        if inspect.iscoroutinefunction(func):
            config = await func()
        else:
            config = func()
        return config
    return wrapper
