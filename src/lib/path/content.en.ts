// English text for the guided path (same ids and answer positions as content.ts).
// Fictional brands: Izalco Bank (izalcobank.com), ShipNow (shipnow.com), Atlacatl Group (atlacatlgroup.com),
// Tunco Wallet (tuncowallet.com), Ceiba Supermarket, Marketly (marketly.com), Lempa Distributors (lempadist.com),
// EasyRemit, Revenue Agency (revenue.gov).

type V = { from: string; text: string; explain: string };
type O = { prompt: string; options: string[]; explain: string; context?: string };

export const UNITS_EN: Record<string, { title: string; description: string }> = {
  u1: { title: "Who's writing to you?", description: "Senders, numbers and domains: the first thing to check." },
  u2: { title: "Pressure and emotions", description: "Urgency, fear, prizes and family: how they rush you so you don't think." },
  u3: { title: "Links and files", description: "Read a link before you tap it and distrust files you didn't ask for." },
  u4: { title: "Today's scams", description: "Money transfers, wallets, online sales and calls: the cases going around most." },
  u5: { title: "Social media and messaging", description: "Stolen accounts, fake profiles, giveaways and investments that don't exist." },
  u6: { title: "Your accounts and passwords", description: "Strong passwords, two-step verification, your SIM and fake apps." },
  u7: { title: "Scams at work", description: "Boss fraud, invoices with swapped accounts and fake tech support." },
  u8: { title: "Final test: expert level", description: "Almost perfect traps, real messages that look fake and a full case. Here even experts slip up." },
};

export const LESSONS_EN: Record<string, string> = {
  u1l1: "The sender",
  u1l2: "Look-alike domains",
  u1l3: "Review: senders",
  u2l1: "Urgency",
  u2l2: "Family and friends",
  u2l3: "Prizes and offers",
  u3l1: "Reading a link",
  u3l2: "Files and QR codes",
  u3l3: "Review: links",
  u4l1: "Transfers and wallets",
  u4l2: "Buying and selling online",
  u4l3: "Calls and government",
  u5l1: "Stolen accounts",
  u5l2: "Fake profiles",
  u5l3: "Giveaways, investments and romance",
  u6l1: "Passwords",
  u6l2: "Two-step verification",
  u6l3: "Your phone and your apps",
  u7l1: "The boss and transfers",
  u7l2: "Invoices and suppliers",
  u7l3: "Fake tech support",
  u8l1: "Impossible links",
  u8l2: "Almost perfect messages",
  u8l3: "The full case",
};

export const EXERCISES_EN: Record<string, V | O> = {
  // u1l1
  u1l1e1: { from: "Izalco Bank <notices@izalcobank.com>", text: "Your November statement is now available in the app.", explain: "Official domain, no links and no requests for data. This is what a normal notice looks like." },
  u1l1e2: { from: "Izalco Bank <support@izalcobank-security.net>", text: "We detected unusual access. Confirm your password here.", explain: "The domain is izalcobank-security.net, not izalcobank.com, and it asks for your password." },
  u1l1e3: { prompt: "Which part of an email is hardest to fake?", options: ["The display name", "The domain after the @", "The bank's logo", "The signature at the end"], explain: "Names and logos are easy to copy. Only whoever registered the domain controls it." },
  u1l1e4: { from: "+1 (305) 555-0172", text: "Izalco Bank: your card has been blocked. Call 2200-0000.", explain: "A local bank doesn't text you from a number in another country or give you a different number to call." },
  // u1l2
  u1l2e1: { prompt: "Which is Izalco Bank's real site?", options: ["izalcobank.com", "izalcobank-com.net", "izalco-bank.co", "izalcobank.com.verify.top"], explain: "The real domain ends in izalcobank.com. In the last one, the real domain is verify.top." },
  u1l2e2: { prompt: "Which one does NOT belong to Atlacatl Group (atlacatlgroup.com)?", options: ["intranet.atlacatlgroup.com", "mail.atlacatlgroup.com", "atlacatlgroup.com/hr", "atlacatlgroup-com.login.net"], explain: "What comes right before the first slash is what counts: login.net isn't the company's." },
  u1l2e3: { prompt: "What letter swap are they using to fool you in “izaIcobank.com”?", options: ["A capital I instead of a lowercase l", "An extra dot", "A hyphen", "There's no swap"], explain: "In some fonts a capital I and a lowercase l look identical. Read it slowly." },
  u1l2e4: { prompt: "The Revenue Agency uses revenue.gov. Which one is real?", options: ["revenue-gov.com", "revenue.gov/tax-return", "revenuegov.com", "gov.revenue.info"], explain: "Government agencies use their official domain (.gov or your country's equivalent). The rest are imitations." },
  // u1l3
  u1l3e1: { from: "Andrea Lopez <andrea.lopez@atlacatlgroup.com>", text: "As we discussed yesterday, here's the December schedule on the intranet.", explain: "Correct domain and it refers to something that really happened. It doesn't ask for anything." },
  u1l3e2: { from: "Management <atlacatl.management@gmail.com>", text: "I need you to make an urgent transfer to a new supplier. It's confidential.", explain: "A personal email pretending to be the company, urgency and secrecy: CEO fraud." },
  u1l3e3: { prompt: "Your boss emails you from Gmail asking for gift cards. What do you do?", options: ["Buy them quickly", "Reply to the same email to confirm", "Confirm by phone or in person", "Forward the email to my coworkers"], explain: "Always confirm through another channel you already know, never by replying to the same message." },
  u1l3e4: { from: "IzalcoBank (short code 2250)", text: "Your sign-in code is 551204. Don't share it.", explain: "If you just signed in, this code is expected. The key thing: don't share it." },
  // u2l1
  u2l1e1: { prompt: "Why do scammers set deadlines like “within 24 hours”?", options: ["Because the bank has office hours", "So you act without checking", "Because it's the law", "To be polite"], explain: "Rushing you stops you from pausing to verify. A threatening deadline is a classic sign." },
  u2l1e2: { from: "Unknown number 7100-0000", text: "FINAL NOTICE: your Tunco Wallet account will be deleted TODAY. Verify now: tunco-verify.click", explain: "Capital letters, a threat and a .click domain that isn't the wallet's." },
  u2l1e3: { from: "ShipNow <notifications@shipnow.com>", text: "Your order SN-118230 arrives tomorrow between 9 and 12. You don't need to do anything.", explain: "Official domain, a specific detail about your purchase and no request for payments or data." },
  u2l1e4: { prompt: "Which phrase is NOT a sign of urgency?", options: ["Reply within 2 hours", "Your account will be closed today", "You can review it whenever you like", "Last chance"], explain: "A legitimate message lets you check calmly." },
  // u2l2
  u2l2e1: { from: "+1 (713) 555-0110 (not saved)", text: "Mom, it's me, my phone broke. Can you deposit $200 into this account? It's urgent.", explain: "A new number, urgency and money to another account: the family-member scam." },
  u2l2e2: { prompt: "Someone claims to be your cousin from another number and asks for money. Best first step?", options: ["Send them half", "Call them on their usual number", "Ask for a photo", "Ask for their full name"], explain: "Call the number you already have saved. Photos and names can be found on social media." },
  u2l2e3: { prompt: "What family agreement helps against this scam?", options: ["Sharing passwords", "A code word for emergencies", "Always using WhatsApp", "Never answering anyone"], explain: "A code word only your family knows defeats any impostor." },
  u2l2e4: { from: "Mom (saved contact)", text: "Honey, are you coming for lunch on Sunday? I'm making tamales.", explain: "A contact you already had, a normal conversation, no requests for money and no urgency." },
  // u2l3
  u2l3e1: { from: "Ceiba Supermarket <prizes@ceiba-gifts.shop>", text: "You won $500! Just pay $2 shipping to receive your card.", explain: "A prize you didn't look for and a small charge to steal your card details." },
  u2l3e2: { prompt: "A “job” pays you to like posts, but first you must deposit $25. It's:", options: ["A real opportunity", "A task scam", "A formal job", "A contest"], explain: "If you have to pay first to earn, it's a scam." },
  u2l3e3: { prompt: "Which promotion is most believable?", options: ["Free iPhone for answering 3 questions", "10% discount shown in the store's official app", "$1,000 bonus for sharing a link", "Prize for being visitor 1,000,000"], explain: "Real promotions can be checked on the store's official channels." },
  u2l3e4: { from: "+44 7700 900321", text: "Safe crypto investment: double your dollars in 7 days. Reply YES.", explain: "Nobody can guarantee to double your money. Promises of quick profit = scam." },
  // u3l1
  u3l1e1: { prompt: "Which site does this link really take you to?", options: ["izalcobank.com", "verify-account.co", "login.izalcobank", "There's no way to know"], explain: "What counts is what comes right before the first “/”: verify-account.co.", context: "http://izalcobank.com.verify-account.co/login" },
  u3l1e2: { prompt: "Does the padlock (https) mean a site is trustworthy?", options: ["Yes, always", "No, only that the connection is encrypted", "Only if it's green", "Yes, if it's a bank"], explain: "Fake sites have padlocks too. Check the domain." },
  u3l1e3: { prompt: "Which link is safe for going to ShipNow (shipnow.com)?", options: ["shipnow.com/tracking", "shipnow.delivery-fee.top", "shipnow.track-parcel.com", "bit.ly/ship-now"], explain: "Only the first is on the official domain. Link shorteners hide the destination." },
  u3l1e4: { prompt: "An email says “click here” but the link looks odd. What do you do?", options: ["Click to see", "Type the official address myself", "Reply asking about it", "Forward it"], explain: "Go there yourself by typing the address or using the official app." },
  // u3l2
  u3l2e1: { prompt: "Which unexpected attachment is most dangerous?", options: ["photo.jpg", "Invoice.pdf.exe", "notes.txt", "schedule.png"], explain: "An .exe disguised with a double extension can install malware." },
  u3l2e2: { from: "Billing <invoices@lempadist-invoices.com>", text: "Please find your pending invoice attached. Open the file Invoice.html.", explain: "Real e-invoices arrive as PDF (sometimes XML or JSON), not .html, and the domain isn't the supplier's." },
  u3l2e3: { prompt: "You see a QR code stuck over another one in a parking lot to “pay”. What's going on?", options: ["It's an update", "It may take you to a fake payment site", "QR codes are always safe", "You have to pay twice"], explain: "Sticking a fake QR over the real one is a common scam. Check the link before paying." },
  u3l2e4: { prompt: "Before opening a QR code, your phone shows the address. What do you look at?", options: ["The QR's color", "The link's real domain", "Whether it has a logo", "Its size"], explain: "Same as with links: the domain before the first “/”." },
  // u3l3
  u3l3e1: { prompt: "Which domain belongs to Tunco Wallet (tuncowallet.com)?", options: ["tuncowallet.com/help", "tunco-wallet.app", "tunco.tuncowallet-app.com", "tuncowallet.com.support.xyz"], explain: "Only the first ends in tuncowallet.com before the slash." },
  u3l3e2: { from: "IzalcoBank (short code 2250)", text: "$12.50 purchase at Ceiba Supermarket with your card *4821. If you don't recognize it, call the number on your card.", explain: "No link, and it sends you to the number on your own card. That's how a bank alerts you." },
  u3l3e3: { from: "IT Support <it@atlacatlgroup.com.login-help.net>", text: "Your mailbox is full. Sign in to expand it.", explain: "The real domain is login-help.net. The rest is a subdomain meant to confuse you." },
  u3l3e4: { prompt: "What is a link shortener like bit.ly?", options: ["A government site", "Something that hides a link's real destination", "An antivirus", "A bank"], explain: "It isn't always bad, but it hides where you're going: be wary if it comes in an unexpected message." },
  // u4l1
  u4l1e1: { from: "Tunco Wallet Support ✅", text: "To release your held transfer, read us the 6-digit code you received by text.", explain: "Nobody legitimate asks you for the code. With it they get into your account." },
  u4l1e2: { prompt: "Your money transfer “is on hold” and they ask you to pay $10 to release it. What do you do?", options: ["Pay so I don't lose it", "Check in the official app or branch", "Ask for a discount", "Send my ID"], explain: "Verify through the official channel. Fees to “release” money are a scam." },
  u4l1e3: { from: "EasyRemit (short code 3310)", text: "Your $150 transfer is ready. Pick it up at any branch with your ID.", explain: "It doesn't ask for payments or data by message; it sends you to collect in person as usual." },
  u4l1e4: { prompt: "Which piece of information should you NEVER give over chat or phone?", options: ["Your name", "The verification code (OTP)", "Your city", "Your email"], explain: "The verification code is the key to your account." },
  // u4l2
  u4l2e1: { from: "Buyer on Marketly", text: "I've already paid. To receive the money, enter your card details at marketly-payments.com", explain: "You don't need to give your card to receive money, and that isn't Marketly's domain." },
  u4l2e2: { prompt: "You're selling something and the buyer sends a “screenshot” of the transfer. The right thing is:", options: ["Hand it over now", "Check in your bank that the money arrived", "Ask for another screenshot", "Trust them if they're nice"], explain: "Screenshots can be edited. The only thing that counts is seeing the money in your account." },
  u4l2e3: { prompt: "You're buying online and the seller asks you to pay outside the platform. It's:", options: ["Normal", "A warning sign", "Cheaper and safer", "Mandatory"], explain: "Leaving the platform takes away your buyer protection." },
  u4l2e4: { from: "Buyer on Marketly", text: "Hi, is the bike still available? Can I see it Saturday morning?", explain: "A real buyer asks questions and wants to see the item. No odd payments or links." },
  // u4l3
  u4l3e1: { from: "Unknown number", text: "“We're calling from the bank. To cancel an unrecognized charge, give us your full card number and the code on the back.”", explain: "The bank already has your details and never asks for the security code (CVV)." },
  u4l3e2: { prompt: "Someone calls “from the bank” and you feel pressured. Best option?", options: ["Stay on the call", "Hang up and call the number on your card yourself", "Give only half the details", "Ask for their name"], explain: "Hang up and call an official number you already know." },
  u4l3e3: { from: "Revenue Agency <notifications@revenue.gov>", text: "Reminder: the deadline to file your tax return is the 30th. Go to the portal as usual.", explain: "Official government domain, no link asking for data, and it sends you to the usual portal." },
  u4l3e4: { from: "Unknown number 6000-0000", text: "Revenue Agency: you have a $312 refund. Enter your bank account and PIN at tax-refund.top", explain: "Nobody needs your PIN to pay you, and .top isn't a government domain." },
  // u5l1
  u5l1e1: { from: "Carlos (saved contact)", text: "You're going to get a code by text, it's for a giveaway I signed you up for. Send it to me please 🙏", explain: "Carlos's account was stolen. That code is for registering YOUR account on another phone." },
  u5l1e2: { prompt: "What is the 6-digit code for that arrives when someone registers your number in a messaging app?", options: ["To enter a giveaway", "So that phone takes over your account", "To verify your age", "It's for nothing"], explain: "Whoever has that code can open your account on their phone and message all your contacts." },
  u5l1e3: { prompt: "What protects you best if someone gets hold of that code?", options: ["Changing your profile photo", "Turning on two-step verification with your own PIN", "Leaving your groups", "Blocking the contact"], explain: "With a two-step PIN, the code alone isn't enough to take over your account." },
  u5l1e4: { from: "Group: Lopez Family", text: "Aunt Rosa: I'm home now, thanks for driving me 😊", explain: "A normal conversation in a group you already know. No codes, money or links." },
  // u5l2
  u5l2e1: { prompt: "You complain publicly about your bank and a page called “Izalco Bank Official” with 300 followers asks for your card by private message. It's:", options: ["Customer service", "A fake page taking advantage of public complaints", "A new bank channel", "A giveaway"], explain: "Scammers look for complaints and reply fast posing as support. The bank doesn't ask for your card over chat." },
  u5l2e2: { from: "Ceiba Supermarket ✔ (profile created 2 days ago)", text: "Congratulations! You won a holiday hamper. For delivery, enter your card details at ceiba-hampers.shop", explain: "A brand-new profile, a prize you didn't look for, it asks for your card and the domain isn't the store's." },
  u5l2e3: { prompt: "Which sign does NOT help you tell whether a profile is official?", options: ["That the official website links to it", "Its age and its posts", "That it has the logo and says “official” in the name", "The domain of the links it shares"], explain: "Anyone can copy a logo and write “official”. Check from the official website." },
  u5l2e4: { from: "Tunco Wallet <community@tuncowallet.com>", text: "Follow us on social media: our official links are at tuncowallet.com/social. We'll never ask for passwords by message.", explain: "Official domain, and it sends you to check the profiles on its own website." },
  // u5l3
  u5l3e1: { from: "Pacific Investments 📈", text: "I made $800 this week with this group 😱 Join with $50 and the advisor multiplies it. Look at my screenshots.", explain: "Guaranteed profits and screenshots as proof: screenshots are faked and the money never comes back." },
  u5l3e2: { prompt: "On a platform you see your profits grow, but to withdraw they ask you to pay a “tax” first. What's going on?", options: ["That's normal with investments", "It's a scam: the balance is fake and they'll keep asking for payments", "I pay and withdraw", "I ask for a discount"], explain: "The balance you see is made up. Every payment “to withdraw” leads to another charge." },
  u5l3e3: { prompt: "Someone you met online weeks ago never agrees to a video call and now needs money for a ticket. It's probably:", options: ["Bad luck", "A romance scam", "A giveaway", "A bank error"], explain: "Winning your trust for weeks and then asking for money is the romance-scam pattern." },
  u5l3e4: { prompt: "Which giveaway is most believable?", options: ["A private message from a stranger saying you won", "A post on the official page with rules, dates and a publicly announced winner", "An email asking for $5 to deliver your prize", "A text from a foreign number"], explain: "Real giveaways have public rules and don't charge you to deliver the prize." },
  // u6l1
  u6l1e1: { prompt: "Which password is most secure?", options: ["Izalco2026!", "maria1990", "three-corn-tamales-no-salsa", "12345678"], explain: "A long, unusual phrase is harder to guess than a short word with symbols." },
  u6l1e2: { prompt: "You use the same password everywhere and an online store's leaks. What's the risk?", options: ["None", "That they try it on your email and your bank", "You only lose the store account", "That your account gets deleted"], explain: "Attackers try leaked passwords on other sites. Use a different one for each." },
  u6l1e3: { prompt: "What is a password manager for?", options: ["Sharing passwords with friends", "Creating and remembering a different one per site, and not autofilling it on fake sites", "Making them less secure", "Printing them"], explain: "Also, if the domain doesn't match, the manager won't fill in the password: a useful alarm." },
  u6l1e4: { prompt: "Where is it safe to type your bank password?", options: ["In a form that arrived by email", "Only in the official app or at an address you type yourself", "In a support chat", "Replying to a text"], explain: "Your password only goes into the official site or app that you open yourself." },
  // u6l2
  u6l2e1: { prompt: "What does two-step verification do?", options: ["Asks for something besides your password to log in", "Changes your password", "Blocks ads", "Gives you two accounts"], explain: "Even if they steal your password, they're missing the second step." },
  u6l2e2: { prompt: "Which second step is hardest to steal with a fake page?", options: ["Code by text", "Code by email", "Physical security key (USB or NFC)", "Secret question"], explain: "A physical key checks the site's real domain: on a fake page it simply doesn't work." },
  u6l2e3: { prompt: "You get a code to AUTHORIZE a transfer you didn't make. What does it mean?", options: ["A bank error", "Someone already has your username and password: don't share the code and call the bank", "You won something", "You should forward it"], explain: "The code arrives because someone started the transaction with your details. Change your password and tell the bank." },
  u6l2e4: { prompt: "Someone calls and asks for that code “just to verify it's you”. Who could need it?", options: ["The bank", "Your phone company", "Nobody: the code is only for you", "The police"], explain: "No legitimate company asks you to read out a verification code." },
  // u6l3
  u6l3e1: { prompt: "Your phone suddenly shows “no service” and you get password-change emails. What might be happening?", options: ["An antenna failure", "Someone cloned your SIM to receive your codes", "You ran out of credit", "An update"], explain: "With a copy of your SIM they get your texts. Call your phone company from another phone as soon as possible." },
  u6l3e2: { from: "Unknown number 7000-1111", text: "Izalco Bank: download the new security app from izalco-secure.apk to avoid your account being blocked.", explain: "An .apk file by text installs an app outside the official store, usually to spy on your phone." },
  u6l3e3: { prompt: "Where is it safe to download your bank's app?", options: ["From a link in a text", "From your phone's official store, checking the developer is the bank", "From a chat group", "From any site with the logo"], explain: "Even the official store has copies: check the developer's name and the downloads." },
  u6l3e4: { prompt: "A flashlight app asks for permission to read your texts and see your screen. What do you do?", options: ["Allow everything", "Deny the permissions and uninstall it", "Allow it just for today", "Recommend it"], explain: "A flashlight doesn't need your messages. With those permissions they can read your bank codes." },
  // u7l1
  u7l1e1: { from: "Richard Mendez, Manager <r.mendez@atlacatlgroup.com>", text: "Got the quote. We'll review it Monday at the 10 o'clock meeting. Thanks.", explain: "Correct domain, normal tone and no request for payments or secrecy." },
  u7l1e2: { from: "Richard Mendez, Manager <r.mendez@atIacatlgroup.com>", text: "I'm in a meeting. Make a $4,800 transfer to this account today. Don't mention it to anyone.", explain: "Look at the domain: “atIacatl” has a capital I instead of an l. Plus: urgency, money and secrecy." },
  u7l1e3: { prompt: "What rule best protects a company from boss fraud?", options: ["Reply quickly", "Confirm every new transfer or account change by calling a known number, and require two people to approve it", "Use only personal email", "Pay in cash"], explain: "A fixed verification process works even when the email looks perfect." },
  u7l1e4: { prompt: "You're asked to buy gift cards for “some clients” and send the codes in a photo. It's:", options: ["An accounting procedure", "Fraud: the money on those cards can't be recovered", "A bonus for you", "Normal in December"], explain: "Gift cards are like cash: once the codes are sent, they're gone." },
  // u7l2
  u7l2e1: { from: "Lempa Distributors <billing@lempadist.com>", text: "Please find attached the October e-invoice (PDF and XML). Payment details are the same as always.", explain: "The supplier's domain, the expected e-invoice format and no change to the payment details." },
  u7l2e2: { from: "Lempa Distributors <billing@lempadist.com>", text: "Due to an audit we've changed banks. From today, pay to account 0099-1123-44. It's urgent to avoid late fees.", explain: "Even if the domain is real, the mailbox may have been hacked. A rushed account change gets confirmed by phone." },
  u7l2e3: { prompt: "The invoice has a “View invoice” button that asks for your email username and password. What do you do?", options: ["Enter my password", "Don't: I go to the official portal myself", "Forward it to my boss", "Reply with my password"], explain: "Viewing an invoice never requires your email password." },
  u7l2e4: { prompt: "Which detail on an invoice do scammers change most?", options: ["The logo", "The bank account number", "The date", "The client's tax ID"], explain: "Changing only the account makes the real payment end up with the scammer." },
  // u7l3
  u7l3e1: { from: "Unknown number", text: "“We're from tech support. Your computer has a virus; install this program so we can check it remotely.”", explain: "Nobody calls you to warn about a virus. That program gives them full control of your computer." },
  u7l3e2: { prompt: "A window with an alarm appears: “Your computer is locked, call 800-…”. What do you do?", options: ["Call", "Close the browser (forcing it if needed) and don't call", "Pay to unlock it", "Turn off the router"], explain: "It's a scary web page. Closing it is enough; the number belongs to the scammers." },
  u7l3e3: { from: "Help desk <helpdesk@atlacatlgroup.com>", text: "We opened ticket #4471 that you reported yesterday about the printer. We'll stop by your desk tomorrow.", explain: "It responds to something you asked for, from the company domain and without asking for passwords." },
  u7l3e4: { prompt: "Someone from “IT” asks for your password to fix your account. What do you say?", options: ["Give it to them", "IT doesn't need my password; I confirm with the official help desk", "Send it in writing", "Give them half"], explain: "Real IT staff can reset your account without knowing your password." },
  // u8l1
  u8l1e1: { prompt: "Which site does this link really take you to?", options: ["izalcobank.com", "secure-login.top", "Both", "Neither: it doesn't open"], explain: "Everything before the “@” is treated as a username and ignored. The real site is secure-login.top.", context: "https://izalcobank.com@secure-login.top/start" },
  u8l1e2: { prompt: "The address bar shows “xn--izalcobnk-7fg.com” instead of the name you expected. What does it mean?", options: ["It's the technical form of a domain with letters from another alphabet: it isn't izalcobank.com", "It's the encrypted official site", "It's a browser error, ignore it", "It's the bank's mobile version"], explain: "Domains with special letters (like a Cyrillic “а”) are written like this internally. They look the same as the real one, but they're another site." },
  u8l1e3: { prompt: "The link starts with the bank's real domain. Where do you end up?", options: ["At izalcobank.com", "At izalcobank-clients.top, after passing through the bank", "Nowhere", "In the bank's app"], explain: "It's a redirect: the bank forwards you to whatever “destination” says. Look at what comes after the “?” too.", context: "https://izalcobank.com/exit?destination=https://izalcobank-clients.top/password" },
  u8l1e4: { prompt: "Which of these links IS on the Revenue Agency site (revenue.gov)?", options: ["revenue.gov.invoice-check.com/start", "revenue-gov.com/invoices", "portal.revenue.gov/invoices/check?ref=revenue.gov.xyz", "revenue.gov-invoices.com"], explain: "The domain is what comes before the first “/”: portal.revenue.gov. What comes after the “?” doesn't change the site." },
  u8l1e5: { prompt: "You open the attachment “Receipt.html” and the Atlacatl Group login appears. The address starts with “file:///C:/Users/…”. What's happening?", options: ["It's the intranet in offline mode", "It's a fake page saved on your computer: whatever you type gets sent to the attacker", "It's safe because it has no “http”", "It's a PDF"], explain: "An attached .html can draw any login page. There's no domain to check because it lives on your disk." },
  u8l1e6: { prompt: "You expand a shortened link and see: https://marketly.com.payments.marketly-pay.com/confirm. Who owns that site?", options: ["marketly.com", "marketly-pay.com", "com.payments", "payments.marketly"], explain: "Read from right to left starting at the first “/”: the registered domain is marketly-pay.com. Everything else is subdomains the scammer added." },
  // u8l2
  u8l2e1: { from: "Izalco Bank <notices@izalcobank.com>", text: "We've updated your account terms. You can read them in the Documents section of the app. You don't need to do anything.", explain: "Official domain, no links or requests, and it sends you to the app you already have. Not everything is a trap." },
  u8l2e2: { from: "Izalco Bank <notices@izalcobank.com>", text: "Due to a system update, reply to this email with your username and password to keep your online banking active.", explain: "The sender can be spoofed or come from a hacked account. What gives the trap away is the request: a bank never asks for your password." },
  u8l2e3: { from: "Andrea Lopez (saved contact)", text: "Hi! I sent a 6-digit code to your number by mistake, can you pass it to me please? 🙏", explain: "It's a real contact with a stolen account. The code is to take yours and keep the chain going." },
  u8l2e4: { from: "IzalcoBank (short code 2250)", text: "Izalco Bank: declined purchase of $849.00 at ElectroWorld. If you don't recognize it, block your card at izalcobank-alerts.com", explain: "Fake texts can appear in the same thread as real ones. The domain izalcobank-alerts.com isn't the bank's." },
  u8l2e5: { from: "Shows as 2200-1234 (the bank's official number)", text: "“I'm from the fraud department. To reverse the charge I'll send you a code; read it to me to confirm it's you.”", explain: "The number on screen can be faked. The code is to authorize a transaction on your account." },
  u8l2e6: { from: "ShipNow <notifications@shipnow.com>", text: "Your parcel SN-552910 wasn't delivered because nobody was home. Reschedule in the ShipNow app or call the number on our website.", explain: "Official domain, no link or charge, and it sends you to the usual app or website." },
  // u8l3
  u8l3e1: { prompt: "You work in finance. A regular supplier writes from their real email, in the same invoice thread, and gives you a new bank account. What do you do?", options: ["Update it: the email is real", "Ask for the bank's letter by email", "Call the supplier on the number we already had on file, not the one in the email", "Pay half to each account"], explain: "If their mailbox was hacked, the scammer replies inside the real thread and can fake the letter too. Only a call to a known number confirms it." },
  u8l3e2: { prompt: "That night you get 15 notifications in a row asking you to approve a sign-in you didn't make. What do you do?", options: ["Approve one so they stop", "Reject them all, change my password and tell IT", "Turn off my phone", "Ignore them"], explain: "They already have your password and are hoping you approve out of fatigue. Reject and change your password." },
  u8l3e3: { prompt: "A “shared document” asks you to sign in with your work account and then an app called “PDF Viewer” asks for permission to “read your email and send email on your behalf”. What's the danger?", options: ["Nothing, it's a viewer", "Giving that app access to your email, even though you never typed your password on a fake site", "That it's a PDF", "That it asks you to sign in"], explain: "With that permission the app reads and sends email as you, even if you change your password later. A PDF viewer doesn't need your email." },
  u8l3e4: { from: "Unknown number", text: "“It's the general manager.” (The voice sounds just like theirs.) “I'm in a meeting, make a transfer to this supplier today. Don't call me, I can't talk.”", explain: "Voices can be cloned with AI from videos or audio clips. “Don't call me” is exactly what stops you from verifying." },
  u8l3e5: { from: "IT Support <support@atlacatlgroup.com>", text: "On Friday at 6 p.m. we'll do email maintenance. It may not work for 30 minutes. You don't need to do anything.", explain: "An informational notice from the company domain, with no links or requests for passwords." },
  u8l3e6: { prompt: "You realize you typed your password on a fake page 10 minutes ago. What's best?", options: ["Wait and see if anything happens", "Change it from the official site, sign out of open sessions, tell IT or the bank and check your transactions", "Delete the email so there's no trace", "Change only your personal email password"], explain: "Acting within minutes makes the difference. Reporting it isn't embarrassing: it helps stop the attack for everyone." },
};
