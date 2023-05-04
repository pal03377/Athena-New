import asyncio
import json
from typing import List

from athena import Feedback, ProgrammingExercise, Submission
from athena.helpers import get_repositories

from langchain.chains import LLMChain
from langchain.chat_models import PromptLayerChatOpenAI
from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)

from ..helpers.utils import get_diff, load_files_from_repo, add_line_numbers
from ..feedback_provider_registry import register_feedback_provider


@register_feedback_provider("basic")
def suggest_feedback(exercise: ProgrammingExercise, submission: Submission) -> List[Feedback]:
    chat = PromptLayerChatOpenAI(pl_tags=["basic"])
    input_list: List[dict] = []

    # Feature extraction
    with get_repositories(exercise.solution_repository_url, exercise.template_repository_url, submission.content) as repositories:
        solution_repo, template_repo, submission_repo = repositories
        
        # TODO file_filter
        for file_path, submission_content in load_files_from_repo(submission_repo, file_filter=lambda x: x.endswith(".java")).items():
            if submission_content is None:
                continue
            
            submission_content = add_line_numbers(submission_content)
            solution_to_submission_diff = get_diff(src_repo=solution_repo, dst_repo=submission_repo, src_prefix="solution", dst_prefix="submission", file_path=file_path)
            template_to_submission_diff = get_diff(src_repo=template_repo, dst_repo=submission_repo, src_prefix="template", dst_prefix="submission", file_path=file_path)

            input_list.append({
                "file_path": file_path,
                "submission_content": submission_content,
                "solution_to_submission_diff": solution_to_submission_diff,
                "template_to_submission_diff": template_to_submission_diff
            })

    # Prompt building
    system_template = (
        'You are a programming tutor AI at a university tasked with grading and providing feedback to homework assignments.\n'
        '\n'
        'You receive a submission with some other information and respond with the following JSON format:\n'
        '[{{"text": <feedback_comment>, "credits": <number>, "line": <nullable line number (no range)>}}]\n'
        'Extremely Important: The response should only contain the json object with the feedback, nothing else!\n'
        '\n'
        'Effective feedback for programming assignments should possess the following qualities:\n'
        '1. Constructive: Provide guidance on how to improve the code, pointing out areas that can be optimized, refactored, or enhanced.\n'
        '2. Specific: Highlight exact lines or sections of code that need attention, and suggest precise changes or improvements.\n'
        '3. Balanced: Recognize and praise the positive aspects of the code, while also addressing areas for improvement, to encourage and motivate the student.\n'
        '4. Clear and concise: Use straightforward language and avoid overly technical jargon, so that the student can easily understand the feedback.\n'
        '5. Actionable: Offer practical suggestions for how the student can apply the feedback to improve their code, ensuring they have a clear path forward.\n'
        '6. Educational: Explain the reasoning behind the suggestions, so the student can learn from the feedback and develop their programming skills.\n'
        '\n'
        'Example response:\n'
        '['
        '{{"text": "Great use of the compareTo method for comparing Dates, which is the proper way to compare objects.", "credits": 3, "line": 14}},'
        '{{"text": "Good job implementing the BubbleSort algorithm for sorting Dates. It shows a clear understanding of the sorting process", "credits": 5, "line": null}},'
        '{{"text": "Incorrect use of \'==\' for string comparison, which leads to unexpected results. Use the \'equals\' method for string comparison instead.", "credits": -2, "line": 18}}'
        ']\n'
        '\n'
        'The credits\' absolute total should be 10!' # TODO grading instruction
    )
    human_template = (
        'Student\'s submission to grade:\n'
        '{submission_content}\n'
        'Diff between solution (deletions) and student\'s submission (additions):\n'
        '{solution_to_submission_diff}\n'
        'Diff between template (deletions) and student\'s submission (additions):\n'
        '{template_to_submission_diff}\n'
        '\n'
        'JSON response:\n'
    )
    
    system_message_prompt = SystemMessagePromptTemplate.from_template(system_template)
    human_message_prompt = HumanMessagePromptTemplate.from_template(human_template)
    chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt, human_message_prompt])

    # Completion
    chain = LLMChain(llm=chat, prompt=chat_prompt)
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    result = loop.run_until_complete(chain.agenerate(input_list))

    # Parse result
    feedback_proposals: List[Feedback] = []
    for input, generations in zip(input_list, result.generations):
        file_path = input["file_path"]
        for generation in generations:
            try:
                feedbacks = json.loads(generation.text)
                if not isinstance(feedbacks, list):
                    print("Failed to parse feedback json:", generation.text)
                    continue

                for feedback in feedbacks:
                    line = feedback.get("line", None)
                    text = f"File {file_path} at line {line}" if line is not None else f"File {file_path}"
                    detail_text = feedback.get("text", "")
                    reference = f"file://{file_path}_line:{line}" if line is not None else None
                    credits = feedback.get("credits", 0.0)
                    feedback_proposals.append(
                        Feedback(
                            id=1,
                            exercise_id=exercise.id,
                            submission_id=submission.id,
                            detail_text=detail_text,
                            text=text,
                            reference=reference,
                            credits=credits,
                            meta={},
                        )
                    )
            except json.JSONDecodeError:
                print("Failed to parse feedback json:", generation.text)

    return feedback_proposals