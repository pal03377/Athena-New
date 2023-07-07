"""
Entry point for the module_example module.
"""
from typing import List

from athena import app, submissions_consumer, submission_selector, feedbacks_consumer, feedback_provider
from athena.programming import Exercise, Submission, Feedback
from athena.logger import logger
from athena.storage import store_exercise, store_submissions, store_feedback


@submissions_consumer
def receive_submissions(exercise: Exercise, submissions: List[Submission]):
    logger.info("receive_submissions: Received %d submissions for exercise %d", len(submissions), exercise.id)
    for submission in submissions:
        logger.info("- Submission %d", submission.id)
        zip_content = submission.get_zip()
        # list the files in the zip
        for file in zip_content.namelist():
            logger.info("  - %s", file)
    # Do something with the submissions
    logger.info("Doing stuff")

    # Add data to exercise
    exercise.meta["some_data"] = "some_value"
    logger.info("- Exercise meta: %s", exercise.meta)

    # Add data to submission
    for submission in submissions:
        submission.meta["some_data"] = "some_value"
        logger.info("- Submission %d meta: %s", submission.id, submission.meta)
    
    store_exercise(exercise)
    store_submissions(submissions)


@submission_selector
def select_submission(exercise: Exercise, submissions: List[Submission]) -> Submission:
    logger.info("select_submission: Received %d submissions for exercise %d", len(submissions), exercise.id)
    for submission in submissions:
        logger.info("- Submission %d", submission.id)
    # Do something with the submissions and return the one that should be assessed next
    return submissions[0]


@feedbacks_consumer
def process_incoming_feedback(exercise: Exercise, submission: Submission, feedbacks: List[Feedback]):
    logger.info("process_feedback: Received feedbacks for submission %d of exercise %d", submission.id, exercise.id)
    logger.info("process_feedback: Feedbacks: %s", feedbacks)
    # Do something with the feedback

    # Add data to feedback
    for feedback in feedbacks:
        feedback.meta["some_data"] = "some_value"
        store_feedback(feedback)


@feedback_provider
def suggest_feedback(exercise: Exercise, submission: Submission) -> List[Feedback]:
    logger.info("suggest_feedback: Suggestions for submission %d of exercise %d were requested", submission.id, exercise.id)
    # Do something with the submission and return a list of feedback
    return [
        Feedback(
            exercise_id=exercise.id,
            submission_id=submission.id,
            text="This is a suggestion.",
            detail_text="There is something wrong here.",
            credits=-1.0,
        )
    ]


if __name__ == "__main__":
    app.start()
