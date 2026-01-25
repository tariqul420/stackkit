import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

export async function requireAdmin() {
  const session = await getSession();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return session.user;
}

export async function getUser() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session.user;
}