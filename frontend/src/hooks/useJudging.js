import { useState, useCallback, useRef } from "react";

const AGENT_ORDER = ["github", "ppt", "video", "orchestrator"];

export default function useJudging() {
  const [phase, setPhase] = useState("idle"); // idle | submitting | streaming | verdict | error
  const [jobId, setJobId] = useState(null);
  const [events, setEvents] = useState([]);
  const [activeAgents, setActiveAgents] = useState(new Set());
  const [completedAgents, setCompletedAgents] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  const submit = useCallback(async (formData) => {
    setPhase("submitting");
    setEvents([]);
    setActiveAgents(new Set());
    setCompletedAgents({});
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/judge/start", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setJobId(data.job_id);
      setPhase("streaming");

      const es = new EventSource(`/api/judge/${data.job_id}/stream`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setEvents((prev) => [...prev, parsed]);

          switch (parsed.type) {
            case "agent_started":
              setActiveAgents((prev) => new Set([...prev, parsed.agent]));
              break;

            case "agent_complete":
              setActiveAgents((prev) => {
                const next = new Set(prev);
                next.delete(parsed.agent);
                return next;
              });
              setCompletedAgents((prev) => ({
                ...prev,
                [parsed.agent]: parsed.summary || "Analysis complete",
              }));
              break;

            case "verdict":
              setResult(parsed.result);
              setPhase("verdict");
              es.close();
              break;

            case "error":
              setError(parsed.message);
              setPhase("error");
              es.close();
              break;
          }
        } catch {
          // skip unparseable messages
        }
      };

      es.onerror = () => {
        es.close();
        fetchResult(data.job_id);
      };
    } catch (err) {
      setError(err.message);
      setPhase("error");
    }
  }, []);

  const fetchResult = useCallback(async (id) => {
    const jid = id || jobId;
    if (!jid) return;
    try {
      const res = await fetch(`/api/judge/${jid}/result`);
      const data = await res.json();
      if (data.scores) {
        setResult(data);
        setPhase("verdict");
      }
    } catch {
      // polling will retry
    }
  }, [jobId]);

  const reset = useCallback(() => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    setPhase("idle");
    setJobId(null);
    setEvents([]);
    setActiveAgents(new Set());
    setCompletedAgents({});
    setResult(null);
    setError(null);
  }, []);

  return {
    phase,
    jobId,
    events,
    activeAgents,
    completedAgents,
    result,
    error,
    submit,
    reset,
    agentOrder: AGENT_ORDER,
  };
}
