"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = username ? await prisma.user.findUnique({ where: { username } }) : null;

  if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    redirect("/login?error=1");
  }

  await createSession(user.id);
  redirect("/dashboard");
}
