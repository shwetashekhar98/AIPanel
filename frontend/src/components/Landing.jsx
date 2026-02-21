import { useState } from "react";
import { motion } from "framer-motion";

const GavelIcon = () => (
  <svg viewBox="0 0 64 64" className="w-16 h-16" fill="none">
    <rect x="24" y="6" width="16" height="28" rx="4" fill="currentColor" opacity="0.8" />
    <rect x="18" y="30" width="28" height="8" rx="3" fill="currentColor" />
    <rect x="30" y="38" width="4" height="14" rx="2" fill="currentColor" opacity="0.6" />
    <rect x="12" y="52" width="40" height="6" rx="3" fill="currentColor" opacity="0.4" />
  </svg>
);

export default function Landing({ onSubmit }) {
  const [form, setForm] = useState({
    team_name: "",
    github_url: "",
    transcript: "",
  });
  const [pptxFile, setPptxFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("team_name", form.team_name);
    fd.append("github_url", form.github_url);
    fd.append("transcript", form.transcript);
    if (pptxFile) fd.append("pptx_file", pptxFile);
    if (videoFile) fd.append("video_file", videoFile);
    onSubmit(fd);
  };

  const isValid = form.team_name && form.github_url && form.transcript;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Decorative circles */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-court-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-court-gold/3 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <div className="text-court-gold mb-6">
          <GavelIcon />
        </div>
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-gradient-gold mb-4 tracking-tight">
          All Rise
        </h1>
        <p className="text-court-silver text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
          The Hackathon Court is now in session. Submit your team's evidence
          for AI-powered cross-examination.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        onSubmit={handleSubmit}
        className="glass-panel gold-glow p-8 md:p-10 w-full max-w-2xl space-y-6"
      >
        <div className="text-center mb-2">
          <h2 className="font-serif text-xl text-court-gold/80 tracking-widest uppercase">
            Case Filing
          </h2>
        </div>

        {/* Team Name */}
        <div>
          <label className="block text-sm text-court-silver mb-2 tracking-wide uppercase">
            Team Name
          </label>
          <input
            type="text"
            value={form.team_name}
            onChange={(e) => setForm({ ...form, team_name: e.target.value })}
            placeholder="Enter team name…"
            className="w-full bg-court-bg/60 border border-court-border rounded-lg px-4 py-3 text-white placeholder-court-silver/40 focus:border-court-gold/50 focus:outline-none focus:ring-1 focus:ring-court-gold/30 transition-colors"
            required
          />
        </div>

        {/* GitHub URL */}
        <div>
          <label className="block text-sm text-court-silver mb-2 tracking-wide uppercase">
            GitHub Repository URL
          </label>
          <input
            type="url"
            value={form.github_url}
            onChange={(e) => setForm({ ...form, github_url: e.target.value })}
            placeholder="https://github.com/team/repo"
            className="w-full bg-court-bg/60 border border-court-border rounded-lg px-4 py-3 text-white placeholder-court-silver/40 focus:border-court-gold/50 focus:outline-none focus:ring-1 focus:ring-court-gold/30 transition-colors font-mono text-sm"
            required
          />
        </div>

        {/* Transcript */}
        <div>
          <label className="block text-sm text-court-silver mb-2 tracking-wide uppercase">
            Voice Transcription
          </label>
          <textarea
            value={form.transcript}
            onChange={(e) => setForm({ ...form, transcript: e.target.value })}
            placeholder="Paste the transcript of the team's pitch…"
            rows={5}
            className="w-full bg-court-bg/60 border border-court-border rounded-lg px-4 py-3 text-white placeholder-court-silver/40 focus:border-court-gold/50 focus:outline-none focus:ring-1 focus:ring-court-gold/30 transition-colors resize-none"
            required
          />
        </div>

        {/* File uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUpload
            label="Pitch Deck (.pptx)"
            accept=".pptx"
            file={pptxFile}
            onChange={setPptxFile}
            icon="📊"
          />
          <FileUpload
            label="Demo Video (.mp4)"
            accept=".mp4,.webm,.mov"
            file={videoFile}
            onChange={setVideoFile}
            icon="🎬"
          />
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={!isValid}
          whileHover={isValid ? { scale: 1.02 } : {}}
          whileTap={isValid ? { scale: 0.98 } : {}}
          className={`w-full py-4 rounded-lg font-serif text-lg tracking-widest uppercase transition-all duration-300 ${
            isValid
              ? "bg-gradient-to-r from-court-gold/80 to-court-gold text-court-bg hover:shadow-lg hover:shadow-court-gold/20 cursor-pointer"
              : "bg-court-border text-court-silver/40 cursor-not-allowed"
          }`}
        >
          Commence Trial
        </motion.button>
      </motion.form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-court-silver/40 text-xs tracking-widest uppercase"
      >
        5 AI Agents · Cross-Referenced Analysis · Instant Verdict
      </motion.p>
    </div>
  );
}

function FileUpload({ label, accept, file, onChange, icon }) {
  return (
    <label className="flex items-center gap-3 p-4 bg-court-bg/40 border border-court-border/60 rounded-lg cursor-pointer hover:border-court-gold/30 transition-colors group">
      <span className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-court-silver">{label}</div>
        <div className="text-xs text-court-silver/40 truncate">
          {file ? file.name : "Optional — click to upload"}
        </div>
      </div>
      {file && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onChange(null); }}
          className="text-court-red/60 hover:text-court-red text-sm"
        >
          ✕
        </button>
      )}
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </label>
  );
}
