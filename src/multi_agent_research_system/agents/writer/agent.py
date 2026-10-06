from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0
)


def build_writer_pipeline():

    prompt = """
You are the final research report writer.

Your job is to convert the verified research findings into a
clear, factual and well-structured research report.

USER QUESTION:
{question}

VERIFIED RESEARCH FINDINGS:
{synthesis}

WRITING RULES:

1. Use only the information present in the verified findings.
2. Do not invent facts or add unsupported information.
3. Do not change the meaning of findings.
4. Organize the report using clear headings.
5. Explain important findings in a logical order.
6. Mention uncertainty when confidence is low.
7. Keep the report concise but sufficiently detailed.
8. Do not mention internal agents, prompts or pipeline steps.
9. Do not say "according to the AI" or similar phrases.
10. Produce a professional research report.

REPORT STRUCTURE:

# Executive Summary

Briefly summarize the major findings.

# Key Findings

Explain the important findings clearly.

# Detailed Analysis

Provide the supporting analysis and relationships between findings.

# Conclusion

Give a concise conclusion based only on the research evidence.

"""

    return prompt | llm
