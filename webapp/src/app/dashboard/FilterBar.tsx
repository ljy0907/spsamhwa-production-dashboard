"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  SCOPES,
  METRICS,
  METRIC_LABELS,
  SUB_FILTERS,
  TEAM_LABELS,
  teamsForScope,
  type Metric,
} from "@/lib/metrics-constants";

type Props = {
  years: number[];
  year: number;
  month: number | "all";
  metric: Metric;
  sub: string;
  scope: string;
  team: string;
};

function TabButton({
  active,
  onClick,
  children,
  variant = "default",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "sub";
}) {
  const activeClass =
    variant === "sub" ? "bg-amber-500 border-amber-500 text-white" : "bg-blue-600 border-blue-600 text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
        active ? `${activeClass} font-semibold` : "border-slate-200 bg-white text-slate-800 hover:border-blue-600"
      }`}
    >
      {children}
    </button>
  );
}

export default function FilterBar({ years, year, month, metric, sub, scope, team }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(updates: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  }

  function onScopeChange(nextScope: string) {
    // 공장구분이 바뀌면 팀 드릴다운은 초기화
    navigate({ scope: nextScope, team: "전체" });
  }

  function onMetricChange(nextMetric: string) {
    const hasSub = Boolean(SUB_FILTERS[nextMetric as Metric]);
    navigate({ metric: nextMetric, sub: hasSub ? "전체" : "" });
  }

  const subOptions = SUB_FILTERS[metric];
  const teamOptions = teamsForScope(scope);

  return (
    <div className="mb-3 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <span className="mr-1 text-[13px] text-slate-500">년도</span>
        <select
          value={year}
          onChange={(e) => navigate({ year: e.target.value })}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13px]"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </select>
        <span className="ml-2 mr-1 text-[13px] text-slate-500">월</span>
        <select
          value={month}
          onChange={(e) => navigate({ month: e.target.value })}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13px]"
        >
          <option value="all">전체</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}월
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="mr-1 text-[13px] text-slate-500">지표</span>
          <select
            value={metric}
            onChange={(e) => onMetricChange(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13px]"
          >
            {METRICS.map((m) => (
              <option key={m} value={m}>
                {METRIC_LABELS[m]}
              </option>
            ))}
          </select>
        </div>
        {subOptions && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-[13px] text-slate-500">구분</span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {subOptions.map((opt) => (
                <TabButton key={opt} active={opt === sub} onClick={() => navigate({ sub: opt })} variant="sub">
                  {opt}
                </TabButton>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="mr-1 text-[13px] text-slate-500">공장구분</span>
          <select
            value={scope}
            onChange={(e) => onScopeChange(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13px]"
          >
            {SCOPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-[13px] text-slate-500">구분</span>
          <div className="flex flex-wrap justify-center gap-1.5">
            <TabButton active={team === "전체"} onClick={() => navigate({ team: "전체" })}>
              전체
            </TabButton>
            {teamOptions.map((t) => (
              <TabButton key={t} active={t === team} onClick={() => navigate({ team: t })}>
                {TEAM_LABELS[t] ?? t}
              </TabButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
