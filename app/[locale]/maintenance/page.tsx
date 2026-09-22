import { setRequestLocale } from "next-intl/server";
import Maintenance from "@/components/Maintenance";

export async function generateMetadata() {
  return {
    robots: { index: false, follow: false },
  };
}

export default async function MaintenancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Maintenance />;
}
