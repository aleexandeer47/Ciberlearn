// English text for the training inbox (same ids as inbox.ts; verdicts don't change).

type Text = {
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string[];
  explain: string;
  linkText?: string;
  linkUrl?: string;
  attachment?: string;
};

export const INBOX_EN: Record<string, Text> = {
  b01: {
    fromName: "IT Support", fromEmail: "support@atlacatlgroup-it.com", subject: "Your password expires today",
    body: ["Dear colleague,", "Your email password expires today at 5:00 p.m. To keep your access, update it now."],
    linkText: "Keep my password", linkUrl: "https://atlacatlgroup-it.com/renew",
    explain: "The domain atlacatlgroup-it.com isn't the company's (atlacatlgroup.com), and the urgency is there so you don't check it.",
  },
  b02: {
    fromName: "Andrea Lopez", fromEmail: "andrea.lopez@atlacatlgroup.com", subject: "Agenda for Thursday's meeting",
    body: ["Hi team,", "Here are Thursday's topics: month-end close, holidays and the new stationery supplier. See you at 10."],
    explain: "A coworker you know, the right domain, an expected topic and no requests for data or links.",
  },
  b03: {
    fromName: "Izalco Bank", fromEmail: "alerts@izalcobank-security.net", subject: "Unusual activity detected",
    body: ["We detected an attempted purchase of $725.00.", "If it wasn't you, verify your identity to block the card."],
    linkText: "Verify my identity", linkUrl: "https://izalcobank-security.net/verify",
    explain: "The bank uses izalcobank.com. This domain imitates the bank to steal your username and password.",
  },
  b04: {
    fromName: "Human Resources", fromEmail: "hr@atlacatlgroup.com", subject: "November payslip",
    body: ["Your November payslip is now available on the intranet, in the Payroll section.", "We don't send it by email for security reasons."],
    explain: "It comes from the company domain and sends you to the intranet you already use, with no links or attachments.",
  },
  b05: {
    fromName: "Lempa Distributors", fromEmail: "billing@lempadist.com", subject: "URGENT: new account for payments",
    body: ["Due to an audit we've changed banks. From today, please pay into account 0099-1123-44.", "Please don't call, we're closing the books."],
    explain: "Even if the domain is the supplier's, their mailbox may have been hacked. Account change + urgency + “don't call” = confirm by phone.",
  },
  b06: {
    fromName: "Shared documents", fromEmail: "no-reply@shared-docs.app", subject: "Richard shared “Raises 2027.xlsx” with you",
    body: ["Richard Mendez shared a file with you.", "Sign in with your work email to view it."],
    linkText: "Open file", linkUrl: "https://shared-docs.app/login?f=raises",
    explain: "It plays on curiosity (raises) and asks for your work password on an unknown external site.",
  },
  b07: {
    fromName: "ShipNow", fromEmail: "notifications@shipnow.com", subject: "Your order SN-552910 is on its way",
    body: ["Your order will arrive tomorrow between 9 and 12.", "You can track it in your account."],
    linkText: "Track order", linkUrl: "https://shipnow.com/tracking/SN-552910",
    explain: "Official domain, a link to the same domain and no charges: a normal shipping notice.",
  },
  b08: {
    fromName: "General Management", fromEmail: "atlacatl.management@gmail.com", subject: "I need a discreet favor",
    body: ["Are you at the office? I need you to buy 5 gift cards of $100 each for some clients.", "Send me the codes in a photo. Don't mention it, it's a surprise."],
    explain: "A personal email pretending to be management, secrecy and gift cards: boss fraud.",
  },
  b09: {
    fromName: "Help desk", fromEmail: "helpdesk@atlacatlgroup.com", subject: "Ticket #4471 resolved",
    body: ["Hi, the ticket you opened about the second-floor printer has been resolved.", "If the problem continues, reply to this email."],
    explain: "It responds to something you asked for, from the internal domain and without asking for passwords.",
  },
  b10: {
    fromName: "E-invoicing", fromEmail: "invoices@invoices-online.top", subject: "Invoice pending acceptance",
    body: ["You have a pending e-invoice.", "Download the attached file to review it."],
    attachment: "Pending_invoice.html",
    explain: "E-invoices arrive as PDF (sometimes XML or JSON) from a supplier you know. An attached .html file can show a fake login page.",
  },
  b11: {
    fromName: "Revenue Agency", fromEmail: "notifications@revenue.gov", subject: "Reminder: monthly return",
    body: ["This is a reminder that the deadline for your sales tax return is the 10th.", "Go to the portal as usual."],
    explain: "Official government domain, no link to pay and no request for data: just a reminder.",
  },
  b12: {
    fromName: "Account security", fromEmail: "security@micr0soft-login.com", subject: "Sign-in blocked",
    body: ["We blocked a sign-in from Russia.", "If it wasn't you, confirm your account within the next 2 hours."],
    linkText: "Confirm my account", linkUrl: "https://micr0soft-login.com/confirm",
    explain: "The domain uses a zero instead of an “o” and scares you with a short deadline.",
  },
  b13: {
    fromName: "Carlos Rivas", fromEmail: "carlos.rivas@atlacatlgroup.com", subject: "Photos from the party 📸",
    body: ["What a great party! I uploaded the photos to the team's shared folder on the intranet."],
    explain: "A coworker you know, the right domain, and it sends you somewhere internal, with no external links.",
  },
  b14: {
    fromName: "Ceiba Supermarket Prizes", fromEmail: "prizes@ceiba-gifts.shop", subject: "You won a $250 gift card!",
    body: ["Congratulations, you were selected among our customers.", "Just pay $2.99 shipping to receive your card."],
    linkText: "Claim my prize", linkUrl: "https://ceiba-gifts.shop/claim",
    explain: "A prize you didn't look for and a small charge to steal your card details.",
  },
};
