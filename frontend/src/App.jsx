import { AnimatePresence, motion } from "framer-motion";
import useJudging from "./hooks/useJudging";
import Landing from "./components/Landing";
import Pipeline from "./components/Pipeline";
import Verdict from "./components/Verdict";

export default function App() {
  const judging = useJudging();

  return (
    <div className="min-h-screen bg-pipe-bg relative">
      <AnimatePresence mode="wait">
        {judging.phase === "idle" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Landing onSubmit={judging.submit} />
          </motion.div>
        )}

        {(judging.phase === "submitting" || judging.phase === "streaming") && (
          <motion.div
            key="pipeline"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Pipeline judging={judging} />
          </motion.div>
        )}

        {judging.phase === "verdict" && (
          <motion.div
            key="verdict"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
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
            <div className="card p-8 max-w-lg text-center">
              <div className="w-12 h-12 rounded-full bg-pipe-red-wash flex items-center justify-center mx-auto mb-4">
                <span className="text-pipe-red text-xl font-bold">!</span>
              </div>
              <h2 className="text-xl font-bold text-pipe-text mb-2">
                Pipeline Failed
              </h2>
              <p className="text-pipe-muted mb-6 text-sm leading-relaxed">
                {judging.error}
              </p>
              <button
                onClick={judging.reset}
                className="px-6 py-2.5 bg-pipe-primary text-white rounded-lg text-sm font-medium hover:bg-pipe-primary-dim transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
