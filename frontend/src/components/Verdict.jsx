import { motion } from "framer-motion";
import { useState } from "react";
import ScoreRadar from "./ScoreRadar";

const PRIORITY_STYLE = {
  HIGH:   { border: "border-l-red-400",   badge: "bg-red-50 text-red-600" },
  MEDIUM: { border: "border-l-amber-400", badge: "bg-amber-50 text-amber-600" },
  LOW:    { border: "border-l-sky-400",   badge: "bg-sky-50 text-sky-600" },
};

const CATEGORY_ICON = {
  technical: "⌨", business: "💼", innovation: "💡", feasibility: "🔧", presentation: "🎤",
};

const TABS = ["questions", "strengths", "concerns", "voice_script", "agents"];

export default function Verdict({ result, onReset }) {
  const [activeTab, setActiveTab] = useState("questions");
  if (!result) return null;

  const scores = result.scores || {};
  const questions = result.questions || [];
  const strengths = result.key_strengths || [];
  const concerns = result.key_concerns || [];
  const voiceScript = result.voice_script || "";
  const agentAnalyses = { github: result.github_analysis, ppt: result.ppt_analysis, video: result.video_analysis };

  return (
    <div className="min-h-screen bg-pipe-surface">
      {/* Flash */}
      <div className="fixed inset-0 bg-pipe-primary/10 verdict-flash pointer-events-none z-50" />

      {/* Header */}
      <header className="bg-white border-b border-pipe-border">
        <div className="max-w-6xl mx-auto px-6 py-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pipe-primary-wash border border-pipe-primary/20 mb-4"
          >
            <span className="text-2xl">📋</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-3xl md:text-4xl font-extrabold text-pipe-text mb-2"
          >
            Analysis <span className="text-gradient">Complete</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-pipe-muted"
          >
            Team <span className="text-pipe-text font-semibold">{result.team_name}</span>
          </motion.p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="card p-6"
          >
            <h2 className="text-xs font-bold text-pipe-muted mb-4 text-center tracking-widest uppercase">
              Performance Radar
            </h2>
            <ScoreRadar scores={scores} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
            className="card p-6"
          >
            <h2 className="text-xs font-bold text-pipe-muted mb-6 text-center tracking-widest uppercase">
              Score Breakdown
            </h2>
            <div className="space-y-4">
              {[
                { key: "technical",    label: "Technical",    color: "#6366f1" },
                { key: "business",     label: "Business",     color: "#f59e0b" },
                { key: "presentation", label: "Presentation", color: "#8b5cf6" },
                { key: "demo_quality", label: "Demo Quality", color: "#0ea5e9" },
                { key: "innovation",   label: "Innovation",   color: "#ec4899" },
                { key: "overall",      label: "Overall",      color: "#f97316" },
              ].map((dim, i) => (
                <motion.div
                  key={dim.key}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-pipe-muted font-medium">{dim.label}</span>
                    <span className={`text-sm font-bold ${dim.key === "overall" ? "text-gradient" : "text-pipe-text"}`}>
                      {scores[dim.key]}/10
                    </span>
                  </div>
                  <div className="h-2 bg-pipe-ghost rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: dim.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${((scores[dim.key] || 0) / 10) * 100}%` }}
                      transition={{ duration: 1, delay: 0.7 + i * 0.08, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-pipe-border shadow-card mb-8">
          <div className="border-b border-pipe-border flex gap-0.5 px-2 pt-2 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-semibold capitalize tracking-wide transition-all rounded-t-lg whitespace-nowrap ${
                  activeTab === tab
                    ? "text-pipe-primary bg-pipe-primary-wash border-b-2 border-pipe-primary"
                    : "text-pipe-dim hover:text-pipe-muted"
                }`}
              >
                {tab === "voice_script" ? "Voice Script" : tab === "agents" ? "Agent Reports" : tab}
                {tab === "questions" && questions.length > 0 && (
                  <span className="ml-1.5 text-[10px] bg-pipe-primary/10 text-pipe-primary px-1.5 py-0.5 rounded-full font-bold">
                    {questions.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {activeTab === "questions" && <QuestionsPanel questions={questions} />}
              {activeTab === "strengths" && <ListPanel items={strengths} color="text-pipe-green" bgColor="bg-pipe-green-wash" />}
              {activeTab === "concerns" && <ListPanel items={concerns} color="text-pipe-red" bgColor="bg-pipe-red-wash" />}
              {activeTab === "voice_script" && <VoiceScriptPanel script={voiceScript} />}
              {activeTab === "agents" && <AgentReportsPanel analyses={agentAnalyses} />}
            </motion.div>
          </div>
        </div>

        <div className="text-center pb-12">
          <button
            onClick={onReset}
            className="px-8 py-2.5 bg-pipe-primary text-white rounded-lg text-sm font-semibold hover:bg-pipe-primary-dim transition-colors"
          >
            Analyze Another Team
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionsPanel({ questions }) {
  const grouped = { HIGH: [], MEDIUM: [], LOW: [] };
  questions.forEach((q) => (grouped[q.priority] || grouped.MEDIUM).push(q));

  return (
    <div className="space-y-6">
      {["HIGH", "MEDIUM", "LOW"].map((priority) =>
        grouped[priority].length > 0 ? (
          <div key={priority}>
            <h3 className="text-xs uppercase tracking-widest mb-3 flex items-center gap-2 text-pipe-muted font-bold">
              <span className={`px-2 py-0.5 rounded text-[10px] ${PRIORITY_STYLE[priority].badge}`}>{priority}</span>
              Priority
            </h3>
            <div className="space-y-2.5">
              {grouped[priority].map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-4 rounded-lg border border-pipe-border bg-white ${PRIORITY_STYLE[priority].border} border-l-[3px]`}
                >
                  <div className="flex items-start gap-2.5 mb-2">
                    <span className="text-base">{CATEGORY_ICON[q.category] || "❓"}</span>
                    <p className="text-sm text-pipe-text font-medium leading-relaxed">{q.question}</p>
                  </div>
                  <div className="ml-7 space-y-1">
                    <p className="text-[11px] text-pipe-muted"><span className="font-semibold">Why:</span> {q.reasoning}</p>
                    <p className="text-[11px] text-pipe-dim"><span className="font-semibold text-pipe-muted">Source:</span> {q.source_evidence}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}

function ListPanel({ items, color, bgColor }) {
  return (
    <div className="space-y-2 max-w-3xl">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`p-3.5 rounded-lg ${bgColor} flex items-start gap-3`}
        >
          <span className={`${color} mt-0.5 text-sm font-bold`}>•</span>
          <p className="text-sm text-pipe-secondary leading-relaxed">{item}</p>
        </motion.div>
      ))}
    </div>
  );
}

function VoiceScriptPanel({ script }) {
  return (
    <div className="max-w-3xl">
      <div className="rounded-lg bg-pipe-primary-wash border border-pipe-primary/20 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-pipe-primary/10 flex items-center justify-center">
            <span className="text-lg">🎙</span>
          </div>
          <h3 className="text-sm font-bold text-pipe-text">Judge Voice Script</h3>
        </div>
        <p className="text-sm text-pipe-secondary leading-loose whitespace-pre-wrap">{script}</p>
      </div>
    </div>
  );
}

function AgentReportsPanel({ analyses }) {
  const agents = [
    { key: "github", name: "Code Agent",  icon: "⌨", color: "#6366f1", bg: "#eef2ff" },
    { key: "ppt",    name: "Pitch Agent", icon: "📊", color: "#f59e0b", bg: "#fffbeb" },
    { key: "video",  name: "Demo Agent",  icon: "🎬", color: "#0ea5e9", bg: "#f0f9ff" },
  ];

  return (
    <div className="space-y-3">
      {agents.map(({ key, name, icon, color, bg }) => {
        const analysis = analyses[key];
        if (!analysis) return null;
        return (
          <details key={key} className="group rounded-lg border border-pipe-border bg-white overflow-hidden">
            <summary className="p-4 cursor-pointer flex items-center gap-3 hover:bg-pipe-surface transition-colors">
              <span className="text-lg">{icon}</span>
              <span className="text-sm font-semibold" style={{ color }}>{name}</span>
              <span className="ml-auto text-pipe-dim text-xs group-open:rotate-90 transition-transform duration-200">▶</span>
            </summary>
            <div className="px-4 pb-4 space-y-3 border-t border-pipe-border pt-3">
              <p className="text-sm text-pipe-muted leading-relaxed">{analysis.summary}</p>

              {analysis.key_findings?.length > 0 && (
                <div>
                  <h4 className="text-[10px] text-pipe-dim uppercase tracking-widest mb-1.5 font-bold">Key Findings</h4>
                  <ul className="space-y-1">
                    {analysis.key_findings.map((f, i) => (
                      <li key={i} className="text-xs text-pipe-muted flex items-start gap-2">
                        <span style={{ color }} className="mt-0.5">•</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.strengths?.length > 0 && (
                  <div className="rounded-lg bg-pipe-green-wash p-3">
                    <h4 className="text-[10px] text-pipe-green-dim uppercase tracking-widest mb-1.5 font-bold">Strengths</h4>
                    <ul className="space-y-1">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-pipe-muted flex items-start gap-1.5">
                          <span className="text-pipe-green mt-0.5">✓</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.concerns?.length > 0 && (
                  <div className="rounded-lg bg-pipe-red-wash p-3">
                    <h4 className="text-[10px] text-pipe-red uppercase tracking-widest mb-1.5 font-bold">Concerns</h4>
                    <ul className="space-y-1">
                      {analysis.concerns.map((c, i) => (
                        <li key={i} className="text-xs text-pipe-muted flex items-start gap-1.5">
                          <span className="text-pipe-red mt-0.5">!</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}
