# 🔎 INQUIRA

### Multi-Agent Research & Evidence Verification System

**From complex questions to evidence-backed research.**

INQUIRA is a LangGraph-based multi-agent research system that transforms complex user queries into structured, traceable, and evidence-backed research reports.

Instead of relying on a single LLM response, INQUIRA coordinates specialized agents to plan research, discover and evaluate sources, extract relevant information, map claims to evidence, verify findings, and refine the final report.

The goal is simple: **make AI-powered research more structured, transparent, and verifiable.**

---

## ✨ Key Features

* 🧠 **Intelligent Query Decomposition** — Breaks complex questions into focused research tasks.
* 🔍 **Multi-Agent Research Pipeline** — Coordinates specialized agents using LangGraph.
* 🌐 **Web Search & Scraping** — Discovers relevant sources and extracts useful passages.
* 📊 **Source Quality Evaluation** — Evaluates sources based on relevance and credibility signals.
* 📝 **Claim Extraction** — Identifies key claims from collected research material.
* 🔗 **Claim–Evidence Mapping** — Connects extracted claims with relevant supporting passages.
* ✅ **Evidence-Based Verification** — Classifies claims as Supported, Partially Supported, Contradicted, or Insufficient Evidence.
* 🔄 **Targeted Research Loop** — Searches for additional evidence when existing research is insufficient.
* 🧐 **Critic Agent** — Evaluates research quality and identifies areas that need improvement.
* 🖥️ **Local LLM Support** — Supports local inference through Ollama and Qwen3 8B.

---

### Research Workflow

```text
                    User Query
                        │
                        ▼
                Query Decomposition
                        │
                        ▼
                 Research Planning
                        │
                        ▼
                 Parallel Web Search
                        │
                        ▼
                Source Quality Evaluation
                        │
                        ▼
                Relevant Passage Extraction
                        │
                        ▼
                    Claim Extraction
                        │
                        ▼
                 Claim–Evidence Mapping
                        │
                        ▼
                  Claim Verification
                        │
               ┌────────┴────────┐
               │                 │
        Evidence Missing    Evidence Sufficient
               │                 │
               ▼                 ▼
        Targeted Research      Synthesis
               │                 │
               └─── Re-evaluate  ▼
                         Research Critique
                                │
                                ▼
                         Final Research Report
```

*The workflow above describes the intended research process; the implementation may evolve as the project develops.*

---

## 🔬 How It Works

INQUIRA organizes research around an evidence-tracing pipeline:

**Source → Passage → Claim → Evidence → Verification → Finding**

1. **Plan:** Decompose the user's question into focused research questions.
2. **Search:** Retrieve potentially relevant web sources.
3. **Evaluate:** Assess source relevance and credibility signals.
4. **Read:** Extract useful passages from the collected sources.
5. **Extract:** Identify claims that contribute to answering the research question.
6. **Map:** Associate claims with relevant evidence.
7. **Verify:** Determine whether the collected evidence supports, partially supports, contradicts, or fails to establish each claim.
8. **Research Again:** Conduct targeted searches for important evidence gaps.
9. **Synthesize:** Combine verified findings into a coherent report.
10. **Critique:** Evaluate the report and identify areas requiring improvement.

The objective is to make research findings easier to trace back to their supporting sources rather than treating an LLM-generated answer as automatically reliable.

---

## 🛠️ Tech Stack

| Technology            | Purpose                                   |
| --------------------- | ----------------------------------------- |
| Python                | Core application logic                    |
| LangGraph             | Multi-agent workflow orchestration        |
| LangChain             | LLM and tool integration                  |
| Ollama                | Local LLM inference                       |
| Qwen3 8B              | Local language model                      |
| Tavily                | Web search                                |
| BeautifulSoup         | Webpage parsing and content extraction    |
| Sentence Transformers | Semantic similarity and evidence matching |
| Pydantic              | Data validation and structured outputs    |
| FastAPI               | API layer                                 |

---

## 🚀 Getting Started

### Prerequisites

Before running INQUIRA, make sure you have:

* Python installed
* [uv](https://docs.astral.sh/uv/) for Python dependency management
* [Ollama](https://ollama.com/) installed
* A Tavily API key

### 1. Clone the Repository

```bash
git clone https://github.com/Rohit-code07/INQUIRA.git
cd INQUIRA
```

### 2. Create the Environment

```bash
uv venv
```

Activate the environment if required.

**Windows PowerShell:**

```powershell
.venv\Scripts\Activate.ps1
```

**Linux / macOS:**

```bash
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
uv sync
```

### 4. Download the Local Model

```bash
ollama pull qwen3:8b
```

Make sure Ollama is running before executing research tasks.

### 5. Configure Environment Variables

Create a `.env` file in the project's expected configuration directory and add your Tavily API key:

```env
TAVILY_API_KEY=your_api_key_here
```

Keep your API keys private. Never commit your actual `.env` file or expose credentials in source code.

### 6. Run the Application

Start INQUIRA using the project's configured entry point.

> **Note:** Update this section with the exact command for your current implementation, such as the FastAPI/Uvicorn command, once the entry point is finalized.

---

## 💡 Example Use Case

**Research Question**

```text
What are the major impacts of artificial intelligence on software development?
```

INQUIRA is designed to transform the question into a structured research process:

```text
User Question
     │
     ▼
Research Plan
     │
     ▼
Collected Sources
     │
     ▼
Extracted Claims
     │
     ▼
Supporting & Contradicting Evidence
     │
     ▼
Verified Findings
     │
     ▼
Synthesized Research Report
```

A research report can include findings, supporting evidence, source references, and claims requiring further investigation.

*The final output depends on the available sources, model responses, and implemented verification logic.*

---

## 🎯 Project Goals

INQUIRA explores how multi-agent systems can improve the structure and traceability of AI-assisted research.

The project focuses on:

* Breaking complex questions into manageable research tasks.
* Separating information retrieval from claim verification.
* Connecting findings to identifiable supporting evidence.
* Identifying contradictory information and research gaps.
* Using iterative research and critique to improve report quality.
* Supporting local LLM inference for greater control over model execution.

**Important:** Evidence verification does not guarantee that a claim is objectively true. Source quality, retrieval coverage, model limitations, and the accuracy of the verification process can still affect the results.

---

## 🤝 Contributing to INQUIRA

INQUIRA is an open-source project, and **contributions from developers, researchers, and AI enthusiasts are welcome!**

Whether you're fixing a bug, improving the research pipeline, adding a feature, or improving the documentation, your contribution can help make INQUIRA better.

### Ways to Contribute

Here are some areas where contributions could be valuable:

* **Agent Development:** Improve planning, search, reading, synthesis, or critique agents.
* **Evidence Verification:** Improve claim–evidence matching and contradiction detection.
* **Source Evaluation:** Explore better ways to assess source relevance and credibility.
* **Research Quality:** Add evaluation datasets, test cases, and quality metrics.
* **Search & Retrieval:** Improve search strategies, passage extraction, and duplicate-source handling.
* **Local Model Support:** Improve Ollama integration and compatibility with local models.
* **Testing & Reliability:** Add unit tests, integration tests, and error-handling improvements.
* **Documentation:** Improve setup instructions, examples, and developer documentation.
* **Performance:** Reduce unnecessary model calls and improve retrieval efficiency.

### How to Contribute

1. **Fork** the repository.

2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Implement your change.

4. Run the available tests and verify your changes.

5. Commit your work:

   ```bash
   git add .
   git commit -m "Add: describe your contribution"
   ```

6. Push your branch:

   ```bash
   git push origin feature/your-feature-name
   ```

7. Open a **Pull Request** describing your changes, the problem they solve, and any relevant test results.

For significant changes, consider opening an issue first to discuss the proposed approach.

### Contribution Guidelines

* Keep changes focused and easy to review.
* Follow the existing code style and project structure.
* Include tests when introducing or modifying functionality.
* Never commit API keys, credentials, or private data.
* Document new configuration options and dependencies.
* Be respectful and constructive during discussions and code reviews.

**New to open source? You're welcome here!** Small improvements, documentation fixes, and bug reports are valuable contributions too.

---

## 🗺️ Roadmap

Potential future improvements include:

* [ ] Automated evaluation of research reports.
* [ ] Better detection of conflicting claims across sources.
* [ ] More robust source credibility and relevance scoring.
* [ ] Improved retry logic and handling of failed web requests.
* [ ] Support for additional local and hosted LLM providers.
* [ ] Unit and integration test coverage for the research pipeline.
* [ ] Structured report export with source references.
* [ ] Performance improvements through optimized retrieval and model usage.

*This roadmap represents potential directions for development, not a guarantee that these features are already implemented.*

---

## 👨‍💻 Author

**Rohit Verma**

* GitHub: [@Rohit-code07](https://github.com/Rohit-code07)
* Project Repository: [INQUIRA](https://github.com/Rohit-code07/INQUIRA)

---

## ⭐ Support the Project

If you find INQUIRA interesting:

* ⭐ Star the repository.
* 🐛 Report bugs and suggest improvements.
* 💡 Propose new ideas through GitHub Issues.
* 🤝 Contribute through Pull Requests.
* 📢 Share the project with developers interested in multi-agent AI systems.

**Built to explore a more structured, traceable, and evidence-driven approach to AI research.**

