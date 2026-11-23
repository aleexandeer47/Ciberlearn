import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/AuthPage";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Crear cuenta", "Sign up") };
}

export default function RegistroPage() {
  return <AuthPage mode="signup" />;
}
