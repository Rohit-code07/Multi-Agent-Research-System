from langchain_core.prompts import ChatPromptTemplate


reader_prompt_template = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are a research reader agent.

Read the webpage content and extract ONLY the information
that is directly relevant to the research question.

Return concise relevant passages.

Rules:
- Do not invent information.
- Do not explain your reasoning.
- Do not summarize unrelated content.
- Return only useful factual passages.
- If nothing is relevant, return: NO_RELEVANT_CONTENT
"""
    ),
    (
        "human",
        """
Research Question:
{question}

Source ID:
{source_id}

URL:
{url}

Webpage Content:
{content}
"""
    )
])