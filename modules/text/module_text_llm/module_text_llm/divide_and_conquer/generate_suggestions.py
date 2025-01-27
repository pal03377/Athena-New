from athena.text import Exercise, Submission, Feedback
from athena.logger import logger
from llm_core.utils.llm_utils import get_chat_prompt_with_formatting_instructions
from llm_core.utils.predict_and_parse import predict_and_parse
from module_text_llm.divide_and_conquer.prompt_generate_suggestions import AssessmentModel, FeedbackModel, double_curly_braces, get_system_prompt, get_human_message
from module_text_llm.approach_config import ApproachConfig
from module_text_llm.helpers.utils import add_sentence_numbers, get_index_range_from_line_range
import asyncio
  
# Placeholder for generate suggestions logic.
async def generate_suggestions(exercise: Exercise, submission: Submission, config: ApproachConfig, debug: bool, is_graded: bool):
    submission_text = double_curly_braces(submission.text)
    model = config.model.get_model()  # type: ignore[attr-defined]
    prompt_input = {
        "submission": add_sentence_numbers(submission_text)
    }

    grading_criteria = exercise.grading_criteria
    feedbacks = []
    grading_instruction_ids = set(
        grading_instruction.id 
        for criterion in exercise.grading_criteria or [] 
        for grading_instruction in criterion.structured_grading_instructions
    )
    tasks = []
    for idx, criteria in enumerate(grading_criteria):
        if(criteria.title == "Plagiarism" or criteria.title == "plagiarism"): # Exclude plagarism because the model cannot know and it hallucinates
            continue
        usage_count, system_prompt = get_system_prompt(idx,exercise, criteria)
        if(usage_count == 1):
            chat_prompt = get_chat_prompt_with_formatting_instructions(model = model, system_message = system_prompt,human_message = get_human_message(),pydantic_object = FeedbackModel)
            tasks.append(process_criteria(FeedbackModel, model, chat_prompt, prompt_input, exercise, submission, grading_instruction_ids, is_graded,criteria.title))    
        else:
            chat_prompt = get_chat_prompt_with_formatting_instructions(model = model, system_message = system_prompt,human_message= get_human_message(),pydantic_object = AssessmentModel)
            tasks.append(process_criteria(AssessmentModel, model, chat_prompt, prompt_input, exercise, submission, grading_instruction_ids, is_graded,criteria.title))

    results = await asyncio.gather(*tasks)

    # Flatten the list of feedbacks
    for feedback_list in results:
        feedbacks += feedback_list
    print(feedbacks)
    return feedbacks

async def process_criteria(pydantic_object, model, chat_prompt, prompt_input, exercise, submission, grading_instruction_ids, is_graded,criteria_title):
    # Call the predict_and_parse method
    result = await predict_and_parse(
        model=model, 
        chat_prompt=chat_prompt, 
        prompt_input=prompt_input, 
        pydantic_object=pydantic_object,
        tags=[
            f"exercise-{exercise.id}",
            f"submission-{submission.id}",
        ],
        use_function_calling=True
    )

    if pydantic_object is AssessmentModel:
        try:
            return parse_assessment_result(result, exercise, submission, grading_instruction_ids, is_graded,criteria_title)
        except Exception as e:
            logger.info("Failed to parse assessment result")
            return []
    else:
        try:
            return parse_feedback_result(result, exercise, submission, grading_instruction_ids, is_graded,criteria_title)
        except Exception as e:
            logger.info("Failed to parse feedback result")
            return []

def parse_assessment_result(result, exercise, submission, grading_instruction_ids, is_graded,criteria_title):
    result_feedbacks = []
    for feedback in result.assessment:
        result_feedbacks += parse_feedback_result(feedback, exercise, submission, grading_instruction_ids, is_graded,criteria_title)
    return result_feedbacks

def parse_feedback_result(feedback, exercise, submission, grading_instruction_ids, is_graded,criteria_title):
    result_feedbacks = []

    index_start, index_end = get_index_range_from_line_range(
        feedback.line_start, feedback.line_end, submission.text
    )
    assessment_instruction_id = (
        feedback.assessment_instruction_id 
        if feedback.assessment_instruction_id in grading_instruction_ids 
        else None
    )
    result_feedbacks.append(Feedback(
        exercise_id=exercise.id,
        submission_id=submission.id,
        title=feedback.criteria,
        description=feedback.feedback,
        index_start=index_start,
        index_end=index_end,
        credits=feedback.credits,
        is_graded=is_graded,
        structured_grading_instruction_id=assessment_instruction_id,
        meta={}
    ))
    return result_feedbacks
