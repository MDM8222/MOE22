"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ReportView } from "@/components/ReportView";
import type { LeadSubmission } from "@/lib/schema";

type State =
  | { kind: "loading" }
  | { kind: "ready"; submission: LeadSubmission }
  | { kind: "not_found" };

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // 1) Instant render from the sessionStorage cache written at submit time.
      try {
        const cached = sessionStorage.getItem(`bsm:submission:${id}`);
        if (cached) {
          setState({ kind: "ready", submission: JSON.parse(cached) });
          return;
        }
      } catch {
        /* ignore */
      }

      // 2) Fall back to the persisted record via the API.
      try {
        const res = await fetch(`/api/reports/${id}`);
        if (!res.ok) {
          if (!cancelled) setState({ kind: "not_found" });
          return;
        }
        const data = await res.json();
        if (!cancelled)
          setState({ kind: "ready", submission: data.submission });
      } catch {
        if (!cancelled) setState({ kind: "not_found" });
      }
    }

    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <>
      <SiteHeader />
      <main>
        {state.kind === "loading" && <LoadingState />}
        {state.kind === "not_found" && <NotFoundState />}
        {state.kind === "ready" && <ReportView submission={state.submission} />}
      </main>
      <SiteFooter />
    </>
  );
}

function LoadingState() {
  return (
    <div className="container-page py-20">
      <div className="space-y-4">
        <div className="h-4 w-32 animate-pulse rounded bg-paper-line" />
        <div className="h-10 w-2/3 animate-pulse rounded bg-paper-line" />
        <div className="relative mt-6 h-40 overflow-hidden rounded-2xl bg-paper-soft shimmer" />
        <div className="relative h-32 overflow-hidden rounded-2xl bg-paper-soft shimmer" />
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-semibold text-ink">Report not found</h1>
      <p className="mt-3 text-ink-700">
        This report may have expired or the link is incorrect.
      </p>
      <Link href="/" className="btn-accent mt-8">
        Generate a new Buyer Signal Map
      </Link>
    </div>
  );
}
