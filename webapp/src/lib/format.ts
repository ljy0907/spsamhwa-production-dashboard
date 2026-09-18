export function fmtNum(v: number) {
  return Number.isFinite(v) ? Math.round(v).toLocaleString("ko-KR") : "-";
}
export function fmtRate(v: number) {
  return Number.isFinite(v) ? (v >= 0 ? "+" : "") + v.toFixed(1) + "%" : "-";
}
export function fmtAchv(v: number) {
  return Number.isFinite(v) ? v.toFixed(1) + "%" : "-";
}
export function fmtShort(v: number) {
  if (v >= 100000000) return (v / 100000000).toFixed(1) + "억";
  if (v >= 10000) return (v / 10000).toFixed(0) + "만";
  return Math.round(v).toLocaleString("ko-KR");
}
export function rateClass(v: number, isAchv: boolean) {
  if (!Number.isFinite(v)) return "text-slate-800";
  if (isAchv) return v >= 100 ? "text-blue-600 font-semibold" : "text-red-600 font-semibold";
  return v >= 0 ? "text-blue-600 font-semibold" : "text-red-600 font-semibold";
}
export function monthLabel(m: number | "all") {
  return m === "all" ? "전체" : `${m}월`;
}
