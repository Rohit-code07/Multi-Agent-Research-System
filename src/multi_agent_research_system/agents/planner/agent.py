from langchain_core.runnables import RunnableLambda

from multi_agent_research_system.agents.planner.pipeline import build_planner_pipeline
from multi_agent_research_system.agents.planner.validate import validate_research_plan


def build_planner_agent():
    planner_pipeline = build_planner_pipeline()
    return planner_pipeline | RunnableLambda(
        validate_research_plan
    )
planner_agent = build_planner_agent()

result = planner_agent.invoke(
    {"user_query": "What are the latest advancements in renewable energy technologies, and how do they impact global energy sustainability?"}
)

print(result)
