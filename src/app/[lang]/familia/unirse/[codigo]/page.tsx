import type { Metadata } from "next";
import { Suspense } from "react";
import { JoinOrg } from "@/components/business/JoinOrg";
import { PageShell } from "@/components/SiteHeader";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Unirme a mi familia", "Join my family"), robots: { index: false } };
}

export default function JoinFamilyPage(props: PageProps<"/[lang]/familia/unirse/[codigo]">) {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-80 max-w-md animate-pulse rounded-3xl bg-desk-3" />}>
        <JoinOrg kind="familia" params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </PageShell>
  );
}
