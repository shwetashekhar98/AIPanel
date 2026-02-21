import { motion } from "framer-motion";
import { useState } from "react";
import ScoreRadar from "./ScoreRadar";

const PRIORITY_STYLE = {
  HIGH: { bg: "bg-court-red/10", border: "border-court-red/40", text: "text-court-red", badge: "bg-court-red/20 text-court-red" },
  MEDIUM: { bg: "bg-amber-500/10", border: "border-amber-500/40", text: "text-amber-400", badge: "bg-amber-500/20 text-amber-400" },
  LOW: { bg: "bg-court-blue/10", border: "border-court-blue/40", text: "text-court-blue", badge: "bg-court-blue/20 text-court-blue" },
};

const CATEGORY_ICON = {
  technical: "⌨",
  business: "💼",
  innovation: "💡",
  feasibility: "🔧",
  presentation: "🎤",
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
  const agentAnalyses = {
    github: result.github_analysis,
    ppt: result.ppt_analysis,
    voice: result.voice_analysis,
    video: result.video_analysis,
  };

  return (
    <div className="min-h-screen">
      {/* Gavel strike header */}
      <header className="relative overflow-hidden border-b border-court-border">
        <div className="absolute inset-0 bg-radial-fade" />
        <div className="relative max-w-6xl mx-auto px-6 py-12 text-center">
          <motion.div
            initial={{ rotate: -30, scale: 1.3, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-6xl mb-4"
          >
            ⚖
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-serif text-4xl md:text-5xl text-gradient-gold mb-3"
          >
            The Verdict
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-court-silver text-lg"
          >
            Team <span className="text-white font-medium">{result.team_name}</span>
          </motion.p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Scores section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Radar chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-6"
          >
            <h2 className="font-serif text-lg text-court-gold mb-4 text-center">
              Performance Radar
            </h2>
            <ScoreRadar scores={scores} />
          </motion.div>

          {/* Score bars */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel p-6"
          >
            <h2 className="font-serif text-lg text-court-gold mb-6 text-center">
              Detailed Scores
            </h2>
            <div className="space-y-4">
              {[
                { key: "technical", label: "Technical", icon: "⌨" },
                { key: "business", label: "Business", icon: "💼" },
                { key: "presentation", label: "Presentation", icon: "🎤" },
                { key: "demo_quality", label: "Demo Quality", icon: "🎬" },
                { key: "innovation", label: "Innovation", icon: "💡" },
                { key: "overall", label: "Overall", icon: "⚖" },
              ].map((dim, i) => (
                <motion.div
                  key={dim.key}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-court-silver flex items-center gap-2">
                      <span>{dim.icon}</span>
                      {dim.label}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        dim.key === "overall"
                          ? "text-court-gold"
                          : "text-white"
                      }`}
                    >
                      {scores[dim.key]}/10
                    </span>
                  </div>
                  <div className="h-2 bg-court-border/40 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        dim.key === "overall"
                          ? "bg-gradient-to-r from-court-gold/60 to-court-gold"
                          : "bg-gradient-to-r from-court-gold/40 to-court-gold/70"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${((scores[dim.key] || 0) / 10) * 100}%` }}
                      transition={{
                        duration: 1,
                        delay: 0.8 + i * 0.1,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="border-b border-court-border mb-8 flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm capitalize tracking-wide transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "text-court-gold border-b-2 border-court-gold"
                  : "text-court-silver/50 hover:text-court-silver"
              }`}
            >
              {tab === "voice_script" ? "Voice Script" : tab === "agents" ? "Agent Reports" : tab}
              {tab === "questions" && questions.length > 0 && (
                <span className="ml-2 text-xs bg-court-gold/20 text-court-gold px-1.5 py-0.5 rounded-full">
                  {questions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "questions" && (
            <QuestionsPanel questions={questions} />
          )}
          {activeTab === "strengths" && (
            <ListPanel items={strengths} icon="✓" color="text-court-green" />
          )}
          {activeTab === "concerns" && (
            <ListPanel items={concerns} icon="⚠" color="text-court-red" />
          )}
          {activeTab === "voice_script" && (
            <VoiceScriptPanel script={voiceScript} />
          )}
          {activeTab === "agents" && (
            <AgentReportsPanel analyses={agentAnalyses} />
          )}
        </motion.div>

        {/* Reset button */}
        <div className="text-center mt-12 pb-12">
          <button
            onClick={onReset}
            className="px-8 py-3 border border-court-border rounded-lg text-court-silver hover:text-court-gold hover:border-court-gold/40 transition-colors"
          >
            Judge Another Team
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionsPanel({ questions }) {
  const grouped = { HIGH: [], MEDIUM: [], LOW: [] };
  questions.forEach((q) => {
    const p = q.priority || "MEDIUM";
    if (grouped[p]) grouped[p].push(q);
    else grouped.MEDIUM.push(q);
  });

  return (
    <div className="space-y-8">
      {["HIGH", "MEDIUM", "LOW"].map(
        (priority) =>
          grouped[priority].length > 0 && (
            <div key={priority}>
              <h3
                className={`text-sm uppercase tracking-widest mb-4 flex items-center gap-2 ${PRIORITY_STYLE[priority].text}`}
              >
                <span
                  className={`px-2 py-0.5 rounded text-xs ${PRIORITY_STYLE[priority].badge}`}
                >
                  {priority}
                </span>
                Priority
              </h3>
              <div className="space-y-4">
                {grouped[priority].map((q, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`glass-panel p-5 border-l-2 ${PRIORITY_STYLE[priority].border}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-xl mt-0.5">
                        {CATEGORY_ICON[q.category] || "❓"}
                      </span>
                      <div className="flex-1">
                        <p className="text-white font-medium leading-relaxed">
                          {q.question}
                        </p>
                      </div>
                    </div>
                    <div className="ml-9 space-y-1.5">
                      <p className="text-xs text-court-silver/60">
                        <span className="text-court-silver/40">Reasoning: </span>
                        {q.reasoning}
                      </p>
                      <p className="text-xs text-court-silver/40">
                        <span className="text-court-gold/50">Source: </span>
                        {q.source_evidence}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
}

function ListPanel({ items, icon, color }) {
  return (
    <div className="space-y-3 max-w-3xl">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="glass-panel p-4 flex items-start gap-3"
        >
          <span className={`${color} mt-0.5`}>{icon}</span>
          <p className="text-court-silver leading-relaxed">{item}</p>
        </motion.div>
      ))}
    </div>
  );
}

function VoiceScriptPanel({ script }) {
  return (
    <div className="max-w-3xl">
      <div className="glass-panel p-6 gold-glow">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🎙</span>
          <h3 className="font-serif text-lg text-court-gold">
            Judge's Voice Script
          </h3>
        </div>
        <p className="text-court-silver leading-loose text-lg whitespace-pre-wrap">
          {script}
        </p>
      </div>
    </div>
  );
}

function AgentReportsPanel({ analyses }) {
  const agents = [
    { key: "github", name: "GitHub Agent", icon: "⌨", color: "text-blue-400" },
    { key: "ppt", name: "PPT Agent", icon: "📊", color: "text-amber-400" },
    { key: "voice", name: "Voice Agent", icon: "🎙", color: "text-purple-400" },
    { key: "video", name: "Video Agent", icon: "🎬", color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      {agents.map(({ key, name, icon, color }) => {
        const analysis = analyses[key];
        if (!analysis) return null;

        return (
          <motion.details
            key={key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel group"
          >
            <summary className={`p-5 cursor-pointer flex items-center gap-3 hover:bg-court-surface/50 transition-colors rounded-xl`}>
              <span className="text-xl">{icon}</span>
              <span className={`font-medium ${color}`}>{name}</span>
              <span className="ml-auto text-court-silver/40 text-sm group-open:rotate-90 transition-transform">
                ▶
              </span>
            </summary>
            <div className="px-5 pb-5 space-y-4">
              <p className="text-court-silver leading-relaxed">
                {analysis.summary}
              </p>

              {analysis.key_findings?.length > 0 && (
                <div>
                  <h4 className="text-xs text-court-silver/50 uppercase tracking-widest mb-2">
                    Key Findings
                  </h4>
                  <ul className="space-y-1.5">
                    {analysis.key_findings.map((f, i) => (
                      <li key={i} className="text-sm text-court-silver/70 flex items-start gap-2">
                        <span className="text-court-gold/50 mt-1">•</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.strengths?.length > 0 && (
                  <div>
                    <h4 className="text-xs text-court-green/60 uppercase tracking-widest mb-2">
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-court-silver/60 flex items-start gap-2">
                          <span className="text-court-green/50 mt-1">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.concerns?.length > 0 && (
                  <div>
                    <h4 className="text-xs text-court-red/60 uppercase tracking-widest mb-2">
                      Concerns
                    </h4>
                    <ul className="space-y-1">
                      {analysis.concerns.map((c, i) => (
                        <li key={i} className="text-sm text-court-silver/60 flex items-start gap-2">
                          <span className="text-court-red/50 mt-1">⚠</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.details>
        );
      })}
    </div>
  );
}
