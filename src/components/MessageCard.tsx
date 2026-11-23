"use client";

import { Mail, MessageSquare, Phone, Smartphone, Users } from "lucide-react";
import { useLang } from "@/components/i18n/LangProvider";
import { ListenButton } from "@/components/theme/SimpleMode";

const ICONS = { Correo: Mail, SMS: MessageSquare, Chat: Smartphone, Llamada: Phone, Redes: Users } as const;
export type MessageChannel = keyof typeof ICONS;

const LABEL = {
  es: { Correo: "Correo", SMS: "SMS", Chat: "Chat", Llamada: "Llamada", Redes: "Redes sociales" },
  en: { Correo: "Email", SMS: "Text message", Chat: "Chat", Llamada: "Phone call", Redes: "Social media" },
} as const;

/** Un mensaje (correo, SMS, chat, llamada o red social) para revisar. */
export function MessageCard({ channel, from, text }: { channel: MessageChannel; from: string; text: string }) {
  const lang = useLang();
  const Icon = ICONS[channel] ?? MessageSquare;
  const label = LABEL[lang][channel] ?? channel;
  return (
    <div className="preview-card p-5">
      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-ink-3">
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          {label}
        </span>
        <ListenButton text={`${label}. ${lang === "en" ? "From" : "De"}: ${from}. ${text}`} className="text-ink-2" />
      </div>
      <p className="mt-2 break-words font-mono text-[13px] text-ink-2">{from}</p>
      <p className="mt-3 leading-relaxed text-ink">{text}</p>
    </div>
  );
}
