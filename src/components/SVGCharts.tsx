import React, { useState } from "react";

// Donut Skill Chart Props
interface PieChartProps {
  matchedCount: number;
  missingCount: number;
}

/**
 * Renders a highly responsive pure-SVG Donut Chart depicting matched vs missing skills
 */
export function SVGPieChart({ matchedCount, missingCount }: PieChartProps) {
  const total = matchedCount + missingCount;
  const matchedPercentage = total > 0 ? Math.round((matchedCount / total) * 100) : 0;
  const missingPercentage = total > 0 ? 100 - matchedPercentage : 0;

  // Donut values (Radius 40, Center 50, Circumference = 2 * PI * r = ~251.2)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (matchedPercentage / 100) * circumference;

  const [hovered, setHovered] = useState<"matched" | "missing" | null>(null);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {/* Missing Skills Base Ring (Grey/Red) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={hovered === "missing" ? "#fee2e2" : "#f1f5f9"}
            strokeWidth="12"
            className="transition-colors duration-200 cursor-pointer"
            onMouseEnter={() => setHovered("missing")}
            onMouseLeave={() => setHovered(null)}
          />
          {/* Matched Skills Segment (Green) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={hovered === "matched" ? "#15803d" : "#16a34a"}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 cursor-pointer"
            onMouseEnter={() => setHovered("matched")}
            onMouseLeave={() => setHovered(null)}
          />
        </svg>

        {/* Center Text Indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            {matchedPercentage}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Skills Match
          </span>
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="mt-4 flex gap-6 text-xs font-semibold">
        <div
          className={`flex items-center gap-2 px-2.5 py-1 rounded transition-all duration-150 ${
            hovered === "matched" ? "bg-green-50 dark:bg-green-950/30 scale-105" : ""
          }`}
          onMouseEnter={() => setHovered("matched")}
          onMouseLeave={() => setHovered(null)}
        >
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-slate-600 dark:text-slate-400">
            Matched: {matchedCount} ({matchedPercentage}%)
          </span>
        </div>
        <div
          className={`flex items-center gap-2 px-2.5 py-1 rounded transition-all duration-150 ${
            hovered === "missing" ? "bg-red-50 dark:bg-red-950/30 scale-105" : ""
          }`}
          onMouseEnter={() => setHovered("missing")}
          onMouseLeave={() => setHovered(null)}
        >
          <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="text-slate-600 dark:text-slate-400">
            Missing: {missingCount} ({missingPercentage}%)
          </span>
        </div>
      </div>
    </div>
  );
}

// Radar Chart Props
interface RadarChartProps {
  skills: number; // 0-100
  experience: number; // 0-100
  projects: number; // 0-100
  education: number; // 0-100
  keywords: number; // 0-100
}

/**
 * Renders a gorgeous 5-axis SVG Radar Chart using standard trigonometry
 */
export function SVGRadarChart({ skills, experience, projects, education, keywords }: RadarChartProps) {
  const axes = [
    { label: "Skills Fit", value: skills },
    { label: "Experience", value: experience },
    { label: "Projects", value: projects },
    { label: "Education", value: education },
    { label: "Keywords", value: keywords },
  ];

  const center = 100;
  const radius = 70;
  const totalAxes = axes.length;

  // Converts polar coordinates (angle, magnitude) to standard Cartesian points
  const getCoordinates = (index: number, score: number) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const valueRatio = Math.max(score, 15) / 100; // minimum score threshold for visible mapping
    const x = center + radius * valueRatio * Math.cos(angle);
    const y = center + radius * valueRatio * Math.sin(angle);
    return { x, y };
  };

  // Coordinates of grid circles/pentagons
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Map data coordinates
  const dataPoints = axes.map((axis, idx) => getCoordinates(idx, axis.value));
  const dataPathString = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-56 h-56">
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
          {/* Grid background pentagons */}
          {gridLevels.map((level, lIdx) => {
            const levelPoints = axes.map((_, idx) => {
              const angle = (Math.PI * 2 / totalAxes) * idx - Math.PI / 2;
              const x = center + radius * level * Math.cos(angle);
              const y = center + radius * level * Math.sin(angle);
              return `${x},${y}`;
            });
            return (
              <polygon
                key={lIdx}
                points={levelPoints.join(" ")}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="0.5"
                strokeDasharray={lIdx < 3 ? "2,2" : "none"}
                className="dark:stroke-slate-700"
              />
            );
          })}

          {/* Core axes spokes */}
          {axes.map((_, idx) => {
            const outerPoint = getCoordinates(idx, 100);
            return (
              <line
                key={idx}
                x1={center}
                y1={center}
                x2={outerPoint.x}
                y2={outerPoint.y}
                stroke="#e2e8f0"
                strokeWidth="0.75"
                className="dark:stroke-slate-800"
              />
            );
          })}

          {/* Overlay Polygon Layer representing Candidate Profile */}
          <polygon
            points={dataPathString}
            fill="rgba(37, 99, 235, 0.2)"
            stroke="#2563eb"
            strokeWidth="1.5"
            className="transition-all duration-500 ease-out"
          />

          {/* Interactive point markers */}
          {dataPoints.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-transform duration-150 transform hover:scale-150"
              />
              <title>{`${axes[idx].label}: ${axes[idx].value}%`}</title>
            </g>
          ))}

          {/* Axes Labels */}
          {axes.map((axis, idx) => {
            const angle = (Math.PI * 2 / totalAxes) * idx - Math.PI / 2;
            const textRadius = radius + 15;
            const x = center + textRadius * Math.cos(angle);
            const y = center + textRadius * Math.sin(angle);

            // Anchor correction based on position
            let anchor = "middle";
            if (Math.cos(angle) > 0.1) anchor = "start";
            if (Math.cos(angle) < -0.1) anchor = "end";

            return (
              <text
                key={idx}
                x={x}
                y={y + 3} // subtle baseline shift
                textAnchor={anchor}
                fontSize="8"
                fontWeight="700"
                className="fill-slate-500 dark:fill-slate-400 font-sans tracking-wide uppercase"
              >
                {axis.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// Score History Props
interface HistoryChartProps {
  scores: number[];
}

/**
 * Renders a sleek horizontal line graph for tracking user score improvements across attempts
 */
export function SVGHistoryChart({ scores }: HistoryChartProps) {
  if (!scores || scores.length === 0) return null;

  // Pad the array if they only have one score to display a clean line
  const displayScores = scores.length === 1 ? [scores[0] - 5, scores[0]] : [...scores];

  const width = 320;
  const height = 90;
  const paddingX = 35;
  const paddingY = 15;

  const pointsCount = displayScores.length;
  const maxScore = 100;
  const minScore = 0;

  // Calculates Cartesian points for score indexes
  const getX = (index: number) => paddingX + (index * (width - paddingX * 2)) / (pointsCount - 1);
  const getY = (score: number) => height - paddingY - (score * (height - paddingY * 2)) / 100;

  const chartPoints = displayScores.map((score, idx) => ({
    x: getX(idx),
    y: getY(score),
    score,
  }));

  const pathD = chartPoints.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Fill gradient path
  const areaD = `
    ${pathD}
    L ${chartPoints[chartPoints.length - 1].x} ${height - paddingY}
    L ${chartPoints[0].x} ${height - paddingY}
    Z
  `.trim();

  return (
    <div className="flex flex-col p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Gradients definitions */}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal intervals) */}
          {[20, 50, 80].map((sc) => (
            <line
              key={sc}
              x1={paddingX}
              y1={getY(sc)}
              x2={width - paddingX}
              y2={getY(sc)}
              stroke="#e2e8f0"
              strokeWidth="0.5"
              strokeDasharray="4,4"
              className="dark:stroke-slate-800"
            />
          ))}

          {/* Gradient area */}
          <path d={areaD} fill="url(#areaGrad)" />

          {/* Main trend line */}
          <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.25"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Plot nodes */}
          {chartPoints.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-all hover:r-5 hover:fill-blue-600"
              />
              {/* Text indicator floating above */}
              <text
                x={p.x}
                y={p.y - 6}
                textAnchor="middle"
                fontSize="7.5"
                fontWeight="800"
                className="fill-slate-700 dark:fill-slate-300 font-sans"
              >
                {p.score}%
              </text>
              <text
                x={p.x}
                y={height - 4}
                textAnchor="middle"
                fontSize="6"
                fontWeight="600"
                className="fill-slate-400 dark:fill-slate-500 font-sans"
              >
                {scores.length === 1 && idx === 0 ? "Initial" : `v${idx + 1}`}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
