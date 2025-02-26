from typing import List
from athena import emit_meta
from athena.text import Exercise, Submission, Feedback
from athena.logger import logger
from module_text_llm.basic_approach import BasicApproachConfig
from module_text_llm.self_consistency.self_consistency_utils import run_approach, aggregate_feedback, compute_scores, select_best_approach
import asyncio

from module_text_llm.approach_config import ApproachConfig
# Placeholder for generate suggestions logic.
async def generate_suggestions(exercise: Exercise, submission: Submission, 
                               config: ApproachConfig, debug: bool, is_graded: bool) -> List[Feedback]:
    # Common model configuration for all approaches.
    model = config.model.get_model()  # type: ignore[attr-defined]

    # Define available approaches in a dictionary.
    approaches = {
        "basic": BasicApproachConfig(model=model),
        "basic2": BasicApproachConfig(model=model),
        "basic3": BasicApproachConfig(model=model)
    }

    # Run all approaches concurrently.
    tasks = {
        name: asyncio.create_task(run_approach(exercise, submission, approach, debug, is_graded))
        for name, approach in approaches.items()
    }
    results = {name: await task for name, task in tasks.items()}

    # Aggregate feedback for each approach.
    aggregated = {name: aggregate_feedback(feedbacks) for name, feedbacks in results.items()}

    # Compute scores and select the best approach.
    scores = compute_scores(aggregated)
    best_key, best_value = select_best_approach(scores)
    logger.info(f"Scores: {scores} | Best approach: {best_key}")

    return results.get(best_key, [])