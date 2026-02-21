import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

const AGENTS = {
  github: { label: "Code Agent", icon: "⌨", color: "#6366f1", bg: "#eef2ff", desc: "Repository analysis" },
  ppt:    { label: "Pitch Agent", icon: "📊", color: "#f59e0b", bg: "#fffbeb", desc: "Deck evaluation" },
  video:  { label: "Demo Agent", icon: "🎬", color: "#0ea5e9", bg: "#f0f9ff", desc: "Video analysis" },
  orchestrator: { label: "Synthesizer", icon: "⚡", color: "#f97316", bg: "#fff7ed", desc: "Cross-referencing" },
};

const NODE_POS = {
  input:        { cx: 80,  cy: 175 },
  github:       { cx: 370, cy: 55  },
  ppt:          { cx: 370, cy: 175 },
  video:        { cx: 370, cy: 295 },
  orchestrator: { cx: 660, cy: 175 },
  output:       { cx: 920, cy: 175 },
};

const PATHS = [
  { from: "input", to: "github",       d: "M 145,175 C 230,175 230,55 305,55" },
  { from: "input", to: "ppt",          d: "M 145,175 L 305,175" },
  { from: "input", to: "video",        d: "M 145,175 C 230,175 230,295 305,295" },
  { from: "github", to: "orchestrator", d: "M 435,55 C 520,55 520,175 595,175" },
  { from: "ppt", to: "orchestrator",    d: "M 435,175 L 595,175" },
  { from: "video", to: "orchestrator",  d: "M 435,295 C 520,295 520,175 595,175" },
  { from: "orchestrator", to: "output", d: "M 725,175 L 860,175" },
];

function getPathState(from, to, activeAgents, completedAgents) {
  const activeSet = activeAgents instanceof Set ? activeAgents : new Set();
  const isToComplete = to in completedAgents;
  const isToActive = activeSet.has(to);
  const isFromComplete = from === "input" || from in completedAgents;

  if (to === "output" && "orchestrator" in completedAgents) return "complete";
  if (isToComplete) return "complete";
  if (isToActive && isFromComplete) return "active";
  if (from === "input" && isToActive) return "active";
  return "idle";
}

export default function Pipeline({ judging }) {
  const { activeAgents, completedAgents, events } = judging;
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const feedRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [events]);

  const activeSet = activeAgents instanceof Set ? activeAgents : new Set();
  const completedCount = Object.keys(completedAgents).length;
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");

  const recentSteps = events.filter((e) => e.type === "agent_step").slice(-20);

  return (
    <div className="min-h-screen flex flex-col bg-pipe-surface">
      {/* Header */}
      <header className="border-b border-pipe-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-pipe-primary flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">J</span>
              </div>
              <h1 className="text-sm font-semibold text-pipe-text">Analysis Pipeline</h1>
            </div>
            <span className="text-xs text-pipe-dim font-mono bg-pipe-ghost px-2 py-0.5 rounded">
              {minutes}:{seconds}
            </span>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pipe-primary opacity-50" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pipe-primary" />
              </span>
              <span className="text-xs text-pipe-primary font-medium">Processing</span>
            </div>
            <div className="text-xs text-pipe-muted font-medium">
              {completedCount}/4 stages
            </div>
          </div>
        </div>
      </header>

      {/* Pipeline visualization */}
      <div className="w-full max-w-5xl mx-auto px-4 pt-8 pb-2">
        <div className="card p-4" style={{ overflow: "visible" }}>
          <div className="relative" style={{ aspectRatio: "1000 / 350" }}>
            <svg viewBox="0 0 1000 350" className="absolute inset-0 w-full h-full" fill="none">
              {PATHS.map((p, i) => (
                <path key={i} d={p.d} className={`path-${getPathState(p.from, p.to, activeAgents, completedAgents)}`} />
              ))}
            </svg>

            <PipelineNode pos={NODE_POS.input} label="Input" sublabel="Submitted" icon="📁" state="complete" color="#6b7280" bg="#f3f4f6" />

            {["github", "ppt", "video"].map((key) => {
              const meta = AGENTS[key];
              const isActive = activeSet.has(key) && !(key in completedAgents);
              const isComplete = key in completedAgents;
              return (
                <PipelineNode
                  key={key}
                  pos={NODE_POS[key]}
                  label={meta.label}
                  sublabel={meta.desc}
                  icon={meta.icon}
                  state={isComplete ? "complete" : isActive ? "active" : "idle"}
                  color={meta.color}
                  bg={meta.bg}
                />
              );
            })}

            <PipelineNode
              pos={NODE_POS.orchestrator}
              label={AGENTS.orchestrator.label}
              sublabel={AGENTS.orchestrator.desc}
              icon={AGENTS.orchestrator.icon}
              state={"orchestrator" in completedAgents ? "complete" : activeSet.has("orchestrator") ? "active" : "idle"}
              color={AGENTS.orchestrator.color}
              bg={AGENTS.orchestrator.bg}
            />

            <PipelineNode
              pos={NODE_POS.output}
              label="Verdict"
              sublabel="Final scores"
              icon="📋"
              state={"orchestrator" in completedAgents ? "complete" : "idle"}
              color="#22c55e"
              bg="#f0fdf4"
            />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-5xl mx-auto w-full px-4 py-3">
        <div className="h-1.5 bg-pipe-border rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-pipe-primary to-pipe-primary-bright"
            animate={{ width: `${(completedCount / 4) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Bottom: feed + insights */}
      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-5 gap-4 px-4 pb-6">
        {/* Live Feed */}
        <div className="lg:col-span-3 card p-0 flex flex-col min-h-0" style={{ maxHeight: "320px" }}>
          <div className="px-4 py-2.5 border-b border-pipe-border flex items-center gap-2 shrink-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pipe-primary opacity-40" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-pipe-primary" />
            </span>
            <span className="text-xs font-semibold text-pipe-muted">Live Activity</span>
          </div>
          <div ref={feedRef} className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {recentSteps.length === 0 ? (
              <div className="flex items-center justify-center h-full text-pipe-dim text-xs">
                Waiting for agent activity...
              </div>
            ) : (
              recentSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2 text-xs"
                >
                  <span
                    className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                    style={{ background: AGENTS[step.agent]?.color || "#9ca3af" }}
                  />
                  <span className="text-pipe-secondary font-mono font-medium shrink-0 min-w-[80px]">
                    {AGENTS[step.agent]?.label || step.agent}
                  </span>
                  <span className="text-pipe-muted leading-relaxed line-clamp-2">
                    {step.content?.slice(0, 200)}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Completed */}
        <div className="lg:col-span-2 space-y-3" style={{ maxHeight: "320px", overflowY: "auto" }}>
          <div className="text-xs font-semibold text-pipe-muted px-1 uppercase tracking-wide">
            Completed
          </div>
          <AnimatePresence>
            {Object.entries(completedAgents).map(([key, summary]) => {
              const meta = AGENTS[key];
              if (!meta) return null;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="card p-3"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm">{meta.icon}</span>
                    <span className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-pipe-green font-semibold">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Done
                    </span>
                  </div>
                  <p className="text-[11px] text-pipe-muted leading-relaxed line-clamp-3">
                    {summary?.slice(0, 200)}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {completedCount === 0 && (
            <div className="text-center py-8 text-pipe-dim text-xs">
              Results will appear as agents complete...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PipelineNode({ pos, label, sublabel, icon, state, color, bg }) {
  const nodeW = 130, nodeH = 56;
  const left = `${((pos.cx - nodeW / 2) / 1000) * 100}%`;
  const top = `${((pos.cy - nodeH / 2) / 350) * 100}%`;
  const width = `${(nodeW / 1000) * 100}%`;
  const height = `${(nodeH / 350) * 100}%`;

  const borderStyle =
    state === "complete" ? { borderColor: "#22c55e" } :
    state === "active"   ? { borderColor: color } :
    { borderColor: "#e5e7eb" };

  const bgStyle =
    state === "complete" ? { background: "#f0fdf4" } :
    state === "active"   ? { background: bg } :
    { background: "#ffffff" };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className={`absolute rounded-lg border-2 flex items-center gap-2 px-2.5 shadow-card ${state === "active" ? "node-active" : state === "complete" ? "node-complete" : ""}`}
      style={{ left, top, width, height, ...borderStyle, ...bgStyle }}
    >
      <span className="text-base shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold text-pipe-text truncate leading-tight">{label}</div>
        <div className="text-[9px] text-pipe-muted truncate leading-tight mt-0.5">{sublabel}</div>
      </div>
      {state === "active" && (
        <svg className="w-3.5 h-3.5 animate-spin-slow shrink-0" style={{ color }} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
          <path d="M12 2a10 10 0 019.17 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {state === "complete" && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="shrink-0 w-4 h-4 rounded-full bg-pipe-green flex items-center justify-center"
        >
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}
