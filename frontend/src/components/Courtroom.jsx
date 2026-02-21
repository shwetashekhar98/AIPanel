import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const AGENT_META = {
  github: {
    name: "GitHub Agent",
    title: "Code & Architecture Witness",
    icon: "⌨",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  ppt: {
    name: "PPT Agent",
    title: "Business Strategy Witness",
    icon: "📊",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  voice: {
    name: "Voice Agent",
    title: "Communication Witness",
    icon: "🎙",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
  video: {
    name: "Video Agent",
    title: "Product Demo Witness",
    icon: "🎬",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  orchestrator: {
    name: "Chief Judge",
    title: "Cross-Reference & Verdict",
    icon: "⚖",
    color: "text-court-gold",
    bg: "bg-court-gold/10",
    border: "border-court-gold/30",
  },
};

export default function Courtroom({ judging }) {
  const { activeAgent, completedAgents, events, agentOrder } = judging;
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const recentSteps = events
    .filter((e) => e.type === "agent_step" && e.agent === activeAgent)
    .slice(-3);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header bar */}
      <header className="border-b border-court-border bg-court-panel/60 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl text-court-gold tracking-wide">
              Court is in Session
            </h1>
            <p className="text-court-silver/60 text-sm">
              AI judges are examining the evidence{dots}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-court-green animate-pulse" />
            <span className="text-court-green text-xs uppercase tracking-widest">
              Live
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-12 gap-6 p-6">
        {/* Left — Witness queue */}
        <aside className="col-span-3 space-y-3">
          <h3 className="text-xs text-court-silver/60 uppercase tracking-widest mb-4 px-1">
            Witness Queue
          </h3>
          {agentOrder.map((key) => {
            const meta = AGENT_META[key];
            const isActive = key === activeAgent;
            const isComplete = key in completedAgents;

            return (
              <motion.div
                key={key}
                layout
                className={`rounded-lg border p-3 transition-all duration-500 ${
                  isActive
                    ? `${meta.border} ${meta.bg} gold-glow`
                    : isComplete
                    ? "border-court-green/30 bg-court-green/5"
                    : "border-court-border/40 bg-court-bg/40 opacity-40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium ${
                        isActive ? meta.color : isComplete ? "text-court-green" : "text-court-silver/60"
                      }`}
                    >
                      {meta.name}
                    </div>
                    <div className="text-xs text-court-silver/40 truncate">
                      {meta.title}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {isActive && (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className={`w-2.5 h-2.5 rounded-full ${meta.color.replace("text-", "bg-")}`}
                      />
                    )}
                    {isComplete && (
                      <span className="text-court-green text-sm">✓</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </aside>

        {/* Center — Witness stand */}
        <main className="col-span-6 flex flex-col">
          <AnimatePresence mode="wait">
            {activeAgent && (
              <motion.div
                key={activeAgent}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="glass-panel flex-1 flex flex-col"
              >
                {/* Witness header */}
                <div
                  className={`border-b border-court-border px-6 py-4 flex items-center gap-4 ${AGENT_META[activeAgent]?.bg}`}
                >
                  <span className="text-3xl">
                    {AGENT_META[activeAgent]?.icon}
                  </span>
                  <div>
                    <h2
                      className={`font-serif text-xl ${AGENT_META[activeAgent]?.color}`}
                    >
                      {AGENT_META[activeAgent]?.name}
                    </h2>
                    <p className="text-court-silver/60 text-sm">
                      Now testifying — {AGENT_META[activeAgent]?.title}
                    </p>
                  </div>
                </div>

                {/* Testimony stream */}
                <div className="flex-1 p-6 overflow-y-auto max-h-[60vh]">
                  {recentSteps.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                            ease: "linear",
                          }}
                          className="text-4xl mb-4 inline-block"
                        >
                          ⚙
                        </motion.div>
                        <p className="text-court-silver/60">
                          Analyzing evidence{dots}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentSteps.map((step, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-sm text-court-silver/80 leading-relaxed bg-court-bg/40 rounded-lg p-4 border border-court-border/30"
                        >
                          <pre className="whitespace-pre-wrap font-sans">
                            {step.content}
                          </pre>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {!activeAgent && judging.phase === "submitting" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel flex-1 flex items-center justify-center"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-5xl mb-4 text-court-gold"
                  >
                    ⚖
                  </motion.div>
                  <p className="text-court-gold font-serif text-lg">
                    Assembling the Court{dots}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Right — Evidence collected */}
        <aside className="col-span-3 space-y-3">
          <h3 className="text-xs text-court-silver/60 uppercase tracking-widest mb-4 px-1">
            Evidence Collected
          </h3>
          <AnimatePresence>
            {Object.entries(completedAgents).map(([key, summary]) => {
              const meta = AGENT_META[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="glass-panel p-4 border-l-2 border-court-green/40"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{meta.icon}</span>
                    <span className={`text-xs font-medium ${meta.color}`}>
                      {meta.name}
                    </span>
                    <span className="text-court-green text-xs ml-auto">
                      ✓ Filed
                    </span>
                  </div>
                  <p className="text-xs text-court-silver/50 line-clamp-4 leading-relaxed">
                    {summary.slice(0, 200)}…
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {Object.keys(completedAgents).length === 0 && (
            <div className="text-center py-12 text-court-silver/30 text-sm">
              Evidence will appear here as each witness testifies…
            </div>
          )}
        </aside>
      </div>

      {/* Progress bar */}
      <div className="border-t border-court-border bg-court-panel/60 px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-xs text-court-silver/40 uppercase tracking-widest">
              Progress
            </span>
            <div className="flex-1 h-1.5 bg-court-border/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-court-gold/60 to-court-gold rounded-full"
                animate={{
                  width: `${(Object.keys(completedAgents).length / 5) * 100}%`,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs text-court-silver/40">
              {Object.keys(completedAgents).length}/5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
