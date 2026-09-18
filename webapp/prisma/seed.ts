// 기존 dashboard.html의 mulberry32 시드 난수 목업 데이터 생성 로직을 그대로 이식한 시드 스크립트.
// 실행: npx tsx prisma/seed.ts
import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SCOPE_TEAM_MAP: Record<string, string[]> = {
  삼화생산계: ["건축", "공업", "수성", "수지", "공주", "분체"],
  안산공장: ["건축", "공업", "수성", "수지"],
  공주공장: ["공주", "분체"],
  외주: ["임가공", "OEM", "ODM"],
  수지: ["수성", "수지"],
};
const ALL_TEAMS = [...new Set(Object.values(SCOPE_TEAM_MAP).flat())];
const TEAM_LABELS: Record<string, string> = {
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
const CURRENT_YEAR = new Date().getFullYear();

function hashSeed(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function splitThree(total: number, rA: number, rB: number): [number, number, number] {
  const a = Math.round(total * rA);
  const b = Math.round(total * rB);
  return [a, b, total - a - b];
}
function splitTwo(total: number, rB: number): [number, number] {
  const b = Math.round(total * rB);
  return [total - b, b];
}

type Triple = { actual: number; target: number; prevYearActual: number };
type MonthRow = {
  month: number;
  생산량: { 전체: Triple; A부: Triple; B부: Triple; C부: Triple };
  작업인원: { 전체: Triple; "6급직": Triple; 계약직: Triple };
  작업시간: Triple;
  인건비: Triple;
  경비: Triple;
};

function genTeamData(team: string): MonthRow[] {
  const rand = mulberry32(hashSeed(team));
  const baseVolume = 8000 + rand() * 38000;
  const baseWorkers = 8 + Math.floor(rand() * 18);
  const baseHours = 300 + rand() * 280;
  const wagePerPerson = 3200000 + rand() * 900000;
  const indirectBase = baseVolume * 15 + 4500000;

  const rA = 0.3 + rand() * 0.25;
  const rB = 0.2 + rand() * 0.2;
  const contractRatio = 0.15 + rand() * 0.2;

  const months: MonthRow[] = [];
  let volTrend = baseVolume;
  for (let m = 1; m <= 12; m++) {
    const noise = 0.85 + rand() * 0.3;
    const 실적생산량 = Math.round(volTrend * noise);
    const 목표생산량 = Math.round(실적생산량 * (0.92 + rand() * 0.16));
    const 전년도생산량 = Math.round(실적생산량 * (0.8 + rand() * 0.25));

    const 작업인원 = Math.max(4, baseWorkers + Math.round((rand() - 0.5) * 4));
    const 목표작업인원 = Math.max(1, Math.round(작업인원 * (0.95 + rand() * 0.1)));
    const 전년도작업인원 = Math.max(1, Math.round(작업인원 * (0.9 + rand() * 0.15)));

    const 실적작업시간 = Math.round(baseHours * (0.9 + rand() * 0.2));
    const 목표작업시간 = Math.round(실적작업시간 * (0.95 + rand() * 0.1));
    const 전년도작업시간 = Math.round(실적작업시간 * (0.9 + rand() * 0.15));

    const 실적인건비 = Math.round(작업인원 * wagePerPerson * (0.98 + rand() * 0.06));
    const 목표인건비 = Math.round(실적인건비 * (0.95 + rand() * 0.1));
    const 전년도인건비 = Math.round(실적인건비 * (0.9 + rand() * 0.12));
    const 실적간접비 = Math.round((indirectBase + 실적생산량 * 8) * (0.9 + rand() * 0.2));
    const 목표간접비 = Math.round(실적간접비 * (0.95 + rand() * 0.1));
    const 전년도간접비 = Math.round(실적간접비 * (0.88 + rand() * 0.15));

    const [aAct, bAct, cAct] = splitThree(실적생산량, rA, rB);
    const [aTgt, bTgt, cTgt] = splitThree(목표생산량, rA, rB);
    const [aPrv, bPrv, cPrv] = splitThree(전년도생산량, rA, rB);

    const [regAct, conAct] = splitTwo(작업인원, contractRatio);
    const [regTgt, conTgt] = splitTwo(목표작업인원, contractRatio);
    const [regPrv, conPrv] = splitTwo(전년도작업인원, contractRatio);

    months.push({
      month: m,
      생산량: {
        전체: { actual: 실적생산량, target: 목표생산량, prevYearActual: 전년도생산량 },
        A부: { actual: aAct, target: aTgt, prevYearActual: aPrv },
        B부: { actual: bAct, target: bTgt, prevYearActual: bPrv },
        C부: { actual: cAct, target: cTgt, prevYearActual: cPrv },
      },
      작업인원: {
        전체: { actual: 작업인원, target: 목표작업인원, prevYearActual: 전년도작업인원 },
        "6급직": { actual: regAct, target: regTgt, prevYearActual: regPrv },
        계약직: { actual: conAct, target: conTgt, prevYearActual: conPrv },
      },
      작업시간: { actual: 실적작업시간, target: 목표작업시간, prevYearActual: 전년도작업시간 },
      인건비: { actual: 실적인건비, target: 목표인건비, prevYearActual: 전년도인건비 },
      경비: { actual: 실적간접비, target: 목표간접비, prevYearActual: 전년도간접비 },
    });
    volTrend *= 1 + (rand() - 0.45) * 0.05;
  }
  return months;
}

async function main() {
  console.log(`Seeding for year ${CURRENT_YEAR}...`);

  await prisma.metricRecord.deleteMany();
  await prisma.scopeTeam.deleteMany();
  await prisma.team.deleteMany();

  await prisma.team.createMany({
    data: ALL_TEAMS.map((id) => ({ id, displayName: TEAM_LABELS[id] })),
  });

  const scopeTeamRows = Object.entries(SCOPE_TEAM_MAP).flatMap(([scope, teams]) =>
    teams.map((teamId) => ({ scope, teamId }))
  );
  await prisma.scopeTeam.createMany({ data: scopeTeamRows });

  const records: {
    year: number;
    month: number;
    teamId: string;
    metric: string;
    sub: string;
    actual: number;
    target: number;
    prevYearActual: number;
  }[] = [];

  for (const team of ALL_TEAMS) {
    const months = genTeamData(team);
    for (const row of months) {
      const push = (metric: string, sub: string, t: Triple) =>
        records.push({
          year: CURRENT_YEAR,
          month: row.month,
          teamId: team,
          metric,
          sub,
          actual: t.actual,
          target: t.target,
          prevYearActual: t.prevYearActual,
        });

      push("생산량", "전체", row.생산량.전체);
      push("생산량", "A부", row.생산량.A부);
      push("생산량", "B부", row.생산량.B부);
      push("생산량", "C부", row.생산량.C부);

      push("작업인원", "전체", row.작업인원.전체);
      push("작업인원", "6급직", row.작업인원["6급직"]);
      push("작업인원", "계약직", row.작업인원.계약직);

      push("작업시간", "전체", row.작업시간);
      push("인건비", "전체", row.인건비);
      push("경비", "전체", row.경비);
    }
  }

  await prisma.metricRecord.createMany({ data: records });
  console.log(`Inserted ${records.length} metric records for ${ALL_TEAMS.length} teams.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
