import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/login-form";
import { getAdminSession } from "@/features/auth/auth-session";

export default async function LoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main>
      <h1>Login Admin</h1>
      <p>Masuk untuk mengelola katalog website.</p>

      <LoginForm />
    </main>
  );
}
