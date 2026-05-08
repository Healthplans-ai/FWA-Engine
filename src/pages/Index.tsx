import EngineVisualization from "@/components/EngineVisualization";
import { Link } from "react-router-dom";
import { ArrowRight, Database, Layers, GitBranch, Brain, Network, CheckCircle2 } from "lucide-react";

const STAGES = [
  { num: "01", title: "Original Claim DB",       icon: Database,     body: "EDI 837, prior auth & EOB stream in as a continuous batch — one ingestion surface." },
  { num: "02", title: "Schema Creation Layer",   icon: Layers,       body: "Normalizes payload into a canonical fraud-feature schema: hashes, NPIs, modifiers, geo, velocity." },
  { num: "03", title: "Parallel Agent Tree",     icon: GitBranch,    body: "Specialized agents branch out — one per fraud typology — each running independently in parallel." },
  { num: "04", title: "Independent Verdicts",    icon: Brain,        body: "Every agent emits a risk score, evidence and SHAP attribution for its single fraud type." },
  { num: "05", title: "Convergence Layer",       icon: Network,      body: "Verdicts re-converge into the master decision unit — weighted, deduped, conflict-resolved." },
  { num: "06", title: "One Unified Output",      icon: CheckCircle2, body: "AUTO-BLOCK · PEND for SIU · APPROVE — one decision with the full agent panel attached." },
];

const Index = () => {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-hp-bg text-hp-text">
      {/* ============================================================
          NAV — taxonomy is the primary CTA
         ============================================================ */}
      <nav className="sticky top-0 z-40 bg-hp-light/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5 md:px-10">
          <Link to="/" className="flex items-center">
            <img src="/healthplans-logo.png" alt="healthplans.ai" className="h-6 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-10 text-base font-normal text-hp-text">
            <a href="#engine" className="hover:text-hp-deep transition-colors">The Engine</a>
            <a href="#pipeline" className="hover:text-hp-deep transition-colors">Pipeline</a>
            <Link to="/taxonomy" className="hover:text-hp-deep transition-colors">FWA Taxonomy</Link>
          </div>
          <Link to="/taxonomy" className="hidden md:inline-flex btn-primary !py-2 !px-6 !min-h-0 text-sm">
            Explore Taxonomy
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* ============================================================
          HERO — sky blue, FWA-focused, engine viz is the centerpiece
         ============================================================ */}
      <header className="bg-hp-sky relative overflow-hidden">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 pt-16 md:pt-24 pb-12 md:pb-16">
          <div className="hp-eyebrow">FWA Shield Engine · Live</div>
          <h1 className="mt-3 text-5xl md:text-7xl lg:text-[88px] font-extrabold tracking-tight text-hp-text leading-[1.02] max-w-5xl">
            One claim in. <br />
            Every fraud agent <br />
            <span className="hp-underline">in parallel.</span> <span className="text-hp-text/85">One verdict out.</span>
          </h1>
          <p className="mt-8 text-xl md:text-2xl text-hp-text/80 leading-snug max-w-2xl">
            A live visualization of the master fraud engine — a tree of specialized
            agents branching from a single schema layer, each hunting one fraud
            type, all converging into a single decision.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link to="/taxonomy" className="btn-primary">
              Explore FWA Taxonomy
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#engine" className="btn-secondary">Watch the engine</a>
          </div>
        </div>
      </header>

      {/* ============================================================
          ENGINE — the hero centerpiece, large, borderless
         ============================================================ */}
      <section id="engine" className="bg-hp-bg">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 pt-16 md:pt-20 pb-20 md:pb-28">
          <div className="max-w-3xl px-2 md:px-2 mb-10 md:mb-14">
            <div className="hp-eyebrow">The Engine</div>
            <h2 className="mt-3 text-4xl md:text-6xl font-extrabold tracking-tight text-hp-text leading-[1.05]">
              Watch a single claim travel <br className="hidden md:block" />
              <span className="hp-underline">through the Shield.</span>
            </h2>
            <p className="mt-5 text-lg text-hp-text/75 max-w-2xl leading-relaxed">
              From ingestion through the schema layer, fanned out across every
              specialized agent, and converged into one master verdict — with full
              SHAP evidence attached.
            </p>
          </div>
          {/* Borderless engine viz — sits directly on the page */}
          <div className="animate-fade-in">
            <EngineVisualization />
          </div>
        </div>
      </section>

      {/* ============================================================
          SIX-STAGE PIPELINE — pale blue
         ============================================================ */}
      <section id="pipeline" className="bg-hp-light">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="hp-eyebrow">How it works</div>
            <h2 className="mt-3 text-4xl md:text-6xl font-extrabold tracking-tight text-hp-text leading-[1.05]">
              Six stages. <br />
              <span className="hp-underline">One auditable verdict.</span>
            </h2>
            <p className="mt-5 text-lg text-hp-text/75 max-w-2xl leading-relaxed">
              Every claim flows through the same six-stage pipeline — from raw EDI
              to a single decision, with every agent's evidence attached.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {STAGES.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.num}
                  style={{ animationDelay: `${i * 80}ms` }}
                  className="group relative rounded-3xl bg-hp-bg p-8 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 animate-fade-in"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hp-light group-hover:bg-hp-sky transition-colors">
                      <Icon className="h-5 w-5 text-hp-text" strokeWidth={1.7} />
                    </div>
                    <div className="text-base font-bold text-hp-text/40">{c.num}</div>
                  </div>
                  <div className="mt-6 text-2xl font-extrabold text-hp-text tracking-tight">
                    {c.title}
                  </div>
                  <p className="mt-3 text-base text-hp-text/75 leading-relaxed">{c.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          TAXONOMY CTA — sky blue, primary action
         ============================================================ */}
      <section className="bg-hp-sky">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-20 md:py-28 grid md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 items-center">
          <div>
            <div className="hp-eyebrow">FWA Taxonomy</div>
            <h2 className="mt-3 text-4xl md:text-6xl font-extrabold tracking-tight text-hp-text leading-[1.04]">
              Every typology, <br />
              <span className="hp-underline">mapped end-to-end.</span>
            </h2>
            <p className="mt-6 text-lg text-hp-text/85 leading-relaxed max-w-xl">
              20 categories. 3 macro layers. Drill into the claims layer for a
              live deep-dive on duplicate-submission detection — exactly how the
              engine catches cross-payer fraud in real time.
            </p>
          </div>
          <div className="flex md:justify-end">
            <Link to="/taxonomy" className="btn-primary !text-base !px-10 !py-4">
              Open the Taxonomy
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER
         ============================================================ */}
      <footer className="bg-hp-sky border-t border-hp-text/10">
        <div className="mx-auto max-w-[1280px] px-6 md:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-base text-hp-text">
          <div className="flex items-center gap-3">
            <img src="/healthplans-logo.png" alt="healthplans.ai" className="h-5 w-auto" />
            <span className="text-hp-text/70">· FWA Shield Engine</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/taxonomy" className="hover:text-hp-deep transition-colors">FWA Taxonomy</Link>
            <a href="https://www.linkedin.com/company/healthplans-ai" className="hover:text-hp-deep transition-colors" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
