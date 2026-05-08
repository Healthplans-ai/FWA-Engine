import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Users,
  FileText,
  Wallet,
  Layers,
  Copy,
  Ghost,
  Package,
  ClipboardEdit,
  IdCard,
  TrendingUp,
  X,
  Database,
  Hash,
  Shield,
  Brain,
  Network,
  CheckCircle2,
} from "lucide-react";

type LayerKey = "enrollment" | "provider" | "claims" | "payment";

const LAYERS: {
  key: LayerKey;
  title: string;
  subtitle: string;
  count: string;
  icon: any;
  items: string[];
}[] = [
  {
    key: "enrollment",
    title: "Enrollment",
    subtitle: "Identity, eligibility & onboarding fraud",
    count: "7 categories",
    icon: Users,
    items: [
      "Organized Fraud Rings",
      "False Enrollment / Risky Affiliations",
      "Application Fraud",
      "Eligibility Fraud",
      "Beneficiary Fraud",
      "Patient Collusion / ID Sharing",
      "Phishing & Impersonation Scams",
    ],
  },
  {
    key: "provider",
    title: "Provider",
    subtitle: "Credentialing, contracting & identity fraud",
    count: "4 categories",
    icon: Layers,
    items: [
      "Provider Identity Theft / NPI Misuse",
      "Credentialing Fraud",
      "Shell or Phantom Provider Entities",
      "Sanctioned / Excluded Provider Concealment",
    ],
  },
  {
    key: "claims",
    title: "Claims",
    subtitle: "Submission, coding & documentation fraud",
    count: "6 typologies",
    icon: FileText,
    items: [],
  },
  {
    key: "payment",
    title: "Payment",
    subtitle: "Post-adjudication & financial fraud",
    count: "3 categories",
    icon: Wallet,
    items: [
      "Kickbacks & Self-Referrals",
      "Prescription Drug Diversion",
      "Improper Payments (Non-Fraud)",
    ],
  },
];

const TYPOLOGIES = [
  { key: "upcoding",      title: "Upcoding",            tag: "CPT/E&M Level Inflation",   badge: "#1 VOLUME",   icon: TrendingUp,
    body: "Billing higher-complexity codes than the service justifies. CMS peer CBRs detect outliers at 2+ std deviations." },
  { key: "phantom",       title: "Phantom Billing",     tag: "Services Never Rendered",    badge: "$6B+ 2024",  icon: Ghost,
    body: "Claims for appointments, procedures or DME that never occurred. Geo-time mismatch is the key signal." },
  { key: "unbundling",    title: "Unbundling",          tag: "Panel Code Fragmentation",   badge: "NCCI EDITS", icon: Package,
    body: "Bundled services split into components to inflate reimbursement. NCCI edit violations." },
  { key: "falsification", title: "Service Falsification", tag: "Documentation Manipulation", badge: "EHR TRAILS", icon: ClipboardEdit,
    body: "Altering dates, diagnoses or codes post-visit. EHR audit trail reveals retroactive edits & copy-paste." },
  { key: "duplicate",     title: "Duplicate Submission", tag: "Cross-Payer Billing",        badge: "DEDUP HASH", icon: Copy,
    body: "Same claim submitted to multiple payers or multiple times. Coordination-of-benefits + claim hashing catch this." },
  { key: "identity",      title: "Identity Billing",     tag: "NPI / Beneficiary Misuse",   badge: "ID MISMATCH", icon: IdCard,
    body: "Stolen Medicare/Medicaid IDs to submit claims. Geographic proximity scoring is a key feature." },
];

const FLOW = [
  { n: 1, title: "Original Submission", body: "Provider files claim via EDI 837 — the legitimate or fabricated baseline event." },
  { n: 2, title: "Resubmit Same Payer", body: "Identical claim sent again — same NPI, member, DOS, CPT, charge." },
  { n: 3, title: "Cross-Payer Filing", body: "Claim simultaneously billed to Medicare + commercial + Medicaid." },
  { n: 4, title: "Cosmetic Edit Variant", body: "Modifier swap (-25/-59), date shift ±1 day, or unit count change." },
  { n: 5, title: "Adjudication Window", body: "Claim adjudicated before earlier copy posts — race condition exploited." },
  { n: 6, title: "Payment Multiplied", body: "Provider receives 2-3× reimbursement before reconciliation catches it." },
];

const SIGNALS: [string, string][] = [
  ["Hash collision", "NPI+Member+DOS+CPT+Charge match"],
  ["Multi-payer ping", "Same claim seen in 2+ payer streams"],
  ["Modifier flip", "Same line resubmitted with -59 added"],
  ["Velocity spike", "≥3 resubmissions of same line in 24h"],
  ["Date shift ±1d", "Service date moved to evade dedup"],
  ["EOB before ERA", "Provider re-bills before remittance posts"],
];

const APPROACH = [
  { icon: Database, title: "Data Ingestion", body: "EDI 837 streams · COB clearinghouse files · ERA/EOB feeds · cross-payer LDS" },
  { icon: Hash, title: "Claim Fingerprint Hashing", body: "SHA-256 over NPI · Member · DOS · CPT · Modifier · Units · Charge" },
  { icon: Shield, title: "Exact-Match Rule Engine", body: "NCCI/CMS dedup edits + hash lookup — block obvious duplicates pre-adjudication" },
  { icon: Brain, title: "ML Near-Duplicate Detector", body: "XGBoost + Siamese net — fuzzy match on date shifts, modifier swaps, unit perturbations" },
  { icon: Network, title: "Cross-Payer COB Reconciliation", body: "Match fingerprints against partner payer hashes — flag multi-payer billing" },
  { icon: CheckCircle2, title: "Decision + SHAP Explanation", body: "AUTO-BLOCK · PEND for SIU · APPROVE — every decision shipped with attribution" },
];

const Taxonomy = () => {
  const [activeLayer, setActiveLayer] = useState<LayerKey | null>("claims");
  const [activeTypology, setActiveTypology] = useState<string | null>(null);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-hp-bg text-hp-text">
      {/* ===== Sticky nav ===== */}
      <nav className="sticky top-0 z-40 bg-hp-light/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5 md:px-10">
          <Link to="/" className="flex items-center">
            <img src="/healthplans-logo.png" alt="healthplans.ai" className="h-6 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-10 text-base font-normal text-hp-text">
            <Link to="/#engine" className="hover:text-hp-deep transition-colors">The Engine</Link>
            <Link to="/#pipeline" className="hover:text-hp-deep transition-colors">Pipeline</Link>
            <Link to="/taxonomy" className="underline underline-offset-[6px] decoration-1">FWA Taxonomy</Link>
          </div>
          <Link to="/" className="hidden md:inline-flex btn-secondary !py-2 !px-5 !min-h-0 text-sm">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Engine
          </Link>
        </div>
      </nav>

      {/* ===== Sky blue hero ===== */}
      <header className="bg-hp-sky">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-16 md:py-24">
          <div className="hp-eyebrow">FWA Taxonomy</div>
          <h1 className="mt-3 text-5xl md:text-7xl lg:text-[88px] font-extrabold leading-[1.02] tracking-tight text-hp-text max-w-5xl">
            The complete <br />
            <span className="hp-underline">FWA taxonomy.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-xl md:text-2xl text-hp-text/85 leading-snug">
            20 categories · 4 macro layers · click to drill in.
          </p>
          <p className="mt-4 max-w-2xl text-lg text-hp-text/75 leading-relaxed">
            Explore every typology the engine covers, then drill into the
            claims layer to see exactly how the duplicate-submission agent
            catches cross-payer fraud in real time.
          </p>
        </div>
      </header>

      {/* ===== Four layers — LIGHT BLUE bg, no dark frame ===== */}
      <section className="bg-hp-light">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-20 md:py-28">
          <div className="max-w-3xl mb-12 md:mb-16">
            <div className="hp-eyebrow">Four macro layers</div>
            <h2 className="mt-3 text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight text-hp-text">
              Healthcare FWA, <br />
              <span className="hp-underline">mapped end-to-end.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-5 md:gap-6">
            {LAYERS.map((L, i) => {
              const Icon = L.icon;
              const isActive = activeLayer === L.key;
              const isClaims = L.key === "claims";
              return (
                <button
                  key={L.key}
                  onClick={() => {
                    setActiveLayer(isActive ? null : L.key);
                    setActiveTypology(null);
                  }}
                  style={{ animationDelay: `${i * 100}ms` }}
                  className={`group relative text-left rounded-3xl p-8 md:p-10 transition-all duration-500 animate-fade-in overflow-hidden
                    ${isClaims
                      ? "bg-hp-text text-hp-bg hover:-translate-y-1 hover:shadow-2xl"
                      : "bg-hp-bg hover:-translate-y-1 hover:shadow-xl"}
                    ${isActive ? "ring-2 ring-hp-text" : ""}
                  `}
                >
                  {/* Active highlight bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`}
                       style={{ background: "hsl(var(--hp-mint))" }} />

                  <div className="flex items-start justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors
                      ${isClaims ? "bg-hp-bg/10 group-hover:bg-hp-bg/15" : "bg-hp-light group-hover:bg-hp-sky"}`}>
                      <Icon className={`h-6 w-6 ${isClaims ? "text-hp-bg" : "text-hp-text"}`} strokeWidth={1.6} />
                    </div>
                    <ChevronRight
                      className={`h-5 w-5 transition-all
                        ${isClaims ? "text-hp-bg/60" : "text-hp-text/40"}
                        ${isActive ? "rotate-90" : "group-hover:translate-x-1"}`}
                    />
                  </div>

                  <div className={`mt-8 text-sm font-bold tracking-tight ${isClaims ? "text-hp-bg/60" : "text-hp-text/50"}`}>
                    Layer {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className={`mt-1 text-3xl md:text-4xl font-extrabold tracking-tight ${isClaims ? "text-hp-bg" : "text-hp-text"}`}>
                    {L.title}
                  </div>
                  <div className={`mt-3 text-base leading-relaxed ${isClaims ? "text-hp-bg/75" : "text-hp-text/70"}`}>
                    {L.subtitle}
                  </div>
                  <div className={`mt-8 inline-flex items-center gap-2 text-sm font-medium ${isClaims ? "text-hp-bg" : "text-hp-text"}`}>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isClaims ? "bg-hp-bg/15 text-hp-bg" : "bg-hp-light text-hp-text"}`}>
                      {L.count}
                    </span>
                    {isClaims && (
                      <span className="hp-underline text-sm font-bold">
                        Click to deep-dive →
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Layer expand (non-claims) ===== */}
      {activeLayer && activeLayer !== "claims" && (
        <section className="bg-hp-bg animate-fade-in">
          <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-16 md:py-20">
            <div className="hp-eyebrow">{LAYERS.find((l) => l.key === activeLayer)?.title} Layer · categories</div>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {LAYERS.find((l) => l.key === activeLayer)?.items.map((it, i) => (
                <div
                  key={it}
                  style={{ animationDelay: `${i * 70}ms` }}
                  className="rounded-2xl bg-hp-light px-6 py-5 text-base text-hp-text hover:-translate-y-0.5 hover:shadow-md transition-all animate-fade-in"
                >
                  <span className="text-hp-text/40 font-mono mr-3">{String(i + 1).padStart(2, "0")}</span>
                  {it}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Claims deep-dive — 6 typologies, redesigned ===== */}
      {activeLayer === "claims" && (
        <section className="bg-hp-bg animate-fade-in">
          <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-20 md:py-28">
            <div className="max-w-3xl mb-12 md:mb-16">
              <div className="hp-eyebrow">Claims layer · 6 core typologies</div>
              <h2 className="mt-3 text-4xl md:text-5xl font-extrabold leading-[1.05] tracking-tight text-hp-text">
                Where the engine <br />
                <span className="hp-underline">spends most of its time.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {TYPOLOGIES.map((t, i) => {
                const Icon = t.icon;
                const highlight = t.key === "duplicate";
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTypology(t.key)}
                    style={{ animationDelay: `${i * 80}ms` }}
                    className={`group relative text-left rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300 animate-fade-in overflow-hidden
                      ${highlight
                        ? "bg-hp-sky hover:shadow-2xl"
                        : "bg-hp-light hover:shadow-xl hover:bg-hp-sky/40"}
                    `}
                  >
                    {/* Mint underline accent on hover */}
                    <div className="absolute top-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
                         style={{ background: "hsl(var(--hp-mint))" }} />

                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hp-bg group-hover:bg-white transition-colors shadow-sm">
                        <Icon className="h-5 w-5 text-hp-text" strokeWidth={1.7} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-hp-bg text-hp-text/70">
                        {t.badge}
                      </span>
                    </div>

                    <div className="mt-6 text-2xl md:text-3xl font-extrabold text-hp-text tracking-tight">
                      {t.title}
                    </div>
                    <div className="text-sm text-hp-text/60 mt-1">{t.tag}</div>
                    <p className="mt-4 text-base text-hp-text/75 leading-relaxed">{t.body}</p>
                    {highlight ? (
                      <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-hp-text">
                        <span className="hp-underline">Open flow & approach</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-hp-text/50 group-hover:text-hp-text transition-colors">
                        Learn more
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== Modal — duplicate submission deep-dive ===== */}
      {activeTypology === "duplicate" && (
        <div
          className="fixed inset-0 z-50 bg-hp-text/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveTypology(null)}
        >
          <div
            className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl bg-hp-bg shadow-[0_30px_120px_-20px_rgba(0,0,0,0.45)] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveTypology(null)}
              className="absolute right-5 top-5 z-10 rounded-full p-2 bg-hp-light hover:bg-hp-sky transition-colors text-hp-text"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8 md:p-14">
              <div className="hp-eyebrow">Approach · Duplicate Submission</div>
              <h2 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight text-hp-text leading-[1.05]">
                How the fraud flows <br />
                <span className="hp-underline">& how we catch it.</span>
              </h2>

              {/* FLOW */}
              <div className="mt-12">
                <div className="hp-eyebrow text-sm">① Fraud flow · 6 steps</div>
                <div className="mt-5 grid md:grid-cols-6 gap-3">
                  {FLOW.map((f, i) => (
                    <div
                      key={f.n}
                      style={{ animationDelay: `${i * 100}ms` }}
                      className="relative rounded-2xl bg-hp-light p-5 hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                    >
                      <div className="h-8 w-8 rounded-full bg-hp-text text-hp-sky text-xs font-bold flex items-center justify-center">
                        {f.n}
                      </div>
                      <div className="mt-4 text-sm font-bold text-hp-text">{f.title}</div>
                      <p className="mt-2 text-xs text-hp-text/70 leading-relaxed">{f.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIGNALS */}
              <div className="mt-12">
                <div className="hp-eyebrow text-sm">② Red-flag signals we watch</div>
                <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SIGNALS.map(([t, b], i) => (
                    <div
                      key={t}
                      style={{ animationDelay: `${i * 80}ms` }}
                      className="rounded-2xl bg-hp-sky/40 p-5 hover:bg-hp-sky transition-colors animate-fade-in"
                    >
                      <div className="text-base font-bold text-hp-text">{t}</div>
                      <div className="text-sm text-hp-text/70 mt-1">{b}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* APPROACH PIPELINE */}
              <div className="mt-12">
                <div className="hp-eyebrow text-sm">③ Detection & prevention pipeline</div>
                <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {APPROACH.map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <div
                        key={a.title}
                        style={{ animationDelay: `${i * 100}ms` }}
                        className="relative rounded-2xl bg-hp-light p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300 animate-fade-in"
                      >
                        <div className="absolute top-4 right-4 text-xs font-bold text-hp-text/40">0{i + 1}</div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-hp-bg">
                          <Icon className="h-5 w-5 text-hp-text" strokeWidth={1.7} />
                        </div>
                        <div className="mt-4 text-lg font-extrabold text-hp-text">{a.title}</div>
                        <p className="mt-2 text-sm text-hp-text/75 leading-relaxed">{a.body}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* IMPACT */}
              <div className="mt-12 grid sm:grid-cols-3 gap-4">
                {[
                  ["98.7%", "Exact-dup recall"],
                  ["<2s", "API latency P95"],
                  ["−42%", "FP vs rules-only"],
                ].map(([n, l]) => (
                  <div key={l} className="rounded-3xl bg-hp-sky p-8 text-center hover:-translate-y-1 transition-transform">
                    <div className="text-5xl md:text-6xl font-extrabold text-hp-text">{n}</div>
                    <div className="mt-2 text-base font-medium text-hp-text/75">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Closing CTA ===== */}
      <section className="bg-hp-sky">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-20 md:py-24 grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 items-center">
          <div>
            <div className="hp-eyebrow">See it run</div>
            <h2 className="mt-3 text-4xl md:text-6xl font-extrabold leading-[1.04] tracking-tight text-hp-text">
              See the engine <br />
              <span className="hp-underline">in motion.</span>
            </h2>
            <p className="mt-6 text-lg text-hp-text/85 leading-relaxed max-w-xl">
              Every typology in this taxonomy maps to one parallel agent in the
              FWA Shield Engine. Watch them all run on a live claim.
            </p>
          </div>
          <div className="flex md:justify-end">
            <Link to="/" className="btn-primary !text-base !px-10 !py-4">
              <ArrowLeft className="h-5 w-5" />
              Back to the engine
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-hp-sky border-t border-hp-text/10">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-base text-hp-text">
          <div className="flex items-center gap-3">
            <img src="/healthplans-logo.png" alt="healthplans.ai" className="h-5 w-auto" />
            <span className="text-hp-text/70">· FWA Taxonomy</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-hp-deep transition-colors">The Engine</Link>
            <a href="https://www.linkedin.com/company/healthplans-ai" className="hover:text-hp-deep transition-colors" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Taxonomy;
