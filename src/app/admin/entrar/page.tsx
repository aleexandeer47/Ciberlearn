import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Logo } from "@/components/SiteHeader";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Acceso de administración", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <main className="grid flex-1 place-items-center bg-desk-3 px-4 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 text-[17px] font-semibold">
          <Logo />
          {SITE.name}
        </Link>
        <div className="rounded-3xl border border-desk-line bg-desk-2 p-6 sm:p-8">
          <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-field text-brand">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <span className="eyebrow">Administración</span>
          <h1 className="mt-2 font-display text-2xl">Entrar al panel</h1>
          <p className="mb-6 mt-1 text-sm text-fog">Solo para cuentas con permiso de administrador.</p>
          <Suspense>
            <AuthForm mode="login" admin />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
