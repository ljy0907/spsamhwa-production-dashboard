import Link from "next/link";
import { signupAction } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  username: "아이디는 2자 이상 입력해주세요.",
  password: "비밀번호는 4자 이상 입력해주세요.",
  mismatch: "비밀번호가 일치하지 않습니다.",
  birthdate: "생년월일 형식이 올바르지 않습니다 (YYYY-MM-DD).",
  duplicate: "이미 사용 중인 아이디입니다.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        action={signupAction}
        className="w-full max-w-xs rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        <h1 className="mb-1 text-lg font-bold text-slate-800">회원가입</h1>
        <p className="mb-5 text-sm text-slate-500">생산 지표 Dashboard 계정을 만듭니다.</p>

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
          className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />
        <input
          type="password"
          name="passwordConfirm"
          required
          placeholder="비밀번호 확인"
          className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />
        <label className="mb-1 block text-left text-xs text-slate-500">생년월일</label>
        <input
          type="date"
          name="birthDate"
          required
          className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          가입하기
        </button>

        {error && ERROR_MESSAGES[error] ? (
          <p className="mt-3 text-xs text-red-600">{ERROR_MESSAGES[error]}</p>
        ) : null}

        <div className="mt-4 text-xs text-slate-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </div>
      </form>
    </main>
  );
}
