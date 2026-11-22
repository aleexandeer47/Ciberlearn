import { Mail, MessageSquare, Phone, Smartphone, Users } from "lucide-react";

const ICONS = { Correo: Mail, SMS: MessageSquare, Chat: Smartphone, Llamada: Phone, Redes: Users } as const;
export type MessageChannel = keyof typeof ICONS;

/** Un mensaje (correo, SMS, chat, llamada o red social) para revisar. */
export function MessageCard({ channel, from, text }: { channel: MessageChannel; from: string; text: string }) {
  const Icon = ICONS[channel] ?? MessageSquare;
  return (
    <div className="preview-card p-5">
      <div className="flex items-center gap-2 text-xs font-semibold text-ink-3">
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        {channel === "Redes" ? "Redes sociales" : channel}
      </div>
      <p className="mt-2 break-words font-mono text-[13px] text-ink-2">{from}</p>
      <p className="mt-3 leading-relaxed text-ink">{text}</p>
    </div>
  );
}
