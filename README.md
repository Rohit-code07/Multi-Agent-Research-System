# INQUIRA

### Multi-Agent Research & Evidence Verification System

INQUIRA is a **LangGraph-based multi-agent research system** that transforms complex user queries into structured, evidence-backed research reports.

Instead of using a single LLM call, INQUIRA divides the research process into specialized agents for **planning, search, source evaluation, reading, claim extraction, evidence mapping, verification, synthesis, and critique**.

---

## Architecture

<img width="645" height="1981" alt="Untitled Diagram drawio" src="https://github.com/user-attachments/assets/c6aa1ec8-e1be-4d9a-8771-97fe3c697fdc" />

## Key Features

* **Multi-Agent Research Pipeline** using LangGraph
* **Query Decomposition** for complex research questions
* **Source Quality Evaluation** based on relevance and credibility
* **Web Scraping & Relevant Passage Extraction**
* **Claim ↔ Evidence Mapping** using semantic similarity
* **Claim Verification**: Supported, Partially Supported, Contradicted, or Insufficient Evidence
* **Critic Agent** for research-quality evaluation
* **Targeted Research Loop** for missing evidence
* **Local LLM Support** through Ollama

---

## Tech Stack

```text
Python
LangGraph
LangChain
Ollama
Qwen3 8B
Tavily
BeautifulSoup
Sentence Transformers
Pydantic
FastAPI
```

---

## Installation

```bash
git clone https://github.com/Rohit-code07/INQUIRA.git
cd INQUIRA

uv venv
uv sync
```

Install Ollama model:

```bash
ollama pull qwen3:8b
```

Add your Tavily key to `.env`:

```env
TAVILY_API_KEY=your_api_key
```

---

## Example

**Input**

```text
What are the major impacts of artificial intelligence on software development?
```

**Output**

```text
Research Plan
    ↓
Verified Claims
    ↓
Supporting Evidence
    ↓
Synthesized Findings
    ↓
Final Research Report
```

---

## Project Goal

INQUIRA focuses on making AI-powered research more **structured, traceable, and evidence-driven** by connecting:

```text
Source → Passage → Claim → Evidence → Verification → Finding
```

---

## Author

**Rohit Verma**

GitHub: https://github.com/Rohit-code07

