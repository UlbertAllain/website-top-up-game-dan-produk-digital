import { notFound } from "next/navigation";

import { InformationPageView } from "@/components/public/information-page-view";
import { getPublicInformationPage } from "@/features/public/public.service";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const page = await getPublicInformationPage("terms");

  if (!page) {
    notFound();
  }

  return <InformationPageView page={page} eyebrow="Informasi Layanan" />;
}
