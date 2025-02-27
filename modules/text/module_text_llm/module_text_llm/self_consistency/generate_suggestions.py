from typing import List
from athena.text import Exercise, Submission, Feedback
from athena.logger import logger
from module_text_llm.self_consistency.self_consistency_utils import run_approach, aggregate_feedback, compute_scores, select_best_approach
import asyncio
from typing import get_args
from module_text_llm.approach_config import ApproachConfig
# Placeholder for generate suggestions logic.
async def generate_suggestions(exercise: Exercise, submission: Submission, 
                               config: ApproachConfig, debug: bool, is_graded: bool) -> List[Feedback]:
    # Common model configuration for all approaches.
    model = config.model  # type: ignore[attr-defined]

    # Have to import here to avoid circular imports.
    from module_text_llm.config import ApproachConfigUnion
    #pylint: disable=import-outside-toplevel
    from module_text_llm.self_consistency import SelfConsistencyConfig

    valid_approaches = [approach for approach in ApproachConfigUnion.__args__ if issubclass(approach, ApproachConfig)]
    approaches = {}
    for cls in get_args(ApproachConfigUnion):
        if cls is SelfConsistencyConfig:
            continue 
        key = cls.__name__.lower()
        approaches[key] = cls(model=model)
 
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
    logger.info("Scores: %s | Best approach: %s", scores, best_key)
    return results.get(best_key, [])
