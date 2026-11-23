import { A, Item, LegalPage, MailLink, Section } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";
import { SITE } from "@/lib/site";

// English translation of the privacy policy. The Spanish version (page.tsx) prevails if they differ:
// keep both in sync and bump the version in src/lib/legal.ts when either changes.

const SECTIONS = [
  { id: "responsable", title: "Who is responsible" },
  { id: "datos", title: "What data we collect" },
  { id: "usos", title: "What we use it for" },
  { id: "base", title: "Your consent" },
  { id: "empresa", title: "If you join a company" },
  { id: "familia", title: "Family plan and classes" },
  { id: "navegador", title: "Cookies" },
  { id: "terceros", title: "Who we share it with" },
  { id: "conservacion", title: "How long we keep it" },
  { id: "seguridad", title: "How we protect it" },
  { id: "derechos", title: "Your rights" },
  { id: "menores", title: "Minors" },
  { id: "internacional", title: "If you live in another country" },
  { id: "cambios", title: "Changes to this policy" },
];

export function PrivacyEn() {
  return (
    <LegalPage
      doc="privacidad"
      sections={SECTIONS}
      summary={
        <ul className="list-disc space-y-1 pl-5">
          <li>You can use the simulator without creating an account.</li>
          <li>For an account we only ask for your name, your email and a password.</li>
          <li>We don’t sell your data or use it for advertising.</li>
          <li>Your card details are handled by Wompi; we never see them.</li>
          <li>
            You can ask for a copy of your data, correct it or delete your account by writing to <MailLink />.
          </li>
        </ul>
      }
    >
      <Section id="responsable" title="Who is responsible">
        <p>
          {SITE.name} is an educational platform, made in El Salvador and available worldwide in English and Spanish, for
          learning to recognize phishing attempts and other online scams. {SITE.name} is the controller of the personal data
          described in this policy, under El Salvador’s Personal Data Protection Law (Legislative Decree No. 144 of 2024).
          The controller’s identification details are in the <A href={`${LEGAL.terminos.path}#proveedor`}>Terms and conditions</A>.
        </p>
        <p>
          For anything related to your personal data, write to us at <MailLink />.
        </p>
      </Section>

      <Section id="datos" title="What data we collect">
        <p>We only collect what the service needs to work. We don’t ask for your ID number, phone, address or date of birth.</p>
        <ul className="space-y-3">
          <Item label="Your account data">
            Your name (to greet you and for your certificate), your email address (to log in and recover your password) and
            your password. Your password is never stored as is: we keep an irreversibly encrypted version (a hash). We also
            store the date you created your account and the date of your last login.
          </Item>
          <Item label="Record of your acceptances">
            When you accept the Terms and conditions and this Privacy policy (when you sign up or buy), we store which
            document and version you accepted, the exact text of the checkbox, the date and time, the form where you did it,
            your IP address and your browser type. This lets us prove that you gave your consent and when.
          </Item>
          <Item label="Your progress">
            The simulator rounds you complete (which parts of each message you marked, your answer, the score and the time),
            your path lessons, your lives and your XP. We use this to calculate your level, skills and badges.
          </Item>
          <Item label="Scam of the day and challenges">
            Your daily answer and your streak of consecutive days. If you create a challenge, we store the messages you got,
            your score and your nickname, which whoever receives the link will see. If you play someone else’s challenge, we
            store your score and the name you type for the leaderboard (you can use a nickname or leave it blank); anyone with
            the link will see it.
          </Item>
          <Item label="Achievement card and certificate (optional)">
            If you choose to share your achievement card, we create a public link showing your nickname, level, XP, lessons
            and streak; never your name or email, and you can stop sharing it whenever you want. If you have the Pro
            certificate, anyone with its code can verify it and will see your name, your score and the date.
          </Item>
          <Item label="Scam reports">
            If you report a scam, we store the channel, the sender and the text you paste. We review it before publishing,
            may edit it to remove personal data, and never show who sent it. We keep your account linked to the report to
            prevent abuse and to count the “I got it too” clicks.
          </Item>
          <Item label="Leaderboard (optional)">
            A nickname and a country, if you choose to set them. The public leaderboard only shows your nickname, country and
            XP; never your name or email. You can hide yourself from the leaderboard whenever you want.
          </Item>
          <Item label="Payment data">
            If you buy a plan, we store the plan, amount, date, payment status and the transaction number Wompi gives us. We
            never receive or store your card number, expiry date or security code.
          </Item>
          <Item label="AI features (Pro plan)">
            When the AI chats and the “Is it a scam?” checker are available, we’ll store the messages you write in them and
            their result. Those messages are sent to our AI provider to generate the replies. Don’t write real personal data
            in them.
          </Item>
          <Item label="Daily reminder (optional)">
            If you turn on notifications, we store the technical address your browser creates to receive them, your language
            and, if you have an account, which account it belongs to. We only use it to send you one notice a day. The instant
            “Is it a scam?” check and the simulated calls run in your browser: we don’t store or receive those messages or audio.
          </Item>
          <Item label="Security data">
            When a login fails, we store the email used and the time for 15 minutes, to slow down password-guessing attempts.
            If you ask to recover your password, we store an encrypted version of the link we send you and its expiry date.
          </Item>
          <Item label="Usage statistics">
            We count how many visits and logins there are each day, as a total number. That count doesn’t store your IP
            address, your email or anything that identifies you. In addition, only if you accept it in the cookie notice, we
            use Google Analytics to measure in aggregate which pages are visited, from what type of device and approximate
            country. We don’t send it your name or email.
          </Item>
        </ul>
        <p>
          We don’t process sensitive data (health, beliefs, ethnic origin, biometric data and the like). The simulator
          messages (banks, companies, people, numbers and domains) are fictional. We’ll never ask you for real passwords, bank
          details or identity documents inside the exercises.
        </p>
      </Section>

      <Section id="usos" title="What we use it for">
        <ul className="list-disc space-y-2 pl-5">
          <li>Creating and maintaining your account, and letting you log in.</li>
          <li>Saving your progress, showing you your statistics and, if you choose, showing you on the leaderboard.</li>
          <li>Processing plan purchases, activating your access and handling refunds.</li>
          <li>Sending you emails the service needs, such as the password recovery link. We don’t send marketing emails.</li>
          <li>Protecting accounts and the site against unauthorized access and abuse.</li>
          <li>Proving that you accepted our terms and this policy.</li>
          <li>Knowing, as totals, how much the site is used so we can improve it.</li>
        </ul>
        <p>
          We don’t use your data for other purposes, we don’t make automated decisions that legally affect you, and we don’t
          sell, rent or hand over your personal data to third parties for commercial or advertising purposes.
        </p>
      </Section>

      <Section id="base" title="Your consent">
        <p>
          We process your data with your free, express and informed consent, which you give by ticking this policy’s checkbox
          when you sign up or buy. This policy’s checkbox is separate from the Terms and conditions checkbox, and neither is
          pre-ticked.
        </p>
        <p>
          You can withdraw your consent at any time by writing to <MailLink />. Since we can’t keep your account without this
          data, withdrawing it means closing your account and deleting your data, except what the law requires us to keep
          (for example, payment records).
        </p>
      </Section>

      <Section id="empresa" title="If you join a company">
        <p>
          With the Business plan, an organization pays for Pro for its team. If you join one through its invite link, we ask
          for a separate authorization, recorded with the date, so that:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            The company’s manager can see your name, your email, the lessons you completed, your XP, your rounds and your
            average score in the simulator and the training inbox, the sign you miss most, when you last logged in, the team
            they assigned you and your drill results (whether you clicked or reported).
          </li>
          <li>
            The company can send you phishing drills: practice emails that imitate a scam. We store who each one was sent to,
            when, whether you opened its link and whether you reported it. Those emails never ask for data.
          </li>
          <li>
            If you use “Report phishing” from your company page, your manager will see your name and the subject, sender and
            note you write.
          </li>
        </ul>
        <p>
          The company can’t see your password, your personal payments, your AI conversations or your acceptance records. You
          can leave the company whenever you want from the Business page; from that moment it stops seeing your progress. If
          you also want past drill results deleted, write to us at <MailLink />.
        </p>
      </Section>

      <Section id="familia" title="Family plan and classes">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-chalk">Family plan:</strong> if you join your family’s plan, you allow whoever manages it
            to see your name, your email, your lessons, your XP, your streak and when you last logged in. They can’t see your
            answers or your payments. You can leave whenever you want.
          </li>
          <li>
            <strong className="text-chalk">Classes (class mode):</strong> if you join a class with its code, you allow your
            teacher to see your name, your lessons, your XP, your streak and when you last logged in. If you’re a minor, do it
            with permission from your parent or guardian. You can leave the class whenever you want.
          </li>
          <li>Both authorizations are recorded with the date, like all other acceptances.</li>
        </ul>
      </Section>

      <Section id="navegador" title="Cookies">
        <p>
          We use necessary cookies (your session and the language you chose), some data that stays in your own browser
          and, only if you accept, Google Analytics cookies. We don’t use advertising cookies. The details are in the{" "}
          <A href={LEGAL.cookies.path}>Cookie policy</A>.
        </p>
      </Section>

      <Section id="terceros" title="Who we share it with">
        <p>
          If you join a company, its manager receives the progress data described in{" "}
          <A href="#empresa">If you join a company</A>, because you authorize it. In addition, to operate we use providers
          that process data on our behalf and only to provide their service to us:
        </p>
        <ul className="space-y-3">
          <Item label="MongoDB Atlas">Hosts the database where accounts, progress and payments are stored.</Item>
          <Item label="Vercel">Hosts and serves the website.</Item>
          <Item label="Wompi (El Salvador)">
            Processes card payments. When you pay, you enter your card details directly on Wompi’s page, under its own terms
            and privacy policy.
          </Item>
          <Item label="Mailjet">Sends the service’s emails, such as password recovery.</Item>
          <Item label="Google Analytics (Google)">
            Only if you accept: measures site usage in aggregate. It receives technical data about your visit (pages, device
            and browser type, approximate country and its cookie identifiers). You can withdraw your permission in “Cookie
            preferences”.
          </Item>
          <Item label="Your browser’s notification service">
            If you turn on the reminder, the notice travels through your browser’s push service (for example, Google, Apple or
            Mozilla). It only receives the text of the notice.
          </Item>
          <Item label="Anthropic">
            Will generate the replies for the AI features when they’re available. It receives the messages of those
            conversations and nothing else.
          </Item>
        </ul>
        <p>
          Some of these providers store or process data on servers outside El Salvador (for example, in the United States). By
          accepting this policy you authorize that transfer, which is limited to what’s needed to provide the service. We may
          also share data if a competent authority requires it under the law.
        </p>
      </Section>

      <Section id="conservacion" title="How long we keep it">
        <ul className="list-disc space-y-2 pl-5">
          <li>Your account data and progress: while your account exists. If you ask us to delete it, we delete them.</li>
          <li>Record of your acceptances: while your account exists and, if you made a purchase, as long as that payment record.</li>
          <li>Your company’s drill results: while the company keeps its account, or until you ask us to delete them.</li>
          <li>Challenges and their plays: deleted automatically after 90 days.</li>
          <li>Scam-of-the-day answers: 180 days (your streak stays in your account).</li>
          <li>Scam reports: published ones, while they’re still useful as alerts; rejected ones, up to 90 days.</li>
          <li>Sessions: up to 30 days, or sooner if you log out.</li>
          <li>AI conversations: deleted automatically after 30 days.</li>
          <li>Detailed XP log for the weekly leaderboard: 60 days (your total XP stays in your account).</li>
          <li>Daily reminder subscription: until you turn it off or your browser cancels it.</li>
          <li>Failed login attempts: 15 minutes.</li>
          <li>Password recovery links: expire after 1 hour and are deleted automatically afterwards.</li>
          <li>Payment records: as long as accounting and tax obligations require, even if you delete your account.</li>
        </ul>
      </Section>

      <Section id="seguridad" title="How we protect it">
        <p>
          We store passwords with an irreversible encryption algorithm, the site only works over an encrypted connection
          (HTTPS), your session travels in a cookie the browser doesn’t let other scripts read, recovery links work only once,
          and we limit login attempts. No system is infallible, but we work to protect your data and, if an incident affects
          it, we’ll let you know and report it to the authorities as the law requires.
        </p>
      </Section>

      <Section id="derechos" title="Your rights">
        <p>The Personal Data Protection Law gives you the right to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-chalk">Access:</strong> know what data we hold about you and receive a copy.
          </li>
          <li>
            <strong className="text-chalk">Rectification:</strong> correct inaccurate or incomplete data.
          </li>
          <li>
            <strong className="text-chalk">Erasure:</strong> have us delete your account and your data.
          </li>
          <li>
            <strong className="text-chalk">Objection:</strong> have us stop using your data for a particular purpose.
          </li>
          <li>
            <strong className="text-chalk">Portability:</strong> receive your data in a format you can take to another service.
          </li>
          <li>Withdraw your consent at any time.</li>
        </ul>
        <p>
          Write to us at <MailLink /> from your account email, saying which right you want to exercise. It’s free. We’ll reply
          within 15 business days at most. If needed to protect your account, we may ask you to confirm your identity. If
          you’re not satisfied with our reply, you can go to the data protection authority set out by law.
        </p>
      </Section>

      <Section id="menores" title="Minors">
        <p>
          {SITE.name} can be used in schools and by students. If you’re under 18 (or the age of majority where you live), you
          need permission from your parent or guardian to create an account and to buy. If you’re a parent or guardian and
          believe a minor gave us data without your permission, write to us at <MailLink /> and we’ll delete it.
        </p>
      </Section>

      <Section id="internacional" title="If you live in another country">
        <p>
          {SITE.name} is provided from El Salvador and this policy is governed by its laws. If you live in another country, the
          data protection rules of your country that can’t be waived also protect you. For example, if you’re in the European
          Union or the United Kingdom, the GDPR gives you the rights of access, rectification, erasure, objection, restriction
          and portability, and you can complain to your country’s data protection authority. You exercise all of these rights
          the same way: by writing to <MailLink />.
        </p>
        <p>
          We process your data with your consent and to perform the service contract you asked for (your account and, if you
          buy, your plan). We also keep payment data to comply with legal obligations.
        </p>
      </Section>

      <Section id="cambios" title="Changes to this policy">
        <p>
          If we change how we process your data, we’ll update this page, its date and its version number. If the change is
          significant, we’ll let you know by email or on the site and, where the law requires it, we’ll ask you to accept it
          again.
        </p>
      </Section>
    </LegalPage>
  );
}
