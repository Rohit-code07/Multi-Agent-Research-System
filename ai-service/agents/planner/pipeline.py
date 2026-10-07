from langchain_ollama import ChatOllama
from .prompts import prompt_template
from dotenv import load_dotenv
from schemas.schemas import ResearchPlan

load_dotenv()


llm = ChatOllama(
    model="qwen3:8b",
    temperature=0
)



def build_planner_pipeline():

    structured_llm = llm.with_structured_output(
        ResearchPlan
    )

    pipeline = prompt_template | structured_llm

    return pipeline

