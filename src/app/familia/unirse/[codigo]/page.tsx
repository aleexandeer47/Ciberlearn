import type { Metadata } from "next";
import { Suspense } from "react";
import { JoinOrg } from "@/components/business/JoinOrg";
import { PageShell } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Unirme a mi familia", robots: { index: false } };

export default function JoinFamilyPage(props: PageProps<"/familia/unirse/[codigo]">) {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-80 max-w-md animate-pulse rounded-3xl bg-desk-3" />}>
        <JoinOrg kind="familia" params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </PageShell>
  );
}
