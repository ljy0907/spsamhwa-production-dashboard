import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "dashboard_session";

function getPassword(): string {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) {
    throw new Error("DASHBOARD_PASSWORD 환경변수가 설정되지 않았습니다. .env 파일을 확인하세요.");
  }
  return password;
}

// 세션 쿠키에는 비밀번호 원문 대신, 비밀번호로부터 계산한 토큰만 저장합니다.
// 이 토큰은 서버(DASHBOARD_PASSWORD를 아는 쪽)만 재계산할 수 있어 위조가 불가능합니다.
function expectedSessionToken(): string {
  return createHash("sha256").update(getPassword()).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function checkPassword(input: string): boolean {
  return safeEqual(input, getPassword());
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, expectedSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7일
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function hasValidSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return safeEqual(token, expectedSessionToken());
}
