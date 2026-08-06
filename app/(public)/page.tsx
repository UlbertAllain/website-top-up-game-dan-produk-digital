import { HomePage } from "@/components/public/home-page";
import { getPublicHomeData } from "@/features/public/public.service";

export const dynamic = "force-dynamic";

export default async function PublicHomePage() {
  const data = await getPublicHomeData();

  return <HomePage data={data} />;
}
