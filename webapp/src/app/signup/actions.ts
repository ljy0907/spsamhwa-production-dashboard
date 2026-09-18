"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createPasswordHash } from "@/lib/auth";

const BIRTH_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function signupAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const birthDate = String(formData.get("birthDate") ?? "");

  if (!username || username.length < 2) {
    redirect("/signup?error=username");
  }
  if (password.length < 4) {
    redirect("/signup?error=password");
  }
  if (password !== passwordConfirm) {
    redirect("/signup?error=mismatch");
  }
  if (!BIRTH_DATE_RE.test(birthDate)) {
    redirect("/signup?error=birthdate");
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    redirect("/signup?error=duplicate");
  }

  const { passwordSalt, passwordHash } = createPasswordHash(password);
  await prisma.user.create({
    data: { username, passwordSalt, passwordHash, birthDate },
  });

  redirect("/login?registered=1");
}
