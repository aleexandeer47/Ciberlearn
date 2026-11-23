import type { Scenario } from "./types";

/*
 * English version of data.ts: same ids, verdicts, difficulty and signal ids
 * (content.test / scoring.test check that they match). All brands, people,
 * numbers and domains are fictional:
 *  - Izalco Bank (legit domain: izalcobank.com)
 *  - ShipNow Express (courier, legit domain: shipnow.com)
 *  - Atlacatl Group (the user's employer, domain: atlacatlgroup.com)
 *  - Revenue Agency (government, domain: revenue.gov)
 */

export const SCENARIOS_EN: Scenario[] = [
  {
    id: "banco-bloqueo",
    channel: "email",
    verdict: "phishing",
    difficulty: 1,
    context: "You bank with Izalco Bank. Its official domain is izalcobank.com.",
    from: {
      name: "Izalco Bank",
      address: { t: "security@izalcobank-alerts.com", s: "dominio" },
    },
    subject: [{ t: "URGENT: your account will be locked in 24 hours", s: "urgencia" }],
    time: "7:42",
    body: [
      [{ t: "Dear customer,", s: "saludo" }],
      [
        "We have detected unusual activity in your online banking.",
        { t: "If you do not verify your identity within the next 24 hours, your account will be permanently suspended.", s: "urgencia" },
      ],
      [
        "To avoid this, go to the following link: ",
        { t: "www.izalcobank.com/verify", s: "enlace", href: "http://izalcobank.verify-account.co/login" },
      ],
      [{ t: "Have your username, password and the code we will text you ready.", s: "datos" }],
      ["Sincerely, Security Department."],
    ],
    signals: [
      {
        id: "dominio",
        category: "remitente",
        title: "The domain isn't the bank's",
        explanation:
          "The email comes from izalcobank-alerts.com, not izalcobank.com. Anyone can register a domain that contains a brand's name.",
      },
      {
        id: "urgencia",
        category: "urgencia",
        title: "A threat with a short deadline",
        explanation:
          "“24 hours” and “permanently suspended” are meant to make you act out of fear instead of stopping to check. A real bank doesn't close your account over an unanswered email.",
      },
      {
        id: "saludo",
        category: "contexto",
        title: "Generic greeting",
        explanation:
          "“Dear customer” instead of your name: the message went out to thousands of people at once. Your bank knows your name.",
      },
      {
        id: "enlace",
        category: "enlace",
        title: "The link goes somewhere else",
        explanation:
          "The text shows izalcobank.com, but the real address is izalcobank.verify-account.co. What matters is what comes right before the first slash “/”: there it ends in verify-account.co.",
      },
      {
        id: "datos",
        category: "solicitud",
        title: "Asks for your password and code",
        explanation:
          "No bank asks for your password or text-message code by email. With those two things they can log in to your account and move money.",
      },
    ],
    takeaway:
      "If an email from your bank worries you, don't use its links: open the app or type the bank's address into the browser yourself.",
  },
  {
    id: "paquete-aduana",
    channel: "sms",
    verdict: "phishing",
    difficulty: 1,
    context: "You're not expecting any package. You get this text from an unknown number.",
    from: { name: "ShipNow", address: { t: "+44 7700 900143", s: "numero" } },
    time: "13:05",
    body: [
      [
        { t: "ShipNow: Your parcel is being held at customs for an outstanding balance of $1.95.", s: "inesperado" },
        { t: "Pay today or it will be returned to sender:", s: "urgencia" },
        " ",
        { t: "shipnow.delivery-fee.top/p/8812", s: "enlace", href: "https://shipnow.delivery-fee.top/p/8812" },
      ],
    ],
    signals: [
      {
        id: "inesperado",
        category: "contexto",
        title: "A package you weren't expecting",
        explanation:
          "If you didn't buy anything, there's no package. They ask for a tiny amount so you don't think twice, but what they're after is your card details.",
      },
      {
        id: "numero",
        category: "remitente",
        title: "Foreign number",
        explanation:
          "A local courier wouldn't text you from a number in another country. Scammers use cheap or virtual numbers.",
      },
      {
        id: "urgencia",
        category: "urgencia",
        title: "“Pay today”",
        explanation: "The threat of sending it back is there so you pay fast without checking anything.",
      },
      {
        id: "enlace",
        category: "enlace",
        title: "Odd domain",
        explanation:
          "The real domain is delivery-fee.top. Endings like .top, .xyz or .click are cheap and widely used in scams. The real courier uses shipnow.com.",
      },
    ],
    takeaway:
      "To check whether you have a delivery, go to the courier's official website by typing the address yourself and look up the tracking number from your purchase.",
  },
  {
    id: "mami-numero-nuevo",
    channel: "chat",
    verdict: "phishing",
    difficulty: 2,
    context: "Your son Kevin lives abroad and sometimes asks you for help. Someone messages you from a number you don't have saved.",
    from: { name: { t: "+1 (832) 555-0198", s: "nuevo" }, address: "Unsaved number" },
    time: "21:17",
    body: [
      [{ t: "Hi mom, it's me, Kevin. I dropped my phone and this is my new number.", s: "nuevo" }, " Save it."],
      ["Listen, I have a problem and I'm embarrassed to tell you."],
      [{ t: "I need you to send me $350 today to pay the rent, otherwise they'll kick me out of the apartment.", s: "dinero" }],
      [{ t: "I can't talk right now because the phone's microphone is broken, that's why I'm texting.", s: "nollamar" }],
      [{ t: "I'll give you a friend's account because mine is frozen.", s: "cuenta" }],
    ],
    signals: [
      {
        id: "nuevo",
        category: "suplantacion",
        title: "“This is my new number”",
        explanation:
          "It's the classic opening of this scam: the scammer pretends to be a relative and asks you to delete or ignore the old number.",
      },
      {
        id: "dinero",
        category: "solicitud",
        title: "Urgent request for money",
        explanation:
          "An emergency with a deadline (rent, an accident, a fine) is how they get you to send money before you think about it.",
      },
      {
        id: "nollamar",
        category: "contexto",
        title: "Avoids a call",
        explanation: "There's always an excuse not to talk on the phone, because on a call you'd realize it isn't your son.",
      },
      {
        id: "cuenta",
        category: "solicitud",
        title: "Someone else's account",
        explanation:
          "If the money goes to “a friend's” account, there's no way to get it back. It's the clearest sign of fraud.",
      },
    ],
    takeaway:
      "Before sending money, call the number you've always used or ask a question only your relative could answer. You can agree on a family code word for emergencies.",
  },
  {
    id: "banco-estado-cuenta",
    channel: "email",
    verdict: "legit",
    difficulty: 2,
    context: "You bank with Izalco Bank and get your statement by email every month.",
    from: { name: "Izalco Bank", address: "notifications@izalcobank.com" },
    subject: ["Your October statement is available"],
    time: "6:00",
    body: [
      ["Hi Maria,"],
      ["Your October statement for the account ending in 4821 is now available."],
      ["You can view it in the Izalco Bank app or in online banking by typing izalcobank.com into your browser."],
      ["Remember: we will never ask for your password, PIN or verification codes by email, text or phone call."],
      ["Izalco Bank. This is an automated message, please do not reply."],
    ],
    signals: [],
    legitReasons: [
      "It comes from the official domain izalcobank.com.",
      "It uses your name and shows only the last 4 digits of the account.",
      "It has no links or attachments: it asks you to go to the app or website on your own.",
      "There's no urgency or threats, and it doesn't ask for any information.",
    ],
    takeaway:
      "A legitimate message doesn't rush you, doesn't ask for your data and lets you go in the usual way. Distrusting everything doesn't help either: the key is knowing what to check.",
  },
  {
    id: "jefe-tarjetas",
    channel: "email",
    verdict: "phishing",
    difficulty: 2,
    context: "You work at Atlacatl Group (domain atlacatlgroup.com). Your general manager is Richard Menjivar.",
    from: { name: "Richard Menjivar", address: { t: "richard.menjivar.manager@gmail.com", s: "gmail" } },
    subject: ["Quick favor"],
    time: "10:31",
    body: [
      ["Hi, are you at the office?"],
      [
        "I'm in a meeting with a client and can't take calls.",
        { t: "I need you to buy 5 gift cards of $100 each as a gift for our clients.", s: "tarjetas" },
      ],
      [{ t: "Send me the codes here as soon as you have them, I need them before 12.", s: "urgencia" }],
      [{ t: "Please keep this between us, it's a surprise.", s: "secreto" }],
      ["Sent from my phone"],
    ],
    signals: [
      {
        id: "gmail",
        category: "remitente",
        title: "Personal email, not the company's",
        explanation:
          "The name is your manager's, but the address is Gmail. The display name can be typed in by anyone; what matters is the address.",
      },
      {
        id: "tarjetas",
        category: "solicitud",
        title: "Gift cards",
        explanation:
          "Scammers ask for gift cards because the codes turn into cash instantly and can't be traced or refunded.",
      },
      {
        id: "urgencia",
        category: "urgencia",
        title: "Deadline and rush",
        explanation: "“Before 12” and “as soon as you have them” are meant to stop you from checking with anyone.",
      },
      {
        id: "secreto",
        category: "suplantacion",
        title: "Asks you to keep it secret",
        explanation:
          "Asking for discretion is so you don't confirm it with someone else. A real company purchase goes through the usual process.",
      },
    ],
    takeaway:
      "If a boss asks you for money, purchases or unusual payments, confirm it another way (a call, Teams or in person), never by replying to the same email.",
  },
  {
    id: "devolucion-renta",
    channel: "email",
    verdict: "phishing",
    difficulty: 2,
    context: "You filed your taxes this year. The official domain of the Revenue Agency is revenue.gov.",
    from: { name: "Revenue Agency", address: { t: "refunds@revenue-refunds.com", s: "dominio" } },
    subject: [{ t: "You have a pending refund of $487.30", s: "premio" }],
    time: "16:48",
    body: [
      ["Dear taxpayer,"],
      [
        { t: "After reviewing your return, you are entitled to a refund of $487.30.", s: "premio" },
        "To receive it in your account, fill in the attached form.",
      ],
      [{ t: "Enter your ID number, bank account number and your debit card PIN.", s: "datos" }],
      ["If you do not send it before Friday, the amount will be cancelled."],
    ],
    attachments: [{ name: "Refund_Form_2026.zip", s: "adjunto" }],
    signals: [
      {
        id: "dominio",
        category: "remitente",
        title: "The government doesn't use .com",
        explanation:
          "Government agencies use official domains (.gov or your country's equivalent). Anyone can register a .com domain with the word “refunds” in it.",
      },
      {
        id: "premio",
        category: "oferta",
        title: "Unexpected money",
        explanation:
          "An exact, appealing amount grabs your interest and lowers your guard. If you really have a refund, you check it on the official portal.",
      },
      {
        id: "datos",
        category: "solicitud",
        title: "Asks for your PIN",
        explanation:
          "Nobody needs your PIN to send you money. With your ID, account and PIN they can impersonate you and drain your card.",
      },
      {
        id: "adjunto",
        category: "adjunto",
        title: ".zip file",
        explanation:
          "An unexpected .zip can hide malware. Official forms are filled in on the web portal, not sent compressed by email.",
      },
    ],
    takeaway:
      "For anything involving the government, go to the official portal yourself. Never open compressed attachments you didn't ask for.",
  },
  {
    id: "codigo-solicitado",
    channel: "sms",
    verdict: "legit",
    difficulty: 3,
    context: "A minute ago you tried to log in to the Izalco Bank app from a new phone.",
    from: { name: "IzalcoBank", address: "Short code 2250" },
    time: "9:14",
    body: [
      [
        "Izalco Bank: your verification code is 482913. It expires in 5 minutes.",
        "Don't share it with anyone. Izalco Bank will never ask for it by phone or message.",
      ],
    ],
    signals: [],
    legitReasons: [
      "It arrives right after you asked to log in: the context makes sense.",
      "It has no links and doesn't ask you to reply.",
      "It warns you not to share the code, which is the opposite of what a scammer would do.",
    ],
    takeaway:
      "A verification code is legitimate when you asked for it. If one arrives without you asking, someone is trying to get into your account: don't share it with anyone and change your password.",
  },
  {
    id: "trabajo-likes",
    channel: "chat",
    verdict: "phishing",
    difficulty: 1,
    context: "You haven't applied for any job. An unknown number messages you.",
    from: { name: { t: "Human Resources ✅", s: "desconocido" }, address: "+44 7700 900412" },
    time: "11:02",
    body: [
      [{ t: "Hi! We're contacting you from a digital marketing agency, your profile has been selected.", s: "desconocido" }],
      [{ t: "You can earn $50 to $200 a day just by liking videos on your phone.", s: "oferta" }],
      ["No experience needed, just 20 minutes a day."],
      [{ t: "To activate your VIP task account you must make an initial deposit of $30, which is refunded with your first payment.", s: "deposito" }],
      ["Interested? Reply YES to get started."],
    ],
    signals: [
      {
        id: "desconocido",
        category: "contexto",
        title: "Nobody found you through your profile",
        explanation:
          "If you didn't apply for anything, nobody “selected” you. The ✅ emoji in the name is there to look like a verified account, and anyone can add it.",
      },
      {
        id: "oferta",
        category: "oferta",
        title: "Easy money",
        explanation:
          "Lots of money for almost no work. At first they sometimes pay a few cents so you trust them and then deposit more.",
      },
      {
        id: "deposito",
        category: "solicitud",
        title: "Paying to work",
        explanation:
          "A real job never asks you for money to start. This is where you lose your money, and the “VIP levels” only ask for bigger and bigger deposits.",
      },
    ],
    takeaway: "If you have to pay first to earn money, it's a scam. Block and report the number.",
  },
  {
    id: "ti-contrasena",
    channel: "email",
    verdict: "phishing",
    difficulty: 3,
    context: "You work at Atlacatl Group (domain atlacatlgroup.com). IT support uses that same domain.",
    from: { name: "IT Support - Atlacatl Group", address: { t: "support@atlacatlgroup-com.net", s: "dominio" } },
    subject: ["Notice: your email password expires today"],
    time: "8:20",
    body: [
      ["Hello,"],
      [
        "Due to security policies, your corporate email password expires today.",
        { t: "If you don't renew it before 5:00 p.m., you will lose access to your mailbox and files.", s: "urgencia" },
      ],
      [
        "You can keep your current password by clicking here: ",
        { t: "Keep my password", s: "enlace", href: "https://atlacatlgroup-com.net/owa/auth/renew" },
      ],
      ["Thanks, IT Support."],
    ],
    signals: [
      {
        id: "dominio",
        category: "remitente",
        title: "Almost the same domain",
        explanation:
          "atlacatlgroup-com.net imitates atlacatlgroup.com by swapping a dot for a hyphen. It's hard to spot unless you read the full address.",
      },
      {
        id: "urgencia",
        category: "urgencia",
        title: "Losing access by a deadline",
        explanation: "Threatening that you'll lose your files before 5:00 p.m. is meant to make you click without asking IT.",
      },
      {
        id: "enlace",
        category: "enlace",
        title: "Button to a fake site",
        explanation:
          "The button doesn't show the address. Hovering over it reveals it goes to atlacatlgroup-com.net, a page that copies the login screen to steal your password.",
      },
    ],
    takeaway:
      "For any IT notice asking you to log in, open your email the usual way or call support. Before clicking, hover over the link to see where it goes.",
  },
  {
    id: "rrhh-vacaciones",
    channel: "email",
    verdict: "legit",
    difficulty: 3,
    context:
      "You work at Atlacatl Group (domain atlacatlgroup.com). At Monday's meeting, HR said they would send the holiday schedule.",
    from: { name: "Andrea Lopez - Human Resources", address: "andrea.lopez@atlacatlgroup.com" },
    subject: ["Year-end holiday schedule"],
    time: "14:10",
    body: [
      ["Good afternoon, team:"],
      ["As we mentioned at Monday's meeting, the December holiday schedule is now published."],
      [
        "You can check it on the intranet: ",
        { t: "intranet.atlacatlgroup.com/hr/holidays", href: "https://intranet.atlacatlgroup.com/hr/holidays" },
      ],
      ["If you have questions, feel free to email me or stop by my office on the second floor."],
      ["Best, Andrea Lopez. Human Resources."],
    ],
    signals: [],
    legitReasons: [
      "It comes from the company's correct domain, atlacatlgroup.com.",
      "It was announced in a meeting: you were expecting it.",
      "The link goes to a company subdomain (intranet.atlacatlgroup.com), and the text matches the real address.",
      "There's no urgency, it doesn't ask for data and it offers to talk in person.",
    ],
    takeaway:
      "A link is trustworthy when the real domain (what comes before the first “/”) belongs to the organization, for example intranet.atlacatlgroup.com. If in doubt, you can still open the intranet on your own.",
  },
];
