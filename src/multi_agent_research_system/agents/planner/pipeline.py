from langchain_google_genai import ChatGoogleGenerativeAI
from .prompts import prompt_template
from dotenv import load_dotenv
from multi_agent_research_system.scehmas.schemas import ResearchPlan

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0
)




def build_planner_pipeline():

    structured_llm = llm.with_structured_output(
        ResearchPlan
    )

    pipeline = prompt_template | structured_llm

    return pipeline

