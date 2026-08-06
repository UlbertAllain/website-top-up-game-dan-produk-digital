import { notFound } from "next/navigation";

import { InformationPageView } from "@/components/public/information-page-view";
import { getPublicInformationPage } from "@/features/public/public.service";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const page = await getPublicInformationPage("about");

  if (!page) {
    notFound();
  }

  return <InformationPageView page={page} eyebrow="Tentang Bisnis" />;
}
