// 순수 상수/함수만 모아둠 (DB 접근 없음) — 클라이언트 컴포넌트에서도 안전하게 import 가능.

export const SCOPE_TEAM_MAP: Record<string, string[]> = {
  삼화생산계: ["건축", "공업", "수성", "수지", "공주", "분체"],
  안산공장: ["건축", "공업", "수성", "수지"],
  공주공장: ["공주", "분체"],
  외주: ["임가공", "OEM", "ODM"],
  수지: ["수성", "수지"],
};
export const SCOPES = ["전체", ...Object.keys(SCOPE_TEAM_MAP)];
export const TEAM_LABELS: Record<string, string> = {
  건축: "건축생산팀",
  공업: "공업생산팀",
  수성: "수성생산팀",
  수지: "수지생산팀",
  공주: "공주생산팀",
  분체: "분체생산팀",
  임가공: "임가공",
  OEM: "OEM",
  ODM: "ODM",
};
export const ALL_TEAMS = [...new Set(Object.values(SCOPE_TEAM_MAP).flat())];

export const METRICS = ["생산량", "생산성", "단위당간접비", "간접비", "작업시간", "작업인원"] as const;
export type Metric = (typeof METRICS)[number];

export const METRIC_LABELS: Record<Metric, string> = {
  생산량: "생산량",
  생산성: "생산성",
  단위당간접비: "단위당 간접비",
  간접비: "간접비",
  작업시간: "작업시간",
  작업인원: "인원현황",
};
export const UNIT: Record<Metric, string> = {
  생산량: "L",
  생산성: "L/hr",
  단위당간접비: "원/L",
  간접비: "원",
  작업시간: "hr",
  작업인원: "명",
};
export const SUB_FILTERS: Partial<Record<Metric, string[]>> = {
  생산량: ["전체", "A부", "B부", "C부"],
  간접비: ["전체", "인건비", "경비"],
  작업인원: ["전체", "6급직", "계약직"],
};

export function isMetric(value: string): value is Metric {
  return (METRICS as readonly string[]).includes(value);
}

export function teamsForScope(scope: string): string[] {
  return scope === "전체" ? ALL_TEAMS : (SCOPE_TEAM_MAP[scope] ?? []);
}

// 공장구분으로 좁힌 팀 목록에서, 특정 팀이 추가로 선택돼 있으면 그 팀 하나로 드릴다운.
export function activeTeams(scope: string, team: string): string[] {
  const base = teamsForScope(scope);
  if (team && team !== "전체" && base.includes(team)) return [team];
  return base;
}

export function monthsFor(monthSel: number | "all"): number[] {
  return monthSel === "all" ? Array.from({ length: 12 }, (_, i) => i + 1) : [monthSel];
}

export type Triple = { actual: number; target: number; prevYearActual: number };

export function deriveRates(t: Triple) {
  const achievementRate = t.target ? (t.actual / t.target) * 100 : 0;
  const changeRate = t.prevYearActual ? ((t.actual - t.prevYearActual) / t.prevYearActual) * 100 : 0;
  return { ...t, achievementRate, changeRate };
}
