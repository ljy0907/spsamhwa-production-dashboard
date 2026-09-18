import { TEAM_LABELS } from "@/lib/metrics-constants";
import { fmtShort } from "@/lib/format";

const W = 560;
const H = 280;

function GridLines({ maxVal, chartH, pad }: { maxVal: number; chartH: number; pad: { top: number; left: number; right: number } }) {
  const lines = Array.from({ length: 5 }, (_, i) => {
    const y = pad.top + chartH - (chartH * i) / 4;
    const val = (maxVal * i) / 4;
    return { y, val };
  });
  return (
    <>
      {lines.map((g, i) => (
        <g key={i}>
          <line x1={pad.left} y1={g.y} x2={W - pad.right} y2={g.y} stroke="#e2e8f0" strokeWidth={1} />
          <text x={pad.left - 8} y={g.y + 4} fontSize={10.5} fill="#64748b" textAnchor="end">
            {fmtShort(g.val)}
          </text>
        </g>
      ))}
    </>
  );
}

export function BarChart({ teams, values }: { teams: string[]; values: number[] }) {
  const pad = { top: 20, right: 16, bottom: 44, left: 64 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxVal = Math.max(...values, 1) * 1.2;
  const gap = 10;
  const barW = (chartW - gap * (teams.length - 1)) / Math.max(teams.length, 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
      <GridLines maxVal={maxVal} chartH={chartH} pad={pad} />
      {teams.map((team, i) => {
        const val = values[i] ?? 0;
        const barH = chartH * (val / maxVal);
        const x = pad.left + i * (barW + gap);
        const y = pad.top + chartH - barH;
        return (
          <g key={team}>
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill="#2563eb" />
            <text x={x + barW / 2} y={y - 6} fontSize={10.5} fill="#1e293b" textAnchor="middle">
              {fmtShort(val)}
            </text>
            <text x={x + barW / 2} y={H - pad.bottom + 18} fontSize={11.5} fill="#334155" textAnchor="middle">
              {TEAM_LABELS[team] ?? team}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

type MonthlySeries = { actual: number[]; target: number[]; prevYearActual: number[] };

export function LineChart({ series }: { series: MonthlySeries }) {
  const pad = { top: 20, right: 16, bottom: 32, left: 64 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const allVals = [...series.actual, ...series.target, ...series.prevYearActual];
  const maxVal = Math.max(...allVals, 1) * 1.15;
  const stepX = chartW / 11;

  function pts(arr: number[]) {
    return arr
      .map((v, i) => {
        const x = pad.left + i * stepX;
        const y = pad.top + chartH - (chartH * v) / maxVal;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
      <GridLines maxVal={maxVal} chartH={chartH} pad={pad} />
      {Array.from({ length: 12 }, (_, i) => (
        <text
          key={i}
          x={pad.left + i * stepX}
          y={H - pad.bottom + 18}
          fontSize={10.5}
          fill="#334155"
          textAnchor="middle"
        >
          {i + 1}월
        </text>
      ))}
      <polyline
        points={pts(series.prevYearActual)}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={2}
        strokeDasharray="2,3"
      />
      <polyline points={pts(series.target)} fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="6,4" />
      <polyline points={pts(series.actual)} fill="none" stroke="#2563eb" strokeWidth={2.5} />
      {series.actual.map((v, i) => {
        const x = pad.left + i * stepX;
        const y = pad.top + chartH - (chartH * v) / maxVal;
        return <circle key={i} cx={x} cy={y} r={3} fill="#2563eb" />;
      })}
    </svg>
  );
}
