from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from multi_agent_research_system.agents.scehmas.schemas import ClaimEvidence
model = SentenceTransformer("all-mpnet-base-v2")


def build_claim_evidence_mapping(claims, evidence):
    claim_texts = [c.claim for c in claims.claims]
    evidence_texts = [e.text for e in evidence.evidence]

    claim_embeddings = model.encode(claim_texts)
    evidence_embeddings = model.encode(evidence_texts)

    similarity_matrix = cosine_similarity(
        claim_embeddings,
        evidence_embeddings
    )

    mappings = []

    for i, claim in enumerate(claims.claims):

        ranked_indices = similarity_matrix[i].argsort()[::-1]

        selected = [
            idx for idx in ranked_indices
            if similarity_matrix[i][idx] >= 0.70
        ][:3]

        mappings.append(
            ClaimEvidence(
                claim_id=claim.claim_id,
                evidence_ids=[
                    evidence.evidence[idx].evidence_id
                    for idx in selected
                ]
            )
        )

    return mappings