"""
Entry point for the module_example module.
"""
from typing import List

from athena import app, submissions_consumer, submission_selector, feedback_consumer, feedback_provider
from athena.programming import Exercise, Submission, Feedback
from athena.logger import logger


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


@submission_selector
def select_submission(exercise: Exercise, submissions: List[Submission]) -> Submission:
    print(f"select_submission: Received {len(submissions)} submissions for exercise {exercise.id}")
    for submission in submissions:
        print(f"- Submission {submission.id}")
    # Do something with the submissions and return the one that should be assessed next
    return submissions[0]


@feedback_consumer
def process_incoming_feedback(exercise: Exercise, submission: Submission, feedback: Feedback):
    logger.info("process_feedback: Received feedback for submission %d of exercise %d", submission.id, exercise.id)
    logger.info("process_feedback: Feedback: %s", feedback)
    # Do something with the feedback


@feedback_provider
def suggest_feedback(exercise: Exercise, submission: Submission) -> List[Feedback]:
    logger.info("suggest_feedback: Suggestions for submission %d of exercise %d were requested", submission.id, exercise.id)
    # Do something with the submission and return a list of feedback
    return [
        Feedback(
            id=10,
            exercise_id=exercise.id,
            submission_id=submission.id,
            detail_text="There is something wrong here.",
            text="Correct",
            reference=None,
            credits=-1.0,
            meta={},
        )
    ]


if __name__ == "__main__":
    app.start()
