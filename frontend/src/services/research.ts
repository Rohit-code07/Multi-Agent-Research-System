import {
  type AgentDefinition,
  type AgentStatus,
  type ResearchSource,
  demoAgents,
} from "@/lib/research-demo";

export interface ResearchSession {
  id: string;
  question: string;
  status: "pending" | "running" | "completed" | "failed";
  timestamp: string;
  agentStatuses: Record<string, AgentStatus>;
  activityLog: string[];
  activeAgentIndex: number | null;
  apiData?: any;
}

// In-memory store for sessions (can be expanded to localStorage if needed, but keeping in-memory per rules to not add new backend storage)
const sessions = new Map<string, ResearchSession>();
let sessionHistory: ResearchSession[] = [];

export const ResearchService = {
  /**
   * Starts a new research process against the backend API
   */
  async startResearch(question: string): Promise<string> {
    const sessionId = crypto.randomUUID();

    const initialStatuses: Record<string, AgentStatus> = {};
    demoAgents.forEach((a) => {
      initialStatuses[a.id] = "pending";
    });

    const session: ResearchSession = {
      id: sessionId,
      question,
      status: "running",
      timestamp: new Date().toISOString(),
      agentStatuses: initialStatuses,
      activityLog: ["Research inquiry created. Connecting to INQUIRA backend..."],
      activeAgentIndex: null,
    };

    sessions.set(sessionId, session);
    sessionHistory = [session, ...sessionHistory];

    // Start backend request asynchronously
    this._runActualResearch(sessionId, question);

    return sessionId;
  },

  /**
   * Gets the current status of the research process
   */
  async getStatus(sessionId: string): Promise<ResearchSession | null> {
    const session = sessions.get(sessionId);
    if (!session) return null;
    return { ...session };
  },

  /**
   * Returns research history
   */
  async getHistory(): Promise<ResearchSession[]> {
    return sessionHistory;
  },

  /**
   * Gets the sources collected (with quality metrics if available)
   */
  async getSources(sessionId: string): Promise<ResearchSource[]> {
    const session = sessions.get(sessionId);
    if (!session || !session.apiData) return [];

    // Use quality_results if available, fallback to search_results
    if (session.apiData.quality_results && session.apiData.quality_results.sources) {
      return session.apiData.quality_results.sources.map((item: any, idx: number) => ({
        id: `source-${idx}`,
        number: String(idx + 1).padStart(2, "0"),
        title: item.search_result.title,
        publisher: new URL(item.search_result.url).hostname.replace("www.", ""),
        url: item.search_result.url,
        detail: item.search_result.snippet,
        quality: item.quality,
      }));
    } else if (session.apiData.search_results && session.apiData.search_results.results) {
      return session.apiData.search_results.results.map((item: any, idx: number) => ({
        id: `source-${idx}`,
        number: String(idx + 1).padStart(2, "0"),
        title: item.title,
        publisher: new URL(item.url).hostname.replace("www.", ""),
        url: item.url,
        detail: item.snippet,
      }));
    }

    return [];
  },

  /**
   * Gets Claims, Evidence, and Verifications
   */
  async getClaimsAndEvidence(sessionId: string): Promise<any> {
    const session = sessions.get(sessionId);
    if (!session || !session.apiData) return null;
    return {
      claims: session.apiData.claims?.claims || [],
      evidence: session.apiData.evidence?.evidence || [],
      mappings: session.apiData.mappings?.mappings || [],
      verifications: session.apiData.verifications || [],
    };
  },

  /**
   * Gets Critique metrics
   */
  async getCritique(sessionId: string): Promise<any> {
    const session = sessions.get(sessionId);
    if (!session || !session.apiData) return null;
    return session.apiData.critique || null;
  },

  /**
   * Helper to normalize backend content to string
   */
  _normalizeContent(raw: any): string {
    if (!raw) return "";
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw)) {
      return raw
        .map((item) => item?.text || (typeof item === "string" ? item : JSON.stringify(item)))
        .join("\n\n");
    }
    if (typeof raw === "object") {
      return JSON.stringify(raw);
    }
    return String(raw);
  },

  /**
   * Gets output from a specific agent
   */
  async getAgentOutput(sessionId: string, agentId: string): Promise<AgentDefinition | null> {
    const session = sessions.get(sessionId);
    if (!session || session.status !== "completed" || !session.apiData) return null;

    const baseAgent = demoAgents.find((a) => a.id === agentId);
    if (!baseAgent) return null;

    let rawContent = "";
    switch (agentId) {
      case "search":
        rawContent = session.apiData.search_results;
        break;
      case "reader":
        rawContent = session.apiData.reader_results;
        break;
      case "analyst":
        rawContent = "Analysis is implicitly combined into the process.";
        break;
      case "critic":
        rawContent = session.apiData.critique;
        break;
      case "writer":
        rawContent = session.apiData.final_report;
        break;
    }

    const contentStr = this._normalizeContent(rawContent);
    const paragraphs = contentStr ? [contentStr] : baseAgent.paragraphs;

    return {
      ...baseAgent,
      paragraphs,
      findings: [],
      sourceIds: [],
    };
  },

  /**
   * Gets the final report if synthesis is complete
   */
  async getReport(sessionId: string): Promise<any> {
    const session = sessions.get(sessionId);
    if (!session || session.status !== "completed") return null;

    if (session.apiData?.final_report) {
      return {
        ...demoAgents.find((a) => a.id === "writer"),
        paragraphs: [session.apiData.final_report],
        findings: [],
        sourceIds: [],
      };
    }
    return this.getAgentOutput(sessionId, "writer");
  },

  /**
   * Internal function to call the backend API and update session state
   */
  async _runActualResearch(sessionId: string, question: string) {
    const session = sessions.get(sessionId);
    if (!session) return;

    try {
      session.activityLog.push("Executing multi-agent research pipeline...");
      session.activityLog.push(
        "Backend is processing (Planning → Searching → Analyzing Sources → Extracting Evidence → Verifying Claims → Synthesizing Findings → Quality Review → Generating Report)...",
      );

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Unknown error from API");
      }

      // Store result and mark complete
      session.apiData = data.result;

      demoAgents.forEach((a) => {
        session.agentStatuses[a.id] = "completed";
      });
      session.status = "completed";
      session.activityLog.push("Research process completed successfully.");

      // Update session in history array
      sessionHistory = sessionHistory.map((s) => (s.id === sessionId ? session : s));
    } catch (e: any) {
      session.status = "failed";
      demoAgents.forEach((a) => {
        session.agentStatuses[a.id] = "failed";
      });
      session.activityLog.push(
        `Research could not be completed. Please try again. Error: ${e.message}`,
      );
      sessionHistory = sessionHistory.map((s) => (s.id === sessionId ? session : s));
    }
  },
};
