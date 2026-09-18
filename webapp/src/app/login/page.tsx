import Link from "next/link";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string; reset?: string }>;
}) {
  const { error, registered, reset } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        action={loginAction}
        className="w-full max-w-xs rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        <h1 className="mb-1 text-lg font-bold text-slate-800">생산 지표 Dashboard</h1>
        <p className="mb-5 text-sm text-slate-500">아이디와 비밀번호를 입력해주세요.</p>

        <input
          type="text"
          name="username"
          required
          autoFocus
          placeholder="아이디"
          className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />
        <input
          type="password"
          name="password"
          required
          placeholder="비밀번호"
          className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          로그인
        </button>

        {error ? (
          <p className="mt-3 text-xs text-red-600">아이디 또는 비밀번호가 올바르지 않습니다.</p>
        ) : null}
        {registered ? (
          <p className="mt-3 text-xs text-blue-600">회원가입이 완료됐습니다. 로그인해주세요.</p>
        ) : null}
        {reset ? (
          <p className="mt-3 text-xs text-blue-600">비밀번호가 재설정됐습니다. 새 비밀번호로 로그인해주세요.</p>
        ) : null}

        <div className="mt-4 flex justify-center gap-3 text-xs text-slate-500">
          <Link href="/signup" className="hover:text-blue-600 hover:underline">
            회원가입
          </Link>
          <span>·</span>
          <Link href="/forgot-password" className="hover:text-blue-600 hover:underline">
            비밀번호 찾기
          </Link>
        </div>
      </form>
    </main>
  );
}
