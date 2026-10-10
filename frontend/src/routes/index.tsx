import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpenText,
  Brain,
  ChartNoAxesCombined,
  FileSearch,
  FileText,
  GitBranch,
  Globe,
  LayersIcon,
  Link2,
  ListChecks,
  Network,
  RefreshCw,
  ScanSearch,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import researchHead from "@/assets/research-head.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "INQUIRA — From Information to Insight" },
      {
        name: "description",
        content:
          "A coordinated team of AI research agents searches, analyzes, verifies, and synthesizes source-grounded research.",
      },
      {
        property: "og:title",
        content: "INQUIRA — From Information to Insight",
      },
      {
        property: "og:description",
        content: "Search, analyze, verify, and synthesize information into structured research.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
} as any);

const agents = [
  {
    number: "01",
    name: "Planner Agent",
    description: "Breaks down the research question into focused research objectives.",
    tag: "PLANNING",
    icon: Brain,
  },
  {
    number: "02",
    name: "Search Agent",
    description: "Discovers relevant web sources to answer the research question.",
    tag: "DISCOVERY",
    icon: ScanSearch,
  },
  {
    number: "03",
    name: "Source Quality Agent",
    description: "Evaluates source relevance, credibility, and overall quality.",
    tag: "SOURCE EVALUATION",
    icon: ShieldCheck,
  },
  {
    number: "04",
    name: "Scraper Agent",
    description: "Extracts webpage content for deeper research and analysis.",
    tag: "DATA COLLECTION",
    icon: Globe,
  },
  {
    number: "05",
    name: "Reader Agent",
    description: "Identifies relevant passages and preserves their source context.",
    tag: "EXTRACTION",
    icon: BookOpenText,
  },
  {
    number: "06",
    name: "Claim Extractor",
    description: "Extracts factual claims from the collected research material.",
    tag: "CLAIM EXTRACTION",
    icon: ListChecks,
  },
  {
    number: "07",
    name: "Evidence Extractor",
    description: "Identifies evidence relevant to the claims found during research.",
    tag: "EVIDENCE EXTRACTION",
    icon: SearchCheck,
  },
  {
    number: "08",
    name: "Claim-Evidence Mapper",
    description: "Connects research claims with semantically relevant evidence.",
    tag: "EVIDENCE MAPPING",
    icon: GitBranch,
  },
  {
    number: "09",
    name: "Verification Agent",
    description: "Checks whether claims are supported, contradicted, or lack sufficient evidence.",
    tag: "VERIFICATION",
    icon: BadgeCheck,
  },
  {
    number: "10",
    name: "Synthesis Agent",
    description: "Combines verified claims and evidence into coherent research findings.",
    tag: "SYNTHESIS",
    icon: Network,
  },
  {
    number: "11",
    name: "Critic Agent",
    description: "Evaluates factuality, citation accuracy, evidence coverage, and source quality.",
    tag: "QUALITY REVIEW",
    icon: ShieldCheck,
  },
  {
    number: "12",
    name: "Targeted Research Agent",
    description: "Investigates missing evidence when the research requires further verification.",
    tag: "ITERATIVE RESEARCH",
    icon: RefreshCw,
  },
  {
    number: "13",
    name: "Writer Agent",
    description: "Transforms the synthesized findings into a structured final research report.",
    tag: "REPORT GENERATION",
    icon: FileText,
  },
];



function Index() {
  return (
    <main className="research-page">
      <div className="research-shell">
        <header className="research-header">
          <a className="research-wordmark" href="#top" aria-label="INQUIRA home">
            <span className="research-mark" aria-hidden="true">
              R
            </span>
            <span>INQUIRA</span>
          </a>
          <nav className="research-nav" aria-label="Main navigation">
            <a href="#workflow">THE METHOD</a>
            <a href="#pipeline">PIPELINE</a>
            <a className="nav-cta" href="#workflow">
              EXPLORE THE PROCESS <ArrowUpRight aria-hidden="true" />
            </a>
          </nav>
        </header>

        <section className="research-hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="hero-micro-brand">
              <span>INQUIRA / 01</span>
              <span>MULTI-AGENT RESEARCH</span>
              <span>SOURCE-GROUNDED INTELLIGENCE</span>
            </div>
            <div className="eyebrow">MULTI-AGENT RESEARCH INTELLIGENCE</div>
            <h1 className="hero-title" id="hero-title">
              <span className="title-first">FROM INFORMATION</span>
              <span className="title-second">TO INSIGHT.</span>
            </h1>
            <p className="hero-description">
              Multiple AI agents search, analyze, verify, and synthesize information into
              structured, source-grounded research.
            </p>
            <div className="hero-actions">
              <Link className="hero-button hero-button-primary" to="/research">
                Start research <ArrowRight aria-hidden="true" />
              </Link>
              <a className="hero-button hero-button-secondary" href="#workflow">
                How it works <ArrowDown aria-hidden="true" />
              </a>
            </div>
            <div className="hero-note">Built around sources. Grounded in evidence.</div>
          </div>

          <div className="hero-visual" aria-label="Knowledge assembled from research documents">
            <span className="hero-index">A system for making sense</span>
            <img
              src={researchHead}
              alt="A human profile assembled from layered research papers, diagrams, and evidence"
              width={1280}
              height={1280}
              fetchPriority="high"
            />
            <span className="visual-status">
              SEARCH&nbsp; · &nbsp;ANALYSIS&nbsp; · &nbsp;VERIFICATION&nbsp; · &nbsp;SYNTHESIS
            </span>
          </div>
        </section>
      </div>

      <div className="hero-cut" aria-hidden="true" />

      <section className="workflow-section" id="workflow" aria-labelledby="workflow-title">
        <div className="research-shell">
          <div className="workflow-head">
            <div>
              <div className="section-kicker">Five roles. One shared inquiry.</div>
              <h2 className="workflow-title" id="workflow-title">
                Research, in concert.
              </h2>
            </div>
            <p className="workflow-intro">
              Each specialist adds a layer of rigor, carrying scattered information toward a clear,
              traceable answer.
            </p>
          </div>

          <div className="agent-pipeline">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <article className="agent-card" key={agent.number}>
                  <div className="agent-topline">
                    <span className="agent-icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="agent-number">{agent.number}</span>
                  </div>
                  <div>
                    <h3 className="agent-title">{agent.name}</h3>
                    <p className="agent-description">{agent.description}</p>
                  </div>
                  <span className="agent-tag">{agent.tag}</span>
                </article>
              );
            })}
          </div>

          <div className="workflow-meta">
            <span>Sources in. Evidence through.</span>
            <span>
              <FileSearch aria-hidden="true" /> Traceable at every step.
            </span>
          </div>
        </div>
      </section>

     

    </main>
  );
}

