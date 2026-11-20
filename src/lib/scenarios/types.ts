export type Channel = "email" | "sms" | "chat";
export type Verdict = "phishing" | "legit";

export type SignalCategory =
  | "remitente"
  | "urgencia"
  | "enlace"
  | "solicitud"
  | "suplantacion"
  | "adjunto"
  | "oferta"
  | "contexto";

/**
 * Texto de un mensaje. Un string se divide en oraciones y cada una se puede
 * marcar (si se marca, cuenta como falso positivo). Un objeto con `s` es una
 * señal real; con `href` se muestra como enlace.
 */
export type Inline = string | { t: string; s?: string; href?: string };

export interface Signal {
  id: string;
  category: SignalCategory;
  title: string;
  explanation: string;
}

export interface Scenario {
  id: string;
  channel: Channel;
  verdict: Verdict;
  difficulty: 1 | 2 | 3;
  /** Situación del usuario, para que pueda juzgar si el mensaje tiene sentido. */
  context: string;
  from: { name: Inline; address: Inline };
  subject?: Inline[];
  time: string;
  /** Párrafos (correo) o burbujas (SMS / chat). */
  body: Inline[][];
  attachments?: { name: string; s?: string }[];
  signals: Signal[];
  /** Solo para mensajes legítimos: por qué se puede confiar. */
  legitReasons?: string[];
  takeaway: string;
}

export interface Segment {
  key: string;
  text: string;
  signal?: string;
  href?: string;
}

export interface SegmentedScenario {
  from: { name: Segment[]; address: Segment[] };
  subject: Segment[];
  body: Segment[][];
  attachments: Segment[];
  all: Segment[];
}
