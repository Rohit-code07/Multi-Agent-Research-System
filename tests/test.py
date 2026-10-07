import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'ai-service'))

from agents.graph.research_graph import build_research_graph


graph = build_research_graph()

print("GRAPH BUILT")

result = graph.invoke({
    "question": "What are the major impacts of artificial intelligence on software development?"
})

print("\n===== FINAL REPORT =====\n")
print(result.get("final_report"))