import type { Scenario } from "./types";

/*
 * English version of pro.ts: same ids, verdicts and signal ids.
 * Fictional brands: Marketly (marketplace), Tunco Wallet (payments),
 * Ceiba Supermarkets and Lempa Distributors (supplier).
 */

export const PRO_SCENARIOS_EN: Scenario[] = [
  {
    id: "mercadito-comprador",
    channel: "chat",
    verdict: "phishing",
    difficulty: 3,
    context: "You listed your bike on Marketly for $180. A supposed buyer messages you.",
    from: { name: "Carlos M.", address: "Buyer on Marketly" },
    time: "19:40",
    body: [
      ["Hi! I'm interested in the bike, I'll pay your asking price."],
      [{ t: "I've already paid through Marketly Pay, to receive it you just need to confirm your details here:", s: "yapague" }],
      [{ t: "marketly-payments.com/receive/48291", s: "enlace", href: "https://marketly-payments.com/receive/48291" }],
      [{ t: "It will ask for your card details so they can deposit the money, that's normal.", s: "tarjeta" }],
      [{ t: "Hurry, the link expires in 30 minutes and the purchase gets cancelled.", s: "urgencia" }],
    ],
    signals: [
      {
        id: "yapague",
        category: "contexto",
        title: "“I already paid” without seeing anything",
        explanation:
          "A real buyer asks questions, negotiates or wants to see the bike. Claiming to have paid before even seeing the item is the hook of this scam.",
      },
      {
        id: "enlace",
        category: "enlace",
        title: "Site imitating the platform",
        explanation:
          "marketly-payments.com isn't Marketly: it's a separate domain. If a payment were real, you'd see it inside the app, not in a link sent to you over chat.",
      },
      {
        id: "tarjeta",
        category: "solicitud",
        title: "Card details to receive money",
        explanation:
          "You never need to give your card number, expiry date and CVV to receive money. With that, they can charge you instead.",
      },
      {
        id: "urgencia",
        category: "urgencia",
        title: "30-minute deadline",
        explanation: "The rush keeps you from checking the app and noticing there's no payment at all.",
      },
    ],
    takeaway:
      "When selling online, confirm payments inside the app or your bank. If someone asks for your card details to pay you, it's a scam.",
  },
  {
    id: "dte-proveedor",
    channel: "email",
    verdict: "phishing",
    difficulty: 3,
    context: "You work in accounting at Atlacatl Group. Lempa Distributors is a real supplier and emails from @lempadist.com.",
    from: { name: "Billing - Lempa Distributors", address: { t: "billing@lempadist-invoices.com", s: "dominio" } },
    subject: ["Payment due: E-invoice 0031-2291"],
    time: "11:18",
    body: [
      ["Hello, please find attached the e-invoice for the October purchase."],
      [{ t: "Please note we have changed banks: from today, payments must be made to the new account shown in the document.", s: "cuenta" }],
      ["To view the invoice, open the attached file on your computer."],
      ["Kind regards, Billing Department."],
    ],
    attachments: [{ name: "Invoice_0031-2291.html", s: "adjunto" }],
    signals: [
      {
        id: "dominio",
        category: "remitente",
        title: "Look-alike domain, not the real one",
        explanation:
          "The supplier uses lempadist.com; this email comes from lempadist-invoices.com. Since e-invoicing became common, fake “invoice” emails have exploded.",
      },
      {
        id: "cuenta",
        category: "solicitud",
        title: "Change of bank account",
        explanation:
          "An email saying a supplier “changed banks” is the core of business email fraud: if you pay the new account, the money goes to the scammer.",
      },
      {
        id: "adjunto",
        category: "adjunto",
        title: "Invoice as .html",
        explanation:
          "A real e-invoice arrives as a PDF (sometimes with XML or JSON). An .html file opens in the browser and usually shows a fake login to steal your email password.",
      },
    ],
    takeaway:
      "Any change to a supplier's bank account is confirmed by calling the number you already have on file, never the one in the email.",
  },
  {
    id: "billetera-codigo",
    channel: "chat",
    verdict: "phishing",
    difficulty: 2,
    context: "You use the Tunco Wallet app. A contact claiming to be support messages you.",
    from: { name: { t: "Tunco Wallet Support 🛡️", s: "soporte" }, address: "Unsaved number" },
    time: "08:05",
    body: [
      ["Hello, this is the Tunco Wallet security team."],
      ["We detected an attempt to access your account from another country."],
      [{ t: "To block it, we just sent you a 6-digit code by text. Please read it out to us here.", s: "codigo" }],
      [{ t: "If you don't do it within 5 minutes, you will lose your balance.", s: "urgencia" }],
    ],
    signals: [
      {
        id: "soporte",
        category: "suplantacion",
        title: "Support that contacts you first",
        explanation:
          "Companies don't message you from a personal number or put little shields in their name. Support channels live inside the app.",
      },
      {
        id: "codigo",
        category: "solicitud",
        title: "Asks for the text code",
        explanation:
          "The code you receive is the key to your account: the scammer triggers it by trying to log in and asks you for it to finish getting in.",
      },
      {
        id: "urgencia",
        category: "urgencia",
        title: "Threat of losing your balance",
        explanation: "Fear of losing money makes you read out the code without thinking.",
      },
    ],
    takeaway: "A verification code is never shared with anyone, not even “support”. If someone asks for it, it's to get into your account.",
  },
  {
    id: "envio-real",
    channel: "sms",
    verdict: "legit",
    difficulty: 3,
    context:
      "Yesterday you bought headphones online and got tracking number SN-559201. ShipNow uses the domain shipnow.com.",
    from: { name: "ShipNow", address: "Short code 7350" },
    time: "10:12",
    body: [
      [
        "ShipNow: your parcel SN-559201 is out for delivery today. It will arrive between 2:00 and 5:00 p.m.",
        "Details at shipnow.com/tracking. No payment is required.",
      ],
    ],
    signals: [],
    legitReasons: [
      "It matches a purchase you actually made and your tracking number.",
      "It comes from a short code, not a foreign number.",
      "The domain is the official one (shipnow.com) and there's no link asking for data.",
      "It makes clear there's nothing to pay.",
    ],
    takeaway:
      "The same kind of message can be real or fake: what decides it is the context (were you expecting the parcel?) and the details (domain, payments, data).",
  },
  {
    id: "reset-no-pedido",
    channel: "email",
    verdict: "legit",
    difficulty: 3,
    context: "You bank with Izalco Bank (izalcobank.com). You haven't asked to change your password.",
    from: { name: "Izalco Bank", address: "notifications@izalcobank.com" },
    subject: ["A password change was requested"],
    time: "23:51",
    body: [
      ["Hi Maria,"],
      ["We received a request to change your online banking password."],
      ["If it wasn't you, do nothing: your current password still works and the request expires in 30 minutes."],
      ["If you're worried, open the Izalco Bank app and check your connected devices."],
    ],
    signals: [],
    legitReasons: [
      "It comes from the official domain and uses your name.",
      "It has no links and doesn't ask for anything: it tells you to do nothing.",
      "It sends you to the app, the usual way.",
    ],
    takeaway:
      "A notice you didn't ask for isn't always phishing: someone may be trying your email. If the message doesn't ask you for anything, there's no risk. Change your password from the app if you want peace of mind.",
  },
  {
    id: "super-aniversario",
    channel: "email",
    verdict: "phishing",
    difficulty: 2,
    context: "You sometimes shop at Ceiba Supermarkets, whose domain is ceibamarket.com.",
    from: { name: "Ceiba Supermarkets", address: { t: "prizes@ceibamarket-anniversary.shop", s: "dominio" } },
    subject: [{ t: "🎉 You won a $500 gift card for our anniversary!", s: "premio" }],
    time: "12:30",
    body: [
      ["Congratulations, you were selected among our frequent shoppers."],
      [
        "Answer a 3-question survey and claim your prize:",
        { t: "Claim my gift card", s: "enlace", href: "https://ceibamarket-anniversary.shop/survey" },
      ],
      [{ t: "You only pay $1.50 shipping with your card.", s: "envio" }],
      [{ t: "Only 12 prizes left.", s: "escasez" }],
    ],
    signals: [
      {
        id: "dominio",
        category: "remitente",
        title: "Unknown .shop domain",
        explanation: "The store uses ceibamarket.com. A domain with “anniversary” and a .shop ending was registered by someone else.",
      },
      {
        id: "premio",
        category: "oferta",
        title: "A prize you didn't look for",
        explanation: "Winning a draw you never entered is the oldest bait there is.",
      },
      {
        id: "enlace",
        category: "enlace",
        title: "Button to the fake domain",
        explanation: "Hovering over it shows it goes to ceibamarket-anniversary.shop, not the store's website.",
      },
      {
        id: "envio",
        category: "solicitud",
        title: "“You only pay shipping”",
        explanation:
          "The small charge is to get your full card details. It often ends in recurring charges you never authorized.",
      },
      {
        id: "escasez",
        category: "urgencia",
        title: "Made-up scarcity",
        explanation: "“Only 12 left” is meant to make you act before thinking.",
      },
    ],
    takeaway: "If a prize asks you to pay for something, it's not a prize. Check promotions on the store's official social media.",
  },
];
