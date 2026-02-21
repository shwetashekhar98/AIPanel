import { useState } from "react";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: "⌨", label: "Code Analysis", desc: "Architecture & commit patterns" },
  { icon: "📊", label: "Pitch Evaluation", desc: "Business model & claims" },
  { icon: "🎬", label: "Demo Review", desc: "Real functionality & UX" },
  { icon: "⚡", label: "Cross-Reference", desc: "Finds inconsistencies" },
];

export default function Landing({ onSubmit }) {
  const [form, setForm] = useState({ team_name: "", github_url: "" });
  const [pptxFile, setPptxFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("team_name", form.team_name);
    fd.append("github_url", form.github_url);
    if (pptxFile) fd.append("pptx_file", pptxFile);
    if (videoFile) fd.append("video_file", videoFile);
    onSubmit(fd);
  };

  const isValid = form.team_name && form.github_url;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <nav className="border-b border-pipe-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-pipe-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">J</span>
          </div>
          <span className="font-semibold text-pipe-text text-sm">Judge AI</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-pipe-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-pipe-green" />
          All systems operational
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pipe-primary-wash border border-pipe-primary/20 text-xs text-pipe-primary-dim font-medium mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-pipe-primary animate-pulse" />
            3 AI Agents · Parallel Analysis
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-pipe-text mb-4 leading-[1.1]">
            Hackathon judging,{" "}
            <span className="text-gradient">automated.</span>
          </h1>
          <p className="text-pipe-muted text-base md:text-lg leading-relaxed max-w-lg mx-auto">
            Submit a repo, pitch deck, and demo video. Get cross-referenced
            scores, probing questions, and a judge script in minutes.
          </p>
        </motion.div>

        {/* Feature strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.06 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-pipe-border bg-white text-xs shadow-card"
            >
              <span>{f.icon}</span>
              <span className="text-pipe-text font-medium">{f.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="card p-6 md:p-8 w-full max-w-xl space-y-5"
        >
          <div>
            <label className="block text-xs text-pipe-muted mb-1.5 font-semibold tracking-wide uppercase">
              Team Name
            </label>
            <input
              type="text"
              value={form.team_name}
              onChange={(e) => setForm({ ...form, team_name: e.target.value })}
              placeholder="e.g. Team Rocket"
              className="w-full border border-pipe-border rounded-lg px-4 py-2.5 text-sm text-pipe-text placeholder-pipe-dim bg-white focus:border-pipe-primary focus:outline-none focus:ring-2 focus:ring-pipe-primary/10 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-pipe-muted mb-1.5 font-semibold tracking-wide uppercase">
              GitHub Repository
            </label>
            <input
              type="url"
              value={form.github_url}
              onChange={(e) => setForm({ ...form, github_url: e.target.value })}
              placeholder="https://github.com/team/repo"
              className="w-full border border-pipe-border rounded-lg px-4 py-2.5 text-sm text-pipe-text placeholder-pipe-dim bg-white focus:border-pipe-primary focus:outline-none focus:ring-2 focus:ring-pipe-primary/10 transition-all font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FileInput label="Pitch Deck" accept=".pptx" file={pptxFile} onChange={setPptxFile} hint=".pptx" />
            <FileInput label="Demo Video" accept=".mp4,.webm,.mov" file={videoFile} onChange={setVideoFile} hint=".mp4" />
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className={`relative w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isValid
                ? "bg-pipe-primary text-white hover:bg-pipe-primary-dim shadow-glow-orange cursor-pointer active:scale-[0.98]"
                : "bg-pipe-ghost text-pipe-dim cursor-not-allowed"
            }`}
          >
            Start Analysis Pipeline →
          </button>
        </motion.form>
      </div>
    </div>
  );
}

function FileInput({ label, accept, file, onChange, hint }) {
  return (
    <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-dashed border-pipe-border-light bg-pipe-surface cursor-pointer hover:border-pipe-primary/40 hover:bg-pipe-primary-wash/50 transition-colors group">
      <div className="w-8 h-8 rounded-md bg-pipe-ghost flex items-center justify-center group-hover:bg-pipe-primary/10 transition-colors">
        <svg className="w-4 h-4 text-pipe-dim group-hover:text-pipe-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3 3 0 013.548 3.598A3.75 3.75 0 0118 19.5H6.75z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-pipe-text font-medium">{label}</div>
        <div className="text-[10px] text-pipe-dim truncate">
          {file ? file.name : `Optional · ${hint}`}
        </div>
      </div>
      {file && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onChange(null); }}
          className="text-pipe-dim hover:text-pipe-red text-xs p-1"
        >
          ✕
        </button>
      )}
      <input type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
    </label>
  );
}
