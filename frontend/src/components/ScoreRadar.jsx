import { motion } from "framer-motion";

const DIMENSIONS = [
  { key: "technical", label: "Technical" },
  { key: "business", label: "Business" },
  { key: "presentation", label: "Presentation" },
  { key: "demo_quality", label: "Demo" },
  { key: "innovation", label: "Innovation" },
];

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 80;

function polarToCart(angle, r) {
  const rad = (Math.PI / 180) * (angle - 90);
  return {
    x: CENTER + r * Math.cos(rad),
    y: CENTER + r * Math.sin(rad),
  };
}

export default function ScoreRadar({ scores }) {
  const angleStep = 360 / DIMENSIONS.length;

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const points = DIMENSIONS.map((dim, i) => {
    const val = (scores[dim.key] || 0) / 10;
    return polarToCart(i * angleStep, RADIUS * val);
  });

  const pathData =
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    " Z";

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[280px] mx-auto">
        {/* Grid circles */}
        {gridLevels.map((level) => {
          const gridPoints = DIMENSIONS.map((_, i) =>
            polarToCart(i * angleStep, RADIUS * level)
          );
          const gridPath =
            gridPoints
              .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
              .join(" ") + " Z";
          return (
            <path
              key={level}
              d={gridPath}
              fill="none"
              stroke="rgba(30,30,53,0.8)"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Axis lines */}
        {DIMENSIONS.map((_, i) => {
          const end = polarToCart(i * angleStep, RADIUS);
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={end.x}
              y2={end.y}
              stroke="rgba(30,30,53,0.6)"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Data shape */}
        <motion.path
          d={pathData}
          fill="rgba(201,168,76,0.15)"
          stroke="rgba(201,168,76,0.8)"
          strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="#c9a84c"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.1 }}
          />
        ))}

        {/* Labels */}
        {DIMENSIONS.map((dim, i) => {
          const labelPos = polarToCart(i * angleStep, RADIUS + 18);
          return (
            <text
              key={dim.key}
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-court-silver text-[7px]"
            >
              {dim.label}
            </text>
          );
        })}

        {/* Score values */}
        {DIMENSIONS.map((dim, i) => {
          const valPos = polarToCart(i * angleStep, RADIUS + 28);
          return (
            <motion.text
              key={`val-${dim.key}`}
              x={valPos.x}
              y={valPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-court-gold text-[8px] font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
            >
              {scores[dim.key]?.toFixed?.(1) ?? scores[dim.key]}
            </motion.text>
          );
        })}
      </svg>

      {/* Overall score in center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: "spring" }}
          className="text-center"
        >
          <div className="text-3xl font-serif font-bold text-court-gold">
            {scores.overall?.toFixed?.(1) ?? scores.overall}
          </div>
          <div className="text-[10px] text-court-silver/60 uppercase tracking-wider">
            Overall
          </div>
        </motion.div>
      </div>
    </div>
  );
}
