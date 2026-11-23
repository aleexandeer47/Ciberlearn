import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/AuthPage";
import { getT } from "@/lib/i18n-server";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { alternates: await alternatesFor("/entrar"), title: t("Entrar", "Log in") };
}

export default function EntrarPage() {
  return <AuthPage mode="login" />;
}
