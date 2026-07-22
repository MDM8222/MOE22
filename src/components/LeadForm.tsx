"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface FieldErrors {
  url?: string;
  email?: string;
}

const STEPS = [
  "Reading your website",
  "Understanding your offer & ICP",
  "Mapping active buyer signals",
  "Composing your report",
];

export function LeadForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout);
  }, []);

  function startProgress() {
    setStep(0);
    // Advance through the first three steps on a timer; hold the last step
    // until the request resolves so it always feels honest.
    const delays = [1200, 2600, 4200];
    delays.forEach((d, i) => {
      timers.current.push(setTimeout(() => setStep(i + 1), d));
    });
  }

  function stopProgress() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function clientValidate(): boolean {
    const next: FieldErrors = {};
    if (!url.trim()) next.url = "Enter your company website.";
    if (!email.trim()) next.email = "Enter your work email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      next.email = "That doesn't look like a valid email.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError(null);
    if (!clientValidate()) return;

    setLoading(true);
    startProgress();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        stopProgress();
        setLoading(false);
        if (data?.error?.fields) {
          setErrors(data.error.fields as FieldErrors);
        } else {
          setGeneralError(
            data?.error?.message || "Something went wrong. Please try again.",
          );
        }
        return;
      }

      // Cache the full record so the results page renders instantly and works
      // even when the storage backend is ephemeral (serverless).
      try {
        sessionStorage.setItem(
          `bsm:submission:${data.id}`,
          JSON.stringify(data.submission),
        );
      } catch {
        /* sessionStorage unavailable — results page will fetch from the API */
      }

      setStep(STEPS.length); // mark complete
      router.push(`/report/${data.id}`);
    } catch {
      stopProgress();
      setLoading(false);
      setGeneralError(
        "We couldn't reach the server. Check your connection and try again.",
      );
    }
  }

  return (
    <div className="relative">
      <form onSubmit={onSubmit} className="card p-6 sm:p-7" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="url" className="field-label">
              Company website
            </label>
            <input
              id="url"
              name="url"
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="yourcompany.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              aria-invalid={Boolean(errors.url)}
              className={`field-input ${errors.url ? "field-input-error" : ""}`}
            />
            {errors.url && <FieldError>{errors.url}</FieldError>}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="email" className="field-label">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@yourcompany.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              aria-invalid={Boolean(errors.email)}
              className={`field-input ${errors.email ? "field-input-error" : ""}`}
            />
            {errors.email && <FieldError>{errors.email}</FieldError>}
          </div>
        </div>

        {generalError && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {generalError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-accent mt-6 w-full text-[15px]"
        >
          {loading ? "Generating your report…" : "Generate my Buyer Signal Map"}
        </button>

        <p className="mt-3 text-center text-xs text-ink-600">
          Free. Takes under a minute. No sales pitch — just signal.
        </p>
      </form>

      {loading && <ProgressOverlay step={step} />}
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-sm text-red-600">{children}</p>;
}

function ProgressOverlay({ step }: { step: number }) {
  const pct = Math.min(100, Math.round(((step + 0.5) / STEPS.length) * 100));
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-paper/80 backdrop-blur-sm">
      <div className="card w-[min(92%,26rem)] p-6">
        <div className="relative mb-4 h-1.5 overflow-hidden rounded-full bg-paper-line">
          <div
            className="h-full rounded-full bg-signal transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <ul className="space-y-2.5">
          {STEPS.map((label, i) => {
            const state =
              i < step ? "done" : i === step ? "active" : "pending";
            return (
              <li key={label} className="flex items-center gap-3 text-sm">
                <StepDot state={state} />
                <span
                  className={
                    state === "pending"
                      ? "text-ink-600/60"
                      : state === "active"
                        ? "font-medium text-ink"
                        : "text-ink-700"
                  }
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function StepDot({ state }: { state: "done" | "active" | "pending" }) {
  if (state === "done") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-white">
        <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4l2.3 2.3 6.3-6.3a1 1 0 011.4 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="relative flex h-5 w-5 items-center justify-center">
        <span className="absolute h-5 w-5 animate-ping rounded-full bg-signal/30" />
        <span className="h-2.5 w-2.5 rounded-full bg-signal" />
      </span>
    );
  }
  return <span className="h-5 w-5 rounded-full border-2 border-paper-line" />;
}
