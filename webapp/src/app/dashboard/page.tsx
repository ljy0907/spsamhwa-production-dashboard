import { logoutAction } from "./actions";
import FilterBar from "./FilterBar";
import { BarChart, LineChart } from "./charts";
import {
  METRICS,
  METRIC_LABELS,
  UNIT,
  SUB_FILTERS,
  TEAM_LABELS,
  isMetric,
  activeTeams,
  monthsFor,
  deriveRates,
  type Metric,
} from "@/lib/metrics-constants";
import { aggregateMetric, getYears } from "@/lib/metrics";
import { fmtNum, fmtRate, fmtAchv, rateClass, monthLabel } from "@/lib/format";

type SearchParams = {
  year?: string;
  month?: string;
  metric?: string;
  sub?: string;
  scope?: string;
  team?: string;
};

function subLabelFor(metric: Metric, sub?: string) {
  return SUB_FILTERS[metric] && sub ? ` · ${sub}` : "";
}
function teamLabelFor(team: string) {
  return team && team !== "전체" ? ` · ${TEAM_LABELS[team] ?? team}` : "";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const years = await getYears();
  const currentYear = new Date().getFullYear();
  const year = Number(sp.year) || years[0] || currentYear;
  const month: number | "all" = sp.month === "all" || !sp.month ? "all" : Number(sp.month);
  const metric: Metric = isMetric(sp.metric ?? "") ? (sp.metric as Metric) : "생산량";
  const sub = SUB_FILTERS[metric] ? sp.sub || "전체" : undefined;
  const scope = sp.scope || "전체";
  const team = sp.team || "전체";

  const teams = activeTeams(scope, team);
  const months = monthsFor(month);
  const unit = UNIT[metric];

  const cardsData = await Promise.all(
    METRICS.map(async (m) => {
      const raw = await aggregateMetric(teams, year, months, m, "전체");
      return { metric: m, ...deriveRates(raw) };
    })
  );

  const barValues = await Promise.all(
    teams.map((t) => aggregateMetric([t], year, months, metric, sub))
  );

  const lineSeries = { actual: [] as number[], target: [] as number[], prevYearActual: [] as number[] };
  for (let m = 1; m <= 12; m++) {
    const d = await aggregateMetric(teams, year, [m], metric, sub);
    lineSeries.actual.push(d.actual);
    lineSeries.target.push(d.target);
    lineSeries.prevYearActual.push(d.prevYearActual);
  }

  const tableRows = await Promise.all(
    teams.map(async (t) => ({
      team: t,
      ...deriveRates(await aggregateMetric([t], year, months, metric, sub)),
    }))
  );
  const tableTotal = deriveRates(await aggregateMetric(teams, year, months, metric, sub));
  const footLabel = team !== "전체" ? (TEAM_LABELS[team] ?? team) : scope;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">생산 지표 Dashboard</h1>
          <p className="text-sm text-slate-500">
            SP삼화 생산부서 — 부서 구분 · 연도/월별 생산량 / 생산성 / 단위당 간접비 / 간접비 / 작업시간 / 인원현황
          </p>
        </div>
        <form action={logoutAction}>
          <button className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-red-400 hover:text-red-600">
            로그아웃
          </button>
        </form>
      </div>

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-800">
        ⚠️ &apos;수성&apos;, &apos;수지&apos; 팀은 삼화생산계 · 안산공장 · 수지에 중복 집계됩니다. 삼화생산계 = 안산공장 + 공주공장.
      </div>

      <FilterBar
        years={years.length ? years : [currentYear]}
        year={year}
        month={month}
        metric={metric}
        sub={sub ?? ""}
        scope={scope}
        team={team}
      />

      <div className="mb-2 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
        {cardsData.map((c) => (
          <div key={c.metric} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-500">
              {METRIC_LABELS[c.metric]} <span className="font-normal">({UNIT[c.metric]})</span>
            </h3>
            <div className="mb-2 text-xl font-bold text-slate-800">
              {fmtNum(c.actual)}{" "}
              <span className="text-xs font-normal text-slate-500">{UNIT[c.metric]}</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-slate-200 py-1 text-[12.5px]">
              <span className="text-slate-500">목표</span>
              <span>{fmtNum(c.target)} {UNIT[c.metric]}</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-slate-200 py-1 text-[12.5px]">
              <span className="text-slate-500">전년도 실적</span>
              <span>{fmtNum(c.prevYearActual)} {UNIT[c.metric]}</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-slate-200 py-1 text-[12.5px]">
              <span className="text-slate-500">달성율</span>
              <span className={rateClass(c.achievementRate, true)}>{fmtAchv(c.achievementRate)}</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-slate-200 py-1 text-[12.5px]">
              <span className="text-slate-500">증감율</span>
              <span className={rateClass(c.changeRate, false)}>{fmtRate(c.changeRate)}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mb-4 text-xs text-slate-500">
        달성율 100% 이상 · 증감율 0% 이상은 <span className="font-semibold text-blue-600">파랑</span>, 미만은{" "}
        <span className="font-semibold text-red-600">빨강</span>으로 표시됩니다. (카드는 항상 &apos;전체&apos; 기준)
      </p>

      <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(420px,1fr))] gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">
            팀별 비교 — {METRIC_LABELS[metric]}
            {subLabelFor(metric, sub)}
            {teamLabelFor(team)} 실적 ({monthLabel(month)})
          </h3>
          <BarChart teams={teams} values={barValues.map((v) => v.actual)} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">
            월별 추이 — {METRIC_LABELS[metric]}
            {subLabelFor(metric, sub)} ({team !== "전체" ? TEAM_LABELS[team] ?? team : scope})
          </h3>
          <LineChart series={lineSeries} />
          <div className="mt-1.5 flex flex-wrap gap-3.5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <i className="inline-block h-0 w-3.5 border-t-2 border-blue-600" />실적
            </span>
            <span className="inline-flex items-center gap-1">
              <i className="inline-block h-0 w-3.5 border-t-2 border-dashed border-slate-400" />목표
            </span>
            <span className="inline-flex items-center gap-1">
              <i className="inline-block h-0 w-3.5 border-t-2 border-dotted border-amber-500" />전년도 실적
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-800">
          팀별 상세 — {METRIC_LABELS[metric]}
          {subLabelFor(metric, sub)}
          {teamLabelFor(team)} ({monthLabel(month)})
        </h3>
        <table className="w-full min-w-[560px] border-collapse text-[13px]">
          <thead>
            <tr className="bg-slate-50 text-[12.5px] text-slate-500">
              <th className="p-2.5 text-left font-semibold">팀</th>
              <th className="p-2.5 text-right font-semibold">실적</th>
              <th className="p-2.5 text-right font-semibold">목표</th>
              <th className="p-2.5 text-right font-semibold">전년도 실적</th>
              <th className="p-2.5 text-right font-semibold">달성율</th>
              <th className="p-2.5 text-right font-semibold">증감율</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((r) => (
              <tr key={r.team} className="border-b border-slate-200">
                <td className="p-2.5 text-left font-semibold">{TEAM_LABELS[r.team] ?? r.team}</td>
                <td className="p-2.5 text-right">{fmtNum(r.actual)} {unit}</td>
                <td className="p-2.5 text-right">{fmtNum(r.target)} {unit}</td>
                <td className="p-2.5 text-right">{fmtNum(r.prevYearActual)} {unit}</td>
                <td className={`p-2.5 text-right ${rateClass(r.achievementRate, true)}`}>
                  {fmtAchv(r.achievementRate)}
                </td>
                <td className={`p-2.5 text-right ${rateClass(r.changeRate, false)}`}>
                  {fmtRate(r.changeRate)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-bold">
              <td className="p-2.5 text-left">{footLabel} 합계</td>
              <td className="p-2.5 text-right">{fmtNum(tableTotal.actual)} {unit}</td>
              <td className="p-2.5 text-right">{fmtNum(tableTotal.target)} {unit}</td>
              <td className="p-2.5 text-right">{fmtNum(tableTotal.prevYearActual)} {unit}</td>
              <td className={`p-2.5 text-right ${rateClass(tableTotal.achievementRate, true)}`}>
                {fmtAchv(tableTotal.achievementRate)}
              </td>
              <td className={`p-2.5 text-right ${rateClass(tableTotal.changeRate, false)}`}>
                {fmtRate(tableTotal.changeRate)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <footer className="pb-6 text-center text-xs text-slate-500">
        생산 지표 Dashboard · Next.js + SQLite 버전 · 1차 산출물(조회 전용)
      </footer>
    </main>
  );
}
