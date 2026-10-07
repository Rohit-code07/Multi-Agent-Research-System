from langchain_core.prompts import ChatPromptTemplate


source_prompt_template = ChatPromptTemplate.from_messages([
    (
        "system",
        """
You are a source quality evaluation agent.

Evaluate ONE web source.

Return:

- relevance: integer from 1 to 5
- credibility: integer from 1 to 5
- quality_score: integer from 1 to 5
- reason: short explanation

Do not invent information.
Evaluate only the provided source.
"""
    ),
    (
        "human",
        """
Title:
{title}

URL:
{url}

Snippet:
{snippet}
"""
    )
])