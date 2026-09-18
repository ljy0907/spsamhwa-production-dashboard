"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createPasswordHash } from "@/lib/auth";

export async function resetPasswordAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const birthDate = String(formData.get("birthDate") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const newPasswordConfirm = String(formData.get("newPasswordConfirm") ?? "");

  if (newPassword.length < 4) {
    redirect("/forgot-password?error=password");
  }
  if (newPassword !== newPasswordConfirm) {
    redirect("/forgot-password?error=mismatch");
  }

  const user = username ? await prisma.user.findUnique({ where: { username } }) : null;

  if (!user || user.birthDate !== birthDate) {
    redirect("/forgot-password?error=notfound");
  }

  const { passwordSalt, passwordHash } = createPasswordHash(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordSalt, passwordHash },
  });

  redirect("/login?reset=1");
}
