"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useId, useState } from "react";
import { login, signup, type AuthState } from "@/app/actions/auth";
import { useT } from "@/components/i18n/LangProvider";
import { ConsentChecks } from "@/components/legal/ConsentChecks";

/** `admin`: login del panel. Siempre vuelve a /admin y no ofrece crear cuenta. */
export function AuthForm({ mode, admin = false }: { mode: "login" | "signup"; admin?: boolean }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, {});
  const fromUrl = useSearchParams().get("next") ?? "";
  const next = admin ? "/admin" : fromUrl;
  const [show, setShow] = useState(false);
  const t = useT();
  const id = useId();
  const isSignup = mode === "signup";
  const nextQs = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={action} className="space-y-4" noValidate={false}>
      <input type="hidden" name="next" value={next} />
      {isSignup && (
        <Field id={`${id}-name`} label={t("Tu nombre", "Your name")}>
          <input
            id={`${id}-name`}
            name="name"
            required
            minLength={2}
            maxLength={60}
            autoComplete="name"
            defaultValue={state.fields?.name}
            className="field"
          />
        </Field>
      )}
      <Field id={`${id}-email`} label={t("Correo", "Email")}>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.fields?.email}
          className="field"
        />
      </Field>
      <Field
        id={`${id}-pw`}
        label={t("Contraseña", "Password")}
        hint={isSignup ? t("Mínimo 8 caracteres.", "At least 8 characters.") : undefined}
        extra={
          !isSignup && (
            <Link href="/recuperar" className="text-xs text-fog underline-offset-2 hover:text-chalk hover:underline">
              {t("¿Olvidaste tu contraseña?", "Forgot your password?")}
            </Link>
          )
        }
      >
        <div className="relative">
          <input
            id={`${id}-pw`}
            name="password"
            type={show ? "text" : "password"}
            required
            minLength={isSignup ? 8 : 1}
            autoComplete={isSignup ? "new-password" : "current-password"}
            className="field pr-20"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-2 my-auto h-8 rounded-md px-2 text-xs text-fog hover:text-chalk"
          >
            {show ? t("Ocultar", "Hide") : t("Mostrar", "Show")}
          </button>
        </div>
      </Field>

      {isSignup && (
        // key: al volver con error, React no reinicia defaultChecked; la key lo fuerza
        <ConsentChecks key={state.error} defaults={state.fields} />
      )}

      {state.error && (
        <p role="alert" className="pop-in rounded-xl bg-bad/15 px-4 py-3 text-sm text-bad-text">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full px-6 py-3.5 disabled:opacity-60">
        {pending ? t("Un momento…", "One moment…") : isSignup ? t("Crear mi cuenta gratis", "Create my free account") : t("Entrar", "Log in")}
      </button>

      <p className={`text-center text-sm text-fog ${admin ? "hidden" : ""}`}>
        {isSignup ? (
          <>
            {t("¿Ya tienes cuenta?", "Already have an account?")}{" "}
            <Link href={`/entrar${nextQs}`} className="text-chalk underline underline-offset-2">
              {t("Entra aquí", "Log in here")}
            </Link>
          </>
        ) : (
          <>
            {t("¿Primera vez?", "First time?")}{" "}
            <Link href={`/registro${nextQs}`} className="text-chalk underline underline-offset-2">
              {t("Crea tu cuenta gratis", "Create your free account")}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  extra,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="block text-sm font-medium text-chalk">
          {label}
        </label>
        {extra}
      </div>
      {children}
      {hint && <p className="mt-1 text-xs text-fog">{hint}</p>}
    </div>
  );
}
