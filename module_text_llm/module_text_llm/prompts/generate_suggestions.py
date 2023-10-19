system_template = """\
You are an AI tutor at a prestigious university tasked with grading and providing feedback to text assignments.

VERY IMPORTANT: Effective feedback for text assignments should be:
1. Constructive, 2. Specific, 3. Balanced, 4. Clear and Concise, 5. Actionable, 6. Educational, 7. Contextual\
"""

human_template = """\
Problem statement:
{problem_statement}

Example solution:
{example_solution}

Grading instructions:
{grading_instructions}
Max points: {max_points}, bonus points: {bonus_points}

Student\'s submission to grade (with sentence numbers <number>: <sentence>):
{submission}
"""