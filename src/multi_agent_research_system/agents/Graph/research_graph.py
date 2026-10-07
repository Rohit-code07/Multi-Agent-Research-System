from langgraph.graph import StateGraph, START, END

from .state import ResearchState

from multi_agent_research_system.agents.planner.pipeline import (
    build_planner_pipeline
)
from multi_agent_research_system.agents.search.tool import (
    web_search
)
from multi_agent_research_system.agents.writer.agent import (
    build_writer_pipeline
)
from multi_agent_research_system.agents.source.agent import (
    build_source_agent
)

from multi_agent_research_system.agents.Scrapper.scrapping_agent import (
    build_scraper_agent
)

from multi_agent_research_system.agents.Reader.pipeline import (
    build_reader_pipeline
)

from multi_agent_research_system.agents.Claim_extractor.pipeline import (
    build_claim_extractor
)

from multi_agent_research_system.agents.Evidence.pipeline import (
    build_evidence_extractor
)

from multi_agent_research_system.agents.verfication.pipeline import (
    verify_claims
)

from multi_agent_research_system.agents.synthesizer.pipeline import (
    build_synthesizer_pipeline
)

from multi_agent_research_system.agents.Critic.pipeline import (
    build_critic_pipeline
)

from multi_agent_research_system.agents.mapped_evidence.embedding_search import (
    build_claim_evidence_mapping
)

from multi_agent_research_system.agents.scehmas.schemas import (
    ResearchPlan,
    ResearchQuestion
)


# =========================================================
# PLANNER
# =========================================================
def planner_node(state):
    planner = build_planner_pipeline()

    plan = planner.invoke({
        "user_query": state["question"]
    })

    return {
        "plan": plan
    }
# =========================================================
# INITIAL SEARCH
# =========================================================

def search_node(state):
    search_results = web_search.invoke({
        "query": state["plan"]
    })

    return {
        "search_results": search_results
    }

# =========================================================
# SOURCE QUALITY
# =========================================================

def source_node(state):

    quality_results = build_source_agent(
        state["search_results"]
    )

    return {
        "quality_results": quality_results
    }


# =========================================================
# SCRAPER
# =========================================================
def scraper_node(state):
    scraped_data = build_scraper_agent(
        state["quality_results"]
    )

    return {
        "scraped_data": scraped_data
    }

# =========================================================
# READER
# =========================================================

def reader_node(state):

    reader_results = build_reader_pipeline(
        state["question"],
        state["scraped_data"]
    )

    return {
        "reader_results": reader_results
    }


# =========================================================
# CLAIM EXTRACTION
# =========================================================

def claim_node(state):

    claims = build_claim_extractor(
        state["question"],
        state["reader_results"]
    )

    return {
        "claims": claims
    }


# =========================================================
# EVIDENCE EXTRACTION
# =========================================================

def evidence_node(state):

    evidence = build_evidence_extractor(
        state["claims"],
        state["reader_results"]
    )

    return {
        "evidence": evidence
    }


# =========================================================
# CLAIM ↔ EVIDENCE MAPPING
# =========================================================

def mapping_node(state):

    mappings = build_claim_evidence_mapping(
        state["claims"],
        state["evidence"]
    )

    return {
        "mappings": mappings
    }


# =========================================================
# VERIFICATION
# =========================================================

def verification_node(state):

    verifications = verify_claims(
        state["claims"],
        state["evidence"],
        state["mappings"]
    )

    return {
        "verifications": verifications
    }


# =========================================================
# SYNTHESIS
# =========================================================

def synthesis_node(state):

    synthesis = build_synthesizer_pipeline(
        state["question"],
        state["claims"],
        state["evidence"],
        state["verifications"]
    )

    return {
        "synthesis": synthesis
    }


# =========================================================
# CRITIC
# =========================================================

def critic_node(state):

    critique = build_critic_pipeline(
        state["question"],
        state["synthesis"],
        state["claims"],
        state["evidence"],
        state["verifications"]
    )

    current_iteration = state.get("iteration", 0)

    return {
        "critique": critique,
        "iteration": current_iteration + 1
    }


# =========================================================
# TARGETED RESEARCH
# =========================================================

def targeted_search_node(state):

    critique = state["critique"]

    missing_evidence = critique.missing_evidence

    # Maximum 3 targeted queries
    queries = [
        f"{state['question']} {item}"
        for item in missing_evidence[:3]
    ]

    # Safety check
    if not queries:
        return {
            "targeted_queries": [],
            "targeted_results": []
        }

    # Convert targeted queries into ResearchPlan
    targeted_plan = ResearchPlan(
        questions=[
            ResearchQuestion(
                question=query,
                objective="Find evidence for the missing research point.",
                priority=5
            )
            for query in queries
        ]
    )

    targeted_results = web_search.invoke(
        targeted_plan
    )

    return {
        "targeted_queries": queries,
        "targeted_results": targeted_results
    }


# =========================================================
# MERGE INITIAL + TARGETED SEARCH RESULTS
# =========================================================

def merge_search_results_node(state):

    existing_results = state.get(
        "search_results",
        []
    )

    targeted_results = state.get(
        "targeted_results",
        []
    )

    # Make sure both are lists
    if not isinstance(existing_results, list):
        existing_results = [existing_results]

    if not isinstance(targeted_results, list):
        targeted_results = [targeted_results]

    # Combine
    merged_results = (
        existing_results +
        targeted_results
    )

    # Remove duplicate URLs
    unique_results = []
    seen_urls = set()

    for result in merged_results:

        if not result:
            continue

        url = result.url

        if url not in seen_urls:

            unique_results.append(result)

            seen_urls.add(url)

    return {
        "search_results": unique_results
    }


# =========================================================
# ROUTING AFTER CRITIC
# =========================================================

def route_after_critic(state):

    critique = state["critique"]

    iteration = state.get(
        "iteration",
        0
    )

    # ---------------------------------
    # Condition 1: Quality is good
    # ---------------------------------

    if critique.overall >= 0.75:
        return "writer"

    # ---------------------------------
    # Condition 2: Maximum iterations
    # ---------------------------------

    if iteration >= 2:
        return "writer"

    # ---------------------------------
    # Condition 3: Nothing missing
    # ---------------------------------

    if not critique.missing_evidence:
        return "writer"

    # ---------------------------------
    # Condition 4: Need more research
    # ---------------------------------

    return "targeted_search"


# =========================================================
# WRITER
# =========================================================

def writer_node(state):

    writer = build_writer_pipeline()

    final_report = writer.invoke({
        "question": state["question"],
        "synthesis": state["synthesis"]
    })

    return {
        "final_report": final_report.content
    }
# =========================================================
# BUILD RESEARCH GRAPH
# =========================================================

def build_research_graph():

    graph = StateGraph(
        ResearchState
    )

    # =====================================================
    # NODES
    # =====================================================

    graph.add_node(
        "planner",
        planner_node
    )

    graph.add_node(
        "search",
        search_node
    )

    graph.add_node(
        "source",
        source_node
    )

    graph.add_node(
        "scraper",
        scraper_node
    )

    graph.add_node(
        "reader",
        reader_node
    )

    graph.add_node(
        "claim",
        claim_node
    )

    graph.add_node(
        "evidence",
        evidence_node
    )

    graph.add_node(
        "mapping",
        mapping_node
    )

    graph.add_node(
        "verification",
        verification_node
    )

    graph.add_node(
        "synthesis",
        synthesis_node
    )

    graph.add_node(
        "critic",
        critic_node
    )

    graph.add_node(
        "targeted_search",
        targeted_search_node
    )

    graph.add_node(
        "merge_search",
        merge_search_results_node
    )

    graph.add_node(
        "writer",
        writer_node
    )

    # =====================================================
    # MAIN PIPELINE
    # =====================================================

    graph.add_edge(
        START,
        "planner"
    )

    graph.add_edge(
        "planner",
        "search"
    )

    graph.add_edge(
        "search",
        "source"
    )

    graph.add_edge(
        "source",
        "scraper"
    )

    graph.add_edge(
        "scraper",
        "reader"
    )

    graph.add_edge(
        "reader",
        "claim"
    )

    graph.add_edge(
        "claim",
        "evidence"
    )

    graph.add_edge(
        "evidence",
        "mapping"
    )

    graph.add_edge(
        "mapping",
        "verification"
    )

    graph.add_edge(
        "verification",
        "synthesis"
    )

    graph.add_edge(
        "synthesis",
        "critic"
    )

    # =====================================================
    # CRITIC → CONDITIONAL ROUTING
    # =====================================================

    graph.add_conditional_edges(
        "critic",
        route_after_critic,
        {
            "writer": "writer",
            "targeted_search": "targeted_search"
        }
    )

    # =====================================================
    # TARGETED RESEARCH LOOP
    # =====================================================

    graph.add_edge(
        "targeted_search",
        "merge_search"
    )

    graph.add_edge(
        "merge_search",
        "source"
    )

    # =====================================================
    # FINAL
    # =====================================================

    graph.add_edge(
        "writer",
        END
    )

    # =====================================================
    # COMPILE
    # =====================================================

    return graph.compile()