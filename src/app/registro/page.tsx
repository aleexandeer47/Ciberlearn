import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return <AuthPage mode="signup" />;
}
