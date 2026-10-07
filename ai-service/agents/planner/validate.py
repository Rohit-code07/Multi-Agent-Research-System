from .pipeline import ResearchPlan


def validate_research_plan(plan: ResearchPlan) -> ResearchPlan:

    if not plan.questions:
        raise ValueError("Planner returned no research questions")

    if len(plan.questions) > 7:
        raise ValueError("Too many research questions")

    questions = [
        q.question.strip()
        for q in plan.questions
    ]

    # Empty questions
    if any(not q for q in questions):
        raise ValueError("Empty research question found")

    # Duplicate questions
    normalized = [
        q.lower()
        for q in questions
    ]

    if len(normalized) != len(set(normalized)):
        raise ValueError("Duplicate research questions found")

    return plan