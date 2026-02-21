import { AnimatePresence, motion } from "framer-motion";
import useJudging from "./hooks/useJudging";
import Landing from "./components/Landing";
import Courtroom from "./components/Courtroom";
import Verdict from "./components/Verdict";

export default function App() {
  const judging = useJudging();

  return (
    <div className="min-h-screen bg-court-bg relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 bg-radial-fade pointer-events-none" />

      <AnimatePresence mode="wait">
        {judging.phase === "idle" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            <Landing onSubmit={judging.submit} />
          </motion.div>
        )}

        {(judging.phase === "submitting" || judging.phase === "streaming") && (
          <motion.div
            key="courtroom"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Courtroom judging={judging} />
          </motion.div>
        )}

        {judging.phase === "verdict" && (
          <motion.div
            key="verdict"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Verdict result={judging.result} onReset={judging.reset} />
          </motion.div>
        )}

        {judging.phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex items-center justify-center p-8"
          >
            <div className="glass-panel p-8 max-w-lg text-center">
              <div className="text-5xl mb-4">⚠</div>
              <h2 className="font-serif text-2xl text-court-red mb-3">
                Court Adjourned — Error
              </h2>
              <p className="text-court-silver mb-6">{judging.error}</p>
              <button
                onClick={judging.reset}
                className="px-6 py-3 bg-court-gold/20 border border-court-gold/40 rounded-lg text-court-gold hover:bg-court-gold/30 transition-colors"
              >
                Start New Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
