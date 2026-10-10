import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleCheck,
  CircleDashed,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  History as HistoryIcon,
  LoaderCircle,
  Play,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  downloadResearchReport,
  type ReportExportFormat,
} from "@/lib/report-export";
import {
  type AgentStatus,
  type AgentDefinition,
  type ResearchSource,
  demoAgents,
  demoResearchQuestion,
} from "@/lib/research-demo";
import { ResearchService, type ResearchSession } from "@/services/research";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research workspace — INQUIRA" },
      {
        name: "description",
        content:
          "Explore an interactive, multi-agent research demonstration with progressive evidence, source citations, and a structured report.",
      },
      { property: "og:title", content: "Research workspace — INQUIRA" },
      {
        property: "og:description",
        content:
          "Search, read, analyze, verify, and synthesize source-grounded research in an interactive demonstration.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchWorkspace,
});

const workflowStages = [
  "Planning",
  "Searching",
  "Analyzing Sources",
  "Extracting Evidence",
  "Verifying Claims",
  "Synthesizing Findings",
  "Quality Review",
  "Generating Report",
];

function ResearchWorkspace() {
  const [question, setQuestion] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Data state from service
  const [agents, setAgents] = useState<AgentDefinition[]>(demoAgents);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [report, setReport] = useState<AgentDefinition | null>(null);
  const [claimsData, setClaimsData] = useState<any>(null);
  const [critiqueData, setCritiqueData] = useState<any>(null);
  const [history, setHistory] = useState<ResearchSession[]>([]);

  const [statuses, setStatuses] = useState<AgentStatus[]>(demoAgents.map(() => "pending"));
  const [selectedTab, setSelectedTab] = useState<"sources" | "claims" | "quality">("sources");
  const [isRunning, setIsRunning] = useState(false);
  const [downloadState, setDownloadState] = useState<"idle" | "generating" | "downloaded">("idle");
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [activityItems, setActivityItems] = useState<string[]>([]);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    let cancelled = false;

    ResearchService.getHistory()
      .then((items) => {
        if (!cancelled) setHistory(items);
      })
      .catch(() => {
        if (!cancelled) setRequestError("Research history could not be loaded.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Poll the existing backend for research progress and results.
  useEffect(() => {
    if (!sessionId || !isRunning) return;

    const intervalId = window.setInterval(async () => {
      try {
        const session = await ResearchService.getStatus(sessionId);
        if (!session) return;

        setStatuses(
          demoAgents.map((agent) => session.agentStatuses[agent.id] || "pending"),
        );
        setActivityItems(session.activityLog || []);

        const currentSources = await ResearchService.getSources(sessionId);
        setSources(currentSources);

        const updatedAgents = await Promise.all(
          demoAgents.map(async (agent) => {
            if (session.agentStatuses[agent.id] === "completed") {
              const output = await ResearchService.getAgentOutput(sessionId, agent.id);
              return output || agent;
            }

            return agent;
          }),
        );
        setAgents(updatedAgents);

        if (session.status === "completed" || session.status === "failed") {
          setIsRunning(false);

          if (session.status === "completed") {
            const [finalReport, claims, critique, historyItems] = await Promise.all([
              ResearchService.getReport(sessionId),
              ResearchService.getClaimsAndEvidence(sessionId),
              ResearchService.getCritique(sessionId),
              ResearchService.getHistory(),
            ]);

            setReport(finalReport);
            setClaimsData(claims);
            setCritiqueData(critique);
            setHistory(historyItems);
          } else {
            setRequestError("Research failed before the final report was generated.");
          }
        }
      } catch {
        setRequestError(
          "Unable to retrieve research progress. Please check your connection and try again.",
        );
        setIsRunning(false);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [sessionId, isRunning]);

  const completedCount = statuses.filter((status) => status === "completed").length;
  const progress =
    demoAgents.length > 0
      ? Math.round((completedCount / demoAgents.length) * 100)
      : 0;
  const allComplete = completedCount === demoAgents.length;

  async function startResearch(q?: string) {
    const targetQ = q || question;
    if (isRunning) return;

    if (targetQ.trim().length < 10) {
      setQuestionError("Please enter a longer research question (at least 10 characters).");
      return;
    }
    setQuestionError("");
    setRequestError("");

    // Reset local UI state
    setStatuses(demoAgents.map(() => "pending"));
    setActivityItems(["New inquiry created."]);
    setIsRunning(true);
    setSources([]);
    setReport(null);
    setClaimsData(null);
    setCritiqueData(null);
    setAgents(demoAgents);
    setDownloadState("idle");

    // Start the existing backend research process without changing its API contract.
    try {
      const id = await ResearchService.startResearch(targetQ);
      setQuestion(targetQ);
      setSessionId(id);
    } catch {
      setIsRunning(false);
      setRequestError("Could not start research. Please check the backend connection and try again.");
    }
  }

  async function downloadReport(format: ReportExportFormat) {
    if (!allComplete || !report || downloadState === "generating") return;

    setDownloadState("generating");
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

    try {
      downloadResearchReport(
        {
          question,
          report,
          agents,
          sources,
          generatedAt: new Date(),
        },
        format,
      );
      setDownloadState("downloaded");
      window.setTimeout(() => setDownloadState("idle"), 3000);
    } catch {
      setDownloadState("idle");
    }
  }

  return (
    <main className="research-page research-workspace-page">
      <div className="research-shell">
        <header className="research-header workspace-header">
          <Link className="research-wordmark" to="/" aria-label="INQUIRA home">
            <span className="research-mark" aria-hidden="true">
              R
            </span>
            <span>INQUIRA</span>
          </Link>
          <nav className="research-nav" aria-label="Workspace navigation flex items-center gap-4">
            <span className="workspace-demo-label hidden md:inline">RESEARCH PIPELINE</span>
            {history.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-xs tracking-widest gap-2">
                    <HistoryIcon className="w-4 h-4" /> HISTORY
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 border border-border bg-[var(--background)]"
                >
                  <DropdownMenuLabel>Recent Inquiries</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-64 overflow-y-auto">
                    {history.map((h, i) => (
                      <DropdownMenuItem
                        key={i}
                        className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                        onSelect={() => {
                          setQuestion(h.question);
                          startResearch(h.question);
                        }}
                      >
                        <span className="text-xs text-muted-foreground">
                          {new Date(h.timestamp).toLocaleString()}
                        </span>
                        <span className="text-sm font-medium line-clamp-2">{h.question}</span>
                        <span
                          className={`text-[10px] tracking-wider uppercase ${h.status === "completed" ? "text-green-500" : "text-orange-500"}`}
                        >
                          {h.status}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Link className="nav-cta" to="/">
              <ArrowLeft aria-hidden="true" /> HOME
            </Link>
          </nav>
        </header>

        <section className="workspace-intro" aria-labelledby="workspace-title">
          <div className="eyebrow">A source-grounded inquiry</div>
          <h1 className="workspace-title" id="workspace-title">
            Research workspace
          </h1>
          <p className="workspace-deck">
            Follow a research question from discovery and evidence extraction through verification
            and final report generation.
          </p>
        </section>

        {requestError && (
          <div
            className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {requestError}
          </div>
        )}

        <section className="workspace-query" aria-labelledby="query-heading">
          <div className="workspace-section-heading">
            <span className="workspace-index">01 / INQUIRY</span>
            <h2 id="query-heading">Your research question</h2>
          </div>
          <form
            className="workspace-query-form"
            onSubmit={(event) => {
              event.preventDefault();
              startResearch();
            }}
          >
            <Textarea
              aria-label="Research question"
              className={`workspace-question-input ${questionError ? "border-red-500" : ""}`}
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);
                if (event.target.value.trim().length >= 10) setQuestionError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  startResearch();
                }
              }}
              placeholder="What would you like to investigate?"
              maxLength={500}
              rows={3}
              disabled={isRunning}
            />
            {questionError && <div className="text-red-500 text-sm mt-2">{questionError}</div>}
            <div className="workspace-query-footer">
              <p className="workspace-example">
                <span>EXAMPLE</span>{" "}
                <button
                  className="workspace-example-link"
                  type="button"
                  onClick={() => setQuestion(demoResearchQuestion)}
                  disabled={isRunning}
                >
                  Urban heat &amp; public health
                </button>
              </p>
              <Button
                className="workspace-run-button"
                type="submit"
                disabled={!question.trim() || isRunning}
              >
                {isRunning ? (
                  <>
                    Researching <LoaderCircle aria-hidden="true" className="workspace-spin" />
                  </>
                ) : allComplete ? (
                  <>
                    Run again <ArrowRight aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Start research <Play aria-hidden="true" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </section>

        <section className="workspace-process" aria-labelledby="process-heading">
          <div className="workspace-process-topline">
            <div className="workspace-section-heading">
              <span className="workspace-index">02 / METHOD</span>
              <h2 id="process-heading">Research in progress</h2>
            </div>
            <span className="workspace-progress-label" aria-live="polite">
              {isRunning ? "IN MOTION" : allComplete ? "COMPLETE" : "READY"}
            </span>
          </div>
          <div
            className="workspace-progress-track"
            role="progressbar"
            aria-label="Research progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span
              style={{
                width: `${progress}%`,
                transition: "width 2s ease",
              }}
              className={isRunning ? "animate-pulse" : ""}
            />
          </div>
          {isRunning ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground border border-[var(--border)] rounded-md mt-4">
              <LoaderCircle className="animate-spin w-8 h-8 text-[var(--foreground)]" />
              <p>The AI research team is working through the stages:</p>
              <p className="text-sm font-medium">{workflowStages.join(" → ")}</p>
              <p className="text-xs opacity-70">
                This may take a few moments. No partial results are shown until the full report is
                complete.
              </p>
            </div>
          ) : (
            <div className="workspace-agent-list mt-4 flex flex-wrap gap-2">
              {workflowStages.map((stage, index) => {
                const isCompleted = allComplete;
                return (
                  <div className="flex items-center gap-2" key={stage}>
                    <Button
                      aria-label={`${stage}: ${isCompleted ? "completed" : "pending"}`}
                      className={`text-xs h-8 ${isCompleted ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-transparent border border-[var(--border)] text-[var(--muted-foreground)]"}`}
                      variant="ghost"
                      disabled
                    >
                      {isCompleted ? (
                        <CircleCheck className="w-3 h-3 mr-1" />
                      ) : (
                        <CircleDashed className="w-3 h-3 mr-1" />
                      )}
                      {stage}
                    </Button>
                    {index < workflowStages.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-[var(--muted-foreground)]" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <Collapsible
          className="workspace-activity"
          open={timelineOpen}
          onOpenChange={setTimelineOpen}
        >
          <div className="workspace-activity-heading">
            <span className="workspace-section-heading">
              <span className="workspace-index">ACTIVITY</span>
              <span className="workspace-activity-count">{activityItems.length} events</span>
            </span>
            <CollapsibleTrigger asChild>
              <Button
                className="workspace-collapse-button"
                variant="ghost"
                aria-label={
                  timelineOpen ? "Collapse activity timeline" : "Expand activity timeline"
                }
              >
                <span>{timelineOpen ? "Hide timeline" : "Show timeline"}</span>
                <ChevronDown aria-hidden="true" className={timelineOpen ? "is-open" : ""} />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <ol className="workspace-activity-list" aria-live="polite">
              {activityItems.length > 0 ? (
                activityItems.map((item, index) => (
                  <li key={`${item}-${index}`}>
                    <Clock3 aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="workspace-activity-empty">
                  <CircleDashed aria-hidden="true" />
                  <span>Agent activity will appear here when your inquiry starts.</span>
                </li>
              )}
            </ol>
          </CollapsibleContent>
        </Collapsible>

        <section className="workspace-output" aria-labelledby="output-heading">
          <div className="workspace-output-header">
            <div className="workspace-section-heading">
              <span className="workspace-index">03 / REVIEW</span>
              <h2 id="output-heading">Agent outputs</h2>
            </div>
            {allComplete && (
              <span className="workspace-report-complete">
                <Check aria-hidden="true" /> FINAL REPORT READY
              </span>
            )}
          </div>

          <div className="workspace-output-layout">
            <nav
              className="workspace-output-nav flex flex-col gap-2"
              aria-label="Research findings"
            >
              <Button
                aria-pressed={selectedTab === "sources"}
                className={`workspace-output-link justify-start ${selectedTab === "sources" ? " is-selected bg-[var(--accent)] text-[var(--accent-foreground)]" : ""}`}
                onClick={() => setSelectedTab("sources")}
                variant="ghost"
              >
                <span className="workspace-output-link-number text-xs opacity-50">01</span>
                <span>Sources</span>
                {allComplete && (
                  <CircleCheck className="ml-auto w-4 h-4 opacity-50" aria-label="Completed" />
                )}
              </Button>
              <Button
                aria-pressed={selectedTab === "claims"}
                className={`workspace-output-link justify-start ${selectedTab === "claims" ? " is-selected bg-[var(--accent)] text-[var(--accent-foreground)]" : ""}`}
                onClick={() => setSelectedTab("claims")}
                variant="ghost"
              >
                <span className="workspace-output-link-number text-xs opacity-50">02</span>
                <span>Claims &amp; Evidence</span>
                {allComplete && (
                  <CircleCheck className="ml-auto w-4 h-4 opacity-50" aria-label="Completed" />
                )}
              </Button>
              <Button
                aria-pressed={selectedTab === "quality"}
                className={`workspace-output-link justify-start ${selectedTab === "quality" ? " is-selected bg-[var(--accent)] text-[var(--accent-foreground)]" : ""}`}
                onClick={() => setSelectedTab("quality")}
                variant="ghost"
              >
                <span className="workspace-output-link-number text-xs opacity-50">03</span>
                <span>Quality Overview</span>
                {allComplete && (
                  <CircleCheck className="ml-auto w-4 h-4 opacity-50" aria-label="Completed" />
                )}
              </Button>
            </nav>

            <article
              className="workspace-agent-output border border-[var(--border)] rounded-md p-6 bg-[var(--card)]"
              aria-live="polite"
            >
              {!allComplete ? (
                <div className="workspace-output-placeholder flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-4">
                  {isRunning ? (
                    <>
                      <LoaderCircle className="animate-spin w-8 h-8 text-primary" />
                      <h3 className="text-lg font-medium text-[var(--foreground)]">
                        Analysis in progress
                      </h3>
                      <p>The research is currently being processed. Findings will appear here.</p>
                    </>
                  ) : (
                    <>
                      <CircleDashed className="w-8 h-8" />
                      <h3 className="text-lg font-medium text-[var(--foreground)]">
                        Waiting to start
                      </h3>
                      <p>Submit a research question to see the findings.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-full overflow-y-auto pr-2">
                  {selectedTab === "sources" && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-medium mb-4">Sources Collected</h3>
                      {sources.length === 0 ? (
                        <p className="text-muted-foreground">No sources found.</p>
                      ) : (
                        sources.map((source) => (
                          <div
                            key={source.id}
                            className="workspace-source-row flex gap-4 p-4 rounded-md border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
                          >
                            <span className="workspace-source-number text-xs font-mono text-muted-foreground mt-1">
                              {source.number}
                            </span>
                            <div className="workspace-source-copy flex-1 space-y-2">
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[var(--foreground)] font-medium hover:underline inline-flex items-center gap-1"
                              >
                                {source.title}{" "}
                                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                              </a>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <span>{source.publisher}</span>
                                {source.quality && (
                                  <>
                                    <span>•</span>
                                    <span className="uppercase text-[10px] tracking-wider font-medium text-[var(--primary)] border border-[var(--border)] px-1.5 py-0.5 rounded">
                                      Score: {source.quality.quality_score}/5
                                    </span>
                                  </>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {source.detail}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {selectedTab === "claims" && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-medium mb-4">Claims &amp; Evidence</h3>
                      {!claimsData || !claimsData.claims || claimsData.claims.length === 0 ? (
                        <p className="text-muted-foreground">No claims extracted.</p>
                      ) : (
                        claimsData.claims.map((claim: any) => {
                          const verification = claimsData.verifications?.find(
                            (v: any) => v.claim_id === claim.claim_id,
                          );
                          const verdict = verification ? verification.verdict : "unverified";
                          const mapping = claimsData.mappings?.find(
                            (m: any) => m.claim_id === claim.claim_id,
                          );
                          const evidences = mapping
                            ? claimsData.evidence?.filter((e: any) =>
                                mapping.evidence_ids.includes(e.evidence_id),
                              )
                            : [];

                          let verdictColor = "text-muted-foreground";
                          if (verdict === "supported")
                            verdictColor = "text-green-600 dark:text-green-400";
                          if (verdict === "partially_supported")
                            verdictColor = "text-yellow-600 dark:text-yellow-400";
                          if (verdict === "contradicted")
                            verdictColor = "text-red-600 dark:text-red-400";

                          return (
                            <div
                              key={claim.claim_id}
                              className="p-5 border border-[var(--border)] rounded-md space-y-3 bg-[var(--background)]"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <h4 className="text-[var(--foreground)] font-medium text-sm">
                                  {claim.claim}
                                </h4>
                                <span
                                  className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-[var(--accent)] whitespace-nowrap ${verdictColor}`}
                                >
                                  {verdict.replace("_", " ")}
                                </span>
                              </div>
                              {evidences && evidences.length > 0 && (
                                <div className="mt-4 pl-4 border-l-2 border-[var(--border)] space-y-2">
                                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                                    Supporting Evidence
                                  </span>
                                  {evidences.map((e: any) => (
                                    <p
                                      key={e.evidence_id}
                                      className="text-sm text-muted-foreground"
                                    >
                                      {e.text}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {verification && verification.reasoning && (
                                <div className="mt-3 text-sm text-foreground bg-accent p-3 rounded">
                                  <strong>Verification reasoning:</strong> {verification.reasoning}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {selectedTab === "quality" && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-medium mb-4">Research Quality Metrics</h3>
                      {!critiqueData ? (
                        <p className="text-muted-foreground">Quality metrics not available.</p>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid gap-4 sm:grid-cols-2">
                            {[
                              { label: "Overall Quality", value: critiqueData.overall },
                              { label: "Factuality", value: critiqueData.factuality },
                              { label: "Citation Accuracy", value: critiqueData.citation_accuracy },
                              { label: "Evidence Coverage", value: critiqueData.evidence_coverage },
                              { label: "Source Quality", value: critiqueData.source_quality },
                            ].map((metric) => (
                              <div
                                key={metric.label}
                                className="p-4 border border-[var(--border)] rounded-md bg-[var(--accent)]"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-[var(--foreground)]">
                                    {metric.label}
                                  </span>
                                  <span className="text-sm font-bold">
                                    {Math.round(metric.value * 100)}%
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[var(--primary)]"
                                    style={{ width: `${Math.round(metric.value * 100)}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          {critiqueData.missing_evidence &&
                            critiqueData.missing_evidence.length > 0 && (
                              <div className="mt-6">
                                <h4 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">
                                  Missing Evidence / Gaps
                                </h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--foreground)]">
                                  {critiqueData.missing_evidence.map((gap: string, i: number) => (
                                    <li key={i}>{gap}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </article>
          </div>
        </section>
      </div>

      <section className="workspace-report-section" aria-labelledby="report-title">
        <div className="research-shell">
          <div className="workspace-report-topline">
            <div className="workspace-section-heading">
              <span className="workspace-index">04 / SYNTHESIS</span>
              <h2 id="report-title">Final research report</h2>
            </div>
            <div className="workspace-report-actions">
              <span className={`workspace-report-label${allComplete ? " is-complete" : ""}`}>
                {allComplete ? (
                  <>
                    <CircleCheck aria-hidden="true" /> RESEARCH COMPLETE
                  </>
                ) : (
                  <>
                    <Clock3 aria-hidden="true" /> AVAILABLE WHEN COMPLETE
                  </>
                )}
              </span>
              {allComplete && report && (
                <div className="flex gap-2">
                  <Button
                    className="workspace-download-button"
                    variant="outline"
                    onClick={() => {
                      const text = report.paragraphs.join("\n\n");
                      navigator.clipboard.writeText(text);
                    }}
                  >
                    Copy Report
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className={`workspace-download-button${downloadState !== "idle" ? ` is-${downloadState}` : ""}`}
                        type="button"
                        disabled={downloadState === "generating"}
                      >
                        {downloadState === "generating" ? (
                          <>
                            Generating report{" "}
                            <LoaderCircle aria-hidden="true" className="workspace-spin" />
                          </>
                        ) : downloadState === "downloaded" ? (
                          <>
                            Report downloaded <Check aria-hidden="true" />
                          </>
                        ) : (
                          <>
                            <Download aria-hidden="true" /> Download report
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="workspace-download-menu"
                      align="end"
                      sideOffset={8}
                    >
                      <DropdownMenuLabel className="workspace-download-menu-label">
                        Download report
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="workspace-download-menu-separator" />
                      <DropdownMenuItem
                        className="workspace-download-menu-item"
                        onSelect={() => void downloadReport("pdf")}
                      >
                        <FileText aria-hidden="true" /> PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="workspace-download-menu-item"
                        onSelect={() => void downloadReport("markdown")}
                      >
                        <FileText aria-hidden="true" /> Markdown
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="workspace-download-menu-item"
                        onSelect={() => void downloadReport("txt")}
                      >
                        <FileText aria-hidden="true" /> TXT
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
          {allComplete && report ? (
            <div className="workspace-report-body">
              <div className="workspace-report-meta">
                <span>INQUIRA RESEARCH REPORT</span>
                <span>{sources.length} SOURCES</span>
              </div>
              <p className="workspace-report-question">Inquiry: {question.trim()}</p>
              <div className="workspace-output-copy markdown-prose">
                {report.paragraphs.map((p, i) => (
                  <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
                    {p}
                  </ReactMarkdown>
                ))}
              </div>
              <div className="workspace-report-evidence">
                <h4>Evidence &amp; references</h4>
                {sources.map((source) => (
                  <SourceRow key={source.id} source={source} />
                ))}
              </div>
            </div>
          ) : (
            <div className="workspace-report-empty">
              <FileText aria-hidden="true" />
              <p>The report will take shape here as each agent completes its review.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="research-shell research-footer workspace-footer">
        <Link className="footer-mark" to="/">
          INQUIRA
        </Link>
        <span>From information to insight.</span>
      </footer>
    </main>
  );
}

function SourceRow({ source }: { source: ResearchSource }) {
  return (
    <div className="workspace-source-row" id={source.id}>
      <span className="workspace-source-number">{source.number}</span>
      <div className="workspace-source-copy">
        <a href={source.url} target="_blank" rel="noreferrer">
          {source.title}
          <ExternalLink aria-hidden="true" />
        </a>
        <span>{source.publisher}</span>
        <p>{source.detail}</p>
      </div>
    </div>
  );
}
