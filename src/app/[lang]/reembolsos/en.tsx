import { A, Item, LegalPage, MailLink, Section } from "@/components/legal/LegalPage";
import { LEGAL, REFUND_DAYS, RETRACT_DAYS } from "@/lib/legal";
import { SITE } from "@/lib/site";

// English translation of the refund policy. The Spanish version (page.tsx) prevails if they differ.

const SECTIONS = [
  { id: "retracto", title: "Right of withdrawal" },
  { id: "otros", title: "Other refund cases" },
  { id: "sin-reembolso", title: "When there’s no refund" },
  { id: "como", title: "How to request it" },
  { id: "plazos", title: "Timing and refund method" },
  { id: "reclamos", title: "If you’re not satisfied" },
];

export function RefundsEn() {
  return (
    <LegalPage
      doc="reembolsos"
      sections={SECTIONS}
      summary={
        <ul className="list-disc space-y-1 pl-5">
          <li>
            You have <strong className="text-chalk">{RETRACT_DAYS} days</strong> from your purchase to ask for a full refund,
            no questions asked.
          </li>
          <li>If we overcharged you or Pro didn’t activate, we’ll refund you at any time.</li>
          <li>We refund the money to the same card within {REFUND_DAYS} days of hearing from you.</li>
        </ul>
      }
    >
      <Section id="retracto" title="Right of withdrawal">
        <p>
          The Pro plan is bought online, so El Salvador’s Consumer Protection Law gives you a right of withdrawal: you can
          cancel your purchase within <strong className="text-chalk">{RETRACT_DAYS} days</strong> of the payment date, without
          saying why and at no cost.
        </p>
        <p>
          We refund 100% of what you paid, even if you’ve already used the Pro features during those days. When we do, your
          account goes back to the free plan; your progress isn’t deleted.
        </p>
        <p>If you extended Pro with a second purchase, each payment has its own {RETRACT_DAYS}-day withdrawal period.</p>
        <p>
          The same applies to the Family plan and the Business plan: the buyer has {RETRACT_DAYS} days from each payment (the
          yearly purchase or the extra seats) to ask for a full refund. Refunding it removes what that payment bought: the
          plan year or the added seats.
        </p>
      </Section>

      <Section id="otros" title="Other refund cases">
        <p>Besides withdrawal, we’ll refund you at any time if:</p>
        <ul className="space-y-3">
          <Item label="Duplicate or wrong charge">We charged you twice for the same plan or an amount different from the one shown at purchase.</Item>
          <Item label="You paid and Pro didn’t activate">If we can’t activate it, we refund the full payment.</Item>
          <Item label="We stop providing the service">
            If we shut down {SITE.name}, remove a Pro feature while you had paid for it, or close your account without you
            having breached the terms, we refund the prorated amount for the days you couldn’t use.
          </Item>
        </ul>
      </Section>

      <Section id="sin-reembolso" title="When there’s no refund">
        <p>
          After the {RETRACT_DAYS}-day withdrawal period, and outside the cases above, we don’t refund the unused part of the
          period. Since the Pro plan doesn’t renew automatically, we’ll never charge you for a period you didn’t buy.
        </p>
        <p>
          There’s also no refund if we close your account for a serious breach of the{" "}
          <A href={LEGAL.terminos.path}>Terms and conditions</A>, such as using the site to scam or to access other people’s
          accounts.
        </p>
      </Section>

      <Section id="como" title="How to request it">
        <p>
          Write to us at <MailLink /> from your account email, with the subject “Refund”. If you have it, include the payment
          reference (it appears on the page shown after paying and starts with “anz_”). There’s no form to fill in and no need
          to explain why.
        </p>
        <p>We’ll confirm by email that we received your request.</p>
      </Section>

      <Section id="plazos" title="Timing and refund method">
        <ul className="list-disc space-y-2 pl-5">
          <li>We issue the refund within {REFUND_DAYS} days of receiving your request, to the same card you paid with, through Wompi.</li>
          <li>Your bank may then take a few more days to show the money on your statement; that depends on the bank.</li>
          <li>We refund the full amount, without deducting fees.</li>
        </ul>
      </Section>

      <Section id="reclamos" title="If you’re not satisfied">
        <p>
          If we don’t reply or you disagree with the answer, you can go to El Salvador’s{" "}
          <A href="https://www.defensoria.gob.sv">Consumer Protection Agency (Defensoría del Consumidor)</A>. You can also ask
          your bank to reverse the payment, as the Consumer Protection Law allows for online purchases.
        </p>
        <p>
          If you live outside El Salvador, these timelines are in addition to the rights your country’s consumer laws give you,
          and you can go to your country’s consumer protection authority.
        </p>
      </Section>
    </LegalPage>
  );
}
