import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPageSession } from "@/features/auth/auth-session";
import { getSiteSettings } from "@/features/settings/settings.service";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const [session, settings] = await Promise.all([
    requireAdminPageSession(),
    getSiteSettings(),
  ]);

  return (
    <AdminShell adminEmail={session.email} businessName={settings.businessName}>
      {children}
    </AdminShell>
  );
}
