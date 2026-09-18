import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        action={loginAction}
        className="w-full max-w-xs rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        <h1 className="mb-1 text-lg font-bold text-slate-800">생산 지표 Dashboard</h1>
        <p className="mb-5 text-sm text-slate-500">비밀번호를 입력해주세요.</p>
        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="비밀번호"
          className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-center text-lg tracking-widest outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          입장
        </button>
        {error ? (
          <p className="mt-3 text-xs text-red-600">비밀번호가 올바르지 않습니다.</p>
        ) : null}
      </form>
    </main>
  );
}
