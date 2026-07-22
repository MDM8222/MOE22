import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LeadForm } from "@/components/LeadForm";
import { SignalMark } from "@/components/Logo";
import { brand } from "@/lib/brand";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <SignalTypes />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-signal/[0.06] blur-3xl" />
      </div>
      <div className="container-page grid gap-12 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div className="animate-fade-up">
          <p className="eyebrow">{brand.productName}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl">
            See where your future customers are showing{" "}
            <span className="text-signal">buying signals</span> — right now.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-700">
            Enter your website and we&apos;ll analyze your business, infer your
            ideal customer profile, and map 5–8 environments where your prospects
            are actively revealing intent — plus exactly what {brand.name} would
            do with each one.
          </p>

          <ul className="mt-7 space-y-2.5">
            {[
              "Personalized to your offer, ICP, and industries",
              "Grounded in how buyers actually reveal intent",
              "A concrete outbound play for every signal",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-ink-700">
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm text-ink-600">
            Built by {brand.name} — {brand.tagline}
          </p>
        </div>

        <div className="animate-fade-up lg:pl-4">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: "We read your website",
      body: "We fetch and analyze your site to understand what you sell and who you sell it to.",
    },
    {
      title: "We infer your ICP",
      body: "Category, target audience, industries, business model, and the buyer roles that matter.",
    },
    {
      title: "We map buyer signals",
      body: "5–8 places your ideal prospects are revealing intent — with a play for each.",
    },
  ];
  return (
    <section className="border-y border-paper-line bg-paper-soft/50">
      <div className="container-page py-16">
        <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
          From a URL to an outbound thesis in under a minute
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="card p-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal/10 text-sm font-semibold text-signal">
                {i + 1}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-700">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SignalTypes() {
  const types = [
    ["Timing triggers", "Funding, leadership changes, expansion, renewals."],
    ["Buying research", "Comparison behavior, shortlists, and RFP activity."],
    ["Category awareness", "Prospects describing the problem you solve."],
    ["Ecosystem adjacency", "Partners, integrations, and adjacent-tool users."],
    ["Hiring & growth", "Job posts that imply the need for what you offer."],
    ["Community conversation", "Where your ICP gathers and speaks candidly."],
  ];
  return (
    <section className="container-page py-16">
      <div className="flex items-center gap-3">
        <SignalMark className="h-6 w-6 text-signal" />
        <h2 className="text-2xl font-semibold text-ink sm:text-3xl">
          The signals we look for
        </h2>
      </div>
      <p className="mt-3 max-w-2xl text-ink-700">
        Your report is tailored to your business — these are the kinds of
        present-tense buying signals we map into a coordinated outbound motion.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {types.map(([title, body]) => (
          <div
            key={title}
            className="rounded-xl border border-paper-line bg-white p-5"
          >
            <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="container-page">
      <div className="overflow-hidden rounded-3xl bg-ink px-6 py-12 text-paper sm:px-12">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Pipeline without building an SDR team.
          </h2>
          <p className="mt-3 text-paper/75">
            {brand.name} runs AI-augmented, ICP-precise outbound so your team
            talks to buyers while the window is open. Start with your free Buyer
            Signal Map above — or talk to us directly.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={brand.bookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent"
            >
              Book a strategy call
            </a>
            <a
              href={brand.auditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost !border-paper/20 !bg-transparent !text-paper hover:!bg-white/10"
            >
              Request a full outbound audit
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald/10 text-emerald">
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
