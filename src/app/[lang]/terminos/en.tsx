import { A, LegalPage, MailLink, ProviderInfo, Section } from "@/components/legal/LegalPage";
import { AI_LIMITS } from "@/lib/ai/personas";
import { BUSINESS, FAMILY } from "@/lib/business";
import { LEGAL, RETRACT_DAYS } from "@/lib/legal";
import { PLANS } from "@/lib/plans";
import { SITE } from "@/lib/site";

// English translation of the terms. The Spanish version (page.tsx) prevails if they differ:
// keep both in sync and bump the version in src/lib/legal.ts when either changes.

const SECTIONS = [
  { id: "proveedor", title: "Who we are" },
  { id: "servicio", title: `What ${SITE.name} is` },
  { id: "cuenta", title: "Your account" },
  { id: "uso", title: "Acceptable use" },
  { id: "planes", title: "Free plan and Pro plan" },
  { id: "empresa", title: "Business plan" },
  { id: "familia", title: "Family plan and classes" },
  { id: "retracto", title: "Withdrawal and refunds" },
  { id: "ia", title: "AI features" },
  { id: "comunidad", title: "Challenges and community alerts" },
  { id: "propiedad", title: "Intellectual property" },
  { id: "disponibilidad", title: "Availability and changes" },
  { id: "responsabilidad", title: "Liability" },
  { id: "suspension", title: "Account suspension and closure" },
  { id: "cambios", title: "Changes to these terms" },
  { id: "ley", title: "Governing law and complaints" },
];

export function TermsEn() {
  const m = PLANS["pro-mensual"];
  const y = PLANS["pro-anual"];
  return (
    <LegalPage
      doc="terminos"
      sections={SECTIONS}
      summary={
        <ul className="list-disc space-y-1 pl-5">
          <li>{SITE.name} is a platform for learning to spot online scams with fictional examples.</li>
          <li>The Pro plan is a one-time payment, with no automatic renewal.</li>
          <li>You have {RETRACT_DAYS} days from your purchase to ask for a full refund, no questions asked.</li>
          <li>Don’t use the content to deceive anyone.</li>
        </ul>
      }
    >
      <Section id="proveedor" title="Who we are">
        <p>These terms govern the use of the {SITE.name} website and the purchase of its plans. The service provider is:</p>
        <ProviderInfo />
        <p>
          When you sign up or buy, you tick a checkbox to accept these terms, separate from the{" "}
          <A href={LEGAL.privacidad.path}>Privacy policy</A> checkbox. We keep a record of that acceptance with the date, the
          document version and the form where you gave it.
        </p>
      </Section>

      <Section id="servicio" title={`What ${SITE.name} is`}>
        <p>
          {SITE.name} is an online educational service, in English and Spanish and available worldwide, for learning to
          recognize phishing and other online scams, through a simulator, a guided path of lessons, a leaderboard and, on the
          Pro plan, advanced exercises.
        </p>
        <p>
          All messages, brands, people, numbers and links in the exercises are fictional or used only as examples for
          educational purposes. {SITE.name} isn’t a security service, doesn’t review real messages you receive and doesn’t
          replace advice from your bank, the police or a professional.
        </p>
        <p>
          The Pro plan’s certificate of completion is an internal acknowledgment that you completed the training; it isn’t a
          degree or an accredited professional certification.
        </p>
      </Section>

      <Section id="cuenta" title="Your account">
        <ul className="list-disc space-y-2 pl-5">
          <li>You can use the simulator without an account. To save your progress, use the path or buy, you need one.</li>
          <li>Give an email that’s yours and that you can check: it’s the only way to recover your account.</li>
          <li>
            Look after your password. You’re responsible for what’s done with your account if you share your password. If you
            think someone got into your account, change it and write to us.
          </li>
          <li>
            If you’re under 18 (or the age of majority where you live), you need your parent’s or guardian’s permission to
            create an account and to buy.
          </li>
          <li>Your account is personal: don’t sell or share it.</li>
        </ul>
      </Section>

      <Section id="uso" title="Acceptable use">
        <p>By using {SITE.name} you agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Use the site’s messages, techniques or materials to deceive, scam or harm other people.</li>
          <li>Try to access other people’s accounts, our systems or our databases.</li>
          <li>Cheat on the leaderboard, automate answers or deliberately overload the site.</li>
          <li>Choose a nickname that’s offensive, impersonates someone else or contains personal data.</li>
          <li>Copy or resell the site’s content without permission.</li>
        </ul>
        <p>We can change nicknames that break these rules and remove scores obtained by cheating from the leaderboard.</p>
      </Section>

      <Section id="planes" title="Free plan and Pro plan">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            The free plan costs nothing and doesn’t expire. Its features are described on the <A href="/planes">Pricing</A>{" "}
            page.
          </li>
          <li>
            The Pro plan costs US${m.price.toFixed(2)} for {m.days} days or US${y.price.toFixed(2)} for {y.days} days. The
            price you see when buying is the total you’re charged.
          </li>
          <li>
            It’s a <strong className="text-chalk">one-time payment</strong>: we don’t store your card and there are no
            automatic charges or renewals. If you pay again before it expires, the days are added.
          </li>
          <li>
            Payment is processed by Wompi with a credit or debit card. Pro activates as soon as Wompi confirms the payment. If
            you were charged and Pro didn’t activate, write to us and we’ll fix it or refund you.
          </li>
          <li>Features marked “coming soon” aren’t yet included in what you pay for.</li>
        </ul>
      </Section>

      <Section id="empresa" title="Business plan">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Whoever buys the Business plan is their organization’s <strong className="text-chalk">manager</strong>. By
            buying, they declare they can contract on its behalf. The manager also takes a seat.
          </li>
          <li>
            It costs US${BUSINESS.seatPrice} per person per year, from {BUSINESS.minSeats} people, as a one-time payment with
            no automatic renewal. Seats can be added by paying the prorated amount for the days left.
          </li>
          <li>
            Each person joins with their own account from the invite link and has Pro while the company’s plan is active. If
            they leave the company or the manager removes them, they keep their account and progress but lose the company’s
            Pro.
          </li>
          <li>
            When joining, each person expressly authorizes the manager to see their progress and send them drills. That
            authorization is recorded.
          </li>
          <li>
            Phishing drills can only be sent to people who joined the team and must be used only for training. The manager
            can’t use them to automatically discipline anyone or to obtain data: drills never ask for passwords or
            information.
          </li>
          <li>
            The manager can assign a team to each person; that opens the key lessons for that team without changing the rest
            of the path. The readiness score and the management report are indicative: they summarize progress on the
            platform and don’t certify the company’s security.
          </li>
          <li>
            The manager must treat their team’s progress and the emails reported to them as confidential information and use
            it only for training and security.
          </li>
        </ul>
      </Section>

      <Section id="familia" title="Family plan and classes">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            The Family plan costs US${FAMILY.price} a year and covers up to {FAMILY.seats} people, including the buyer. It’s a
            one-time payment with no automatic renewal. Each person joins with their own account from the invite link and
            authorizes whoever manages the plan to see their progress.
          </li>
          <li>
            Class mode is free. The teacher is responsible for using their students’ progress only for educational purposes.
            Students who are minors must join with their parent’s or guardian’s permission.
          </li>
        </ul>
      </Section>

      <Section id="retracto" title="Withdrawal and refunds">
        <p>
          Under El Salvador’s Consumer Protection Law, for online purchases you have a right of withdrawal: you can cancel
          your purchase within {RETRACT_DAYS} days, without giving reasons, and we refund the full amount. How to request it,
          the timelines and the other refund cases are in the <A href={LEGAL.reembolsos.path}>Refund policy</A>, which is part
          of these terms.
        </p>
      </Section>

      <Section id="ia" title="AI features">
        <p>The AI chats and the “Is it a scam?” checker will be Pro only and aren’t available yet. When they are:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>In the chats, an artificial intelligence will play a fictional scammer so you can practice.</li>
          <li>
            “Is it a scam?” will give an indicative opinion on a message you paste. It isn’t a guarantee: if in doubt, always
            confirm through the official channel.
          </li>
          <li>The replies are generated by a machine and may contain errors; they aren’t professional advice.</li>
          <li>Don’t type real data (passwords, card numbers, ID documents, addresses) into them.</li>
          <li>There will be a fair-use limit of {AI_LIMITS.proPerDay} uses per day.</li>
        </ul>
      </Section>

      <Section id="comunidad" title="Challenges and community alerts">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            The names you type in a challenge and the scam reports you send must be respectful and can’t contain other
            people’s personal data (names, account numbers, ID documents, addresses).
          </li>
          <li>
            By sending a report you authorize us to publish it without your name to alert other people, after reviewing it. We
            can edit it to remove personal data, reject it or take it down.
          </li>
          <li>
            Alerts are community contributions for prevention purposes: they aren’t official complaints and we don’t claim to
            know who’s behind each message. If you were the victim of a scam, call your bank and report it to your local police.
          </li>
          <li>Don’t use challenges or alerts to send dangerous links, advertising or offensive messages.</li>
        </ul>
      </Section>

      <Section id="propiedad" title="Intellectual property">
        <p>
          The texts, exercises, design, logo and code of {SITE.name} belong to {SITE.name} or are used under license. You can
          use them to learn and share links to the site, but not copy them or publish them as your own. Brand names that
          appear in the examples belong to their owners and are mentioned only to teach how to recognize impersonation; it
          doesn’t mean those companies have any relationship with {SITE.name}.
        </p>
      </Section>

      <Section id="disponibilidad" title="Availability and changes to the service">
        <p>
          We work to keep the site always available, but there may be interruptions for maintenance or failures at our
          providers. We can improve, change or remove exercises and features. If we remove a feature included in the Pro plan
          while you’ve paid for it, or if we stop offering the service, we’ll refund the prorated amount for the days you
          couldn’t use.
        </p>
      </Section>

      <Section id="responsabilidad" title="Liability">
        <p>
          {SITE.name} helps you recognize scams, but no training guarantees you’ll never be a victim. We aren’t responsible for
          decisions you make outside the site or for damage caused by a third party who scams you. We are liable for damage
          resulting from our own breach, in accordance with the law.
        </p>
        <p>
          Nothing in these terms limits the rights you have under El Salvador’s Consumer Protection Law or the consumer rights
          that the laws of your country of residence give you and that can’t be waived.
        </p>
      </Section>

      <Section id="suspension" title="Account suspension and closure">
        <p>
          You can close your account whenever you want by writing to <MailLink />. We can suspend or close an account that
          seriously breaches these terms (for example, trying to access other people’s accounts or using the site to scam).
          If the account had active Pro and we close it without you having breached these terms, we’ll refund the unused days.
        </p>
      </Section>

      <Section id="cambios" title="Changes to these terms">
        <p>
          If we change these terms, we’ll publish the new version here with its date. If the change significantly affects you,
          we’ll let you know in advance. Changes don’t apply to a plan you’ve already paid for: the conditions in force on the
          day of your purchase are respected.
        </p>
      </Section>

      <Section id="ley" title="Governing law and complaints">
        <p>
          These terms are governed by the laws of the Republic of El Salvador. If you have a problem, write to us first at{" "}
          <MailLink /> and we’ll reply within 15 business days at most. If you’re not satisfied, you can file a complaint with
          El Salvador’s <A href="https://www.defensoria.gob.sv">Consumer Protection Agency (Defensoría del Consumidor)</A>.
        </p>
        <p>
          If you live outside El Salvador, you keep the rights your country’s consumer laws give you and can go to your
          country’s consumer protection authority. Prices are in US dollars; your bank may apply a fee or exchange rate for the
          international purchase.
        </p>
      </Section>
    </LegalPage>
  );
}
