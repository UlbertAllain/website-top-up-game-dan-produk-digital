import { notFound } from "next/navigation";

import { InformationPageView } from "@/components/public/information-page-view";
import { getPublicInformationPage } from "@/features/public/public.service";

export const dynamic = "force-dynamic";

export default async function HowToOrderPage() {
  const page = await getPublicInformationPage("how-to-order");

  if (!page) {
    notFound();
  }

  return <InformationPageView page={page} eyebrow="Panduan Pemesanan" />;
}
