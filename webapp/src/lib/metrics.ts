import { prisma } from "@/lib/db";
import type { Metric, Triple } from "@/lib/metrics-constants";

export * from "@/lib/metrics-constants";

const ZERO: Triple = { actual: 0, target: 0, prevYearActual: 0 };

function addTriple(a: Triple, b: Triple): Triple {
  return {
    actual: a.actual + b.actual,
    target: a.target + b.target,
    prevYearActual: a.prevYearActual + b.prevYearActual,
  };
}

async function sumRaw(
  teams: string[],
  year: number,
  months: number[],
  metric: string,
  sub: string
): Promise<Triple> {
  if (teams.length === 0 || months.length === 0) return ZERO;
  const result = await prisma.metricRecord.aggregate({
    where: { teamId: { in: teams }, year, month: { in: months }, metric, sub },
    _sum: { actual: true, target: true, prevYearActual: true },
  });
  return {
    actual: result._sum.actual ?? 0,
    target: result._sum.target ?? 0,
    prevYearActual: result._sum.prevYearActual ?? 0,
  };
}

// '간접비' = 인건비 + 경비(그 외 경비). sub으로 인건비/경비 한쪽만 볼 수도 있음.
async function indirectTotal(teams: string[], year: number, months: number[], sub: string): Promise<Triple> {
  if (sub === "인건비") return sumRaw(teams, year, months, "인건비", "전체");
  if (sub === "경비") return sumRaw(teams, year, months, "경비", "전체");
  const [labor, expense] = await Promise.all([
    sumRaw(teams, year, months, "인건비", "전체"),
    sumRaw(teams, year, months, "경비", "전체"),
  ]);
  return addTriple(labor, expense);
}

// 생산성 = 생산량÷작업시간, 단위당간접비 = 간접비÷생산량 — 둘 다 "합의 비율"로 계산
// (월별 비율의 합/평균이 아님. months가 여러 달이면 먼저 다 더한 뒤 한 번만 나눔)
export async function aggregateMetric(
  teams: string[],
  year: number,
  months: number[],
  metric: Metric,
  sub?: string
): Promise<Triple> {
  if (metric === "생산성") {
    const [vol, hrs] = await Promise.all([
      sumRaw(teams, year, months, "생산량", "전체"),
      sumRaw(teams, year, months, "작업시간", "전체"),
    ]);
    return {
      actual: hrs.actual ? vol.actual / hrs.actual : 0,
      target: hrs.target ? vol.target / hrs.target : 0,
      prevYearActual: hrs.prevYearActual ? vol.prevYearActual / hrs.prevYearActual : 0,
    };
  }
  if (metric === "단위당간접비") {
    const [vol, indirect] = await Promise.all([
      sumRaw(teams, year, months, "생산량", "전체"),
      indirectTotal(teams, year, months, "전체"),
    ]);
    return {
      actual: vol.actual ? indirect.actual / vol.actual : 0,
      target: vol.target ? indirect.target / vol.target : 0,
      prevYearActual: vol.prevYearActual ? indirect.prevYearActual / vol.prevYearActual : 0,
    };
  }
  if (metric === "간접비") {
    return indirectTotal(teams, year, months, sub ?? "전체");
  }
  return sumRaw(teams, year, months, metric, sub ?? "전체");
}

export async function getYears(): Promise<number[]> {
  const rows = await prisma.metricRecord.findMany({
    distinct: ["year"],
    select: { year: true },
    orderBy: { year: "desc" },
  });
  return rows.map((r) => r.year);
}
