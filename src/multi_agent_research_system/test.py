from multi_agent_research_system.agents.Graph.research_graph import build_research_graph


graph = build_research_graph()

print("GRAPH BUILT")

result = graph.invoke({
    "question": "What are the major impacts of artificial intelligence on software development?"
})

print("\n===== FINAL REPORT =====\n")
print(result.get("final_report"))