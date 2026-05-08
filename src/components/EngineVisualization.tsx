import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileCode2,
  Fingerprint,
  Layers,
  Pill,
  Repeat,
  ShieldAlert,
  Stethoscope,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

type AgentVerdict = "clean" | "suspect" | "block";

interface Agent {
  id: string;
  name: string;
  short: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
  // resolved verdict for THIS run (cycled per run)
  verdicts: AgentVerdict[];
}

const AGENTS: Agent[] = [
  { id: "upcode", name: "Upcoding Agent", short: "CPT/E&M inflation", desc: "Peer CBR z-score > 2σ", Icon: TrendingUp, verdicts: ["suspect", "clean", "block", "clean"] },
  { id: "phantom", name: "Phantom Billing Agent", short: "Services never rendered", desc: "Geo-time mismatch", Icon: ShieldAlert, verdicts: ["clean", "block", "clean", "suspect"] },
  { id: "unbundle", name: "Unbundling Agent", short: "NCCI edit violations", desc: "Panel fragmentation", Icon: Layers, verdicts: ["clean", "suspect", "clean", "clean"] },
  { id: "dup", name: "Duplicate Submission", short: "Cross-payer dedup", desc: "Hash + Siamese match", Icon: Repeat, verdicts: ["block", "suspect", "clean", "block"] },
  { id: "falsify", name: "Service Falsification", short: "EHR audit trail", desc: "Retro edits detected", Icon: FileCode2, verdicts: ["clean", "clean", "suspect", "clean"] },
  { id: "identity", name: "Identity Billing", short: "NPI / member misuse", desc: "Geo-proximity score", Icon: Fingerprint, verdicts: ["suspect", "clean", "clean", "suspect"] },
  { id: "kickback", name: "Kickbacks Agent", short: "Self-referral graph", desc: "Affiliation graph anomaly", Icon: Users, verdicts: ["clean", "clean", "suspect", "clean"] },
  { id: "dme", name: "DME Fraud Agent", short: "Equipment billing", desc: "Unit/freq outliers", Icon: Pill, verdicts: ["clean", "suspect", "block", "clean"] },
];

type Phase = { key: string; label: string; at: number };
const PHASES: Phase[] = [
  { key: "idle", label: "Awaiting claim", at: 0 },
  { key: "input", label: "Claim received", at: 600 },
  { key: "schema", label: "Schema layer · normalizing", at: 1700 },
  { key: "branch", label: "Branching to agents", at: 2900 },
  { key: "agents", label: "Agents executing in parallel", at: 3900 },
  { key: "converge", label: "Converging verdicts", at: 6400 },
  { key: "output", label: "Unified decision emitted", at: 7600 },
];
const CYCLE_MS = 9200;

const VB = { w: 1200, h: 720 };
const INPUT = { x: 70, y: 360 };
const SCHEMA = { x: 290, y: 360 };
const CONVERGE = { x: 920, y: 360 };
const OUTPUT = { x: 1130, y: 360 };

function agentY(i: number, n: number) {
  const top = 60;
  const bottom = VB.h - 60;
  return top + ((bottom - top) / (n - 1)) * i;
}
const AGENT_X = 640;

const verdictColor: Record<AgentVerdict, string> = {
  clean: "hsl(var(--success))",
  suspect: "hsl(var(--warning))",
  block: "hsl(var(--destructive))",
};
const verdictLabel: Record<AgentVerdict, string> = {
  clean: "CLEAN",
  suspect: "SUSPECT",
  block: "BLOCK",
};

function curve(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

const EngineVisualization = () => {
  const [t, setT] = useState(0);
  const [runIndex, setRunIndex] = useState(0);
  const startRef = useRef<number>(performance.now());

  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      const elapsed = (now - startRef.current) % CYCLE_MS;
      setT(elapsed);
      if (elapsed < 50 && now - startRef.current > CYCLE_MS) {
        setRunIndex((r) => r + 1);
        startRef.current = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const phase = useMemo(() => {
    let p = PHASES[0];
    for (const ph of PHASES) if (t >= ph.at) p = ph;
    return p.key;
  }, [t]);

  const phaseLabel = PHASES.find((p) => p.key === phase)?.label ?? "";

  const branchActive = t >= 2900;
  const agentsActive = t >= 3900;
  const convergeActive = t >= 6400;
  const outputActive = t >= 7600;

  // packet on input->schema
  const inputPacket = t >= 600 && t < 1900;
  const inputProgress = Math.min(1, Math.max(0, (t - 600) / 1100));

  // packets schema->agent (branching) staggered
  const branchProgress = (i: number) => {
    const start = 2900 + i * 60;
    const dur = 900;
    return Math.min(1, Math.max(0, (t - start) / dur));
  };

  // packets agent->converge staggered
  const convergeProgress = (i: number) => {
    const start = 5400 + i * 70;
    const dur = 900;
    return Math.min(1, Math.max(0, (t - start) / dur));
  };

  const outputProgress = Math.min(1, Math.max(0, (t - 7600) / 800));

  // agent verdict for this run cycle
  const agentVerdict = (a: Agent): AgentVerdict =>
    a.verdicts[runIndex % a.verdicts.length];

  // master verdict: worst of agents
  const masterVerdict: AgentVerdict = useMemo(() => {
    const vs = AGENTS.map(agentVerdict);
    if (vs.includes("block")) return "block";
    if (vs.includes("suspect")) return "suspect";
    return "clean";
  }, [runIndex]);

  return (
    <div className="w-full">
      {/* Status bar — borderless, sits inline with the page */}
      <div className="flex items-center justify-between px-2 md:px-4 py-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-hp-deep opacity-75 pulse-ring" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-hp-deep" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-hp-deep">
            Live · Run #{runIndex + 1}
          </span>
          <span className="text-sm text-hp-text font-medium">{phaseLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-hp-deep" />
          <span>P95 &lt; 2s · 8 agents</span>
        </div>
      </div>

      <div className="relative w-full" style={{ aspectRatio: `${VB.w} / ${VB.h}` }}>
        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="grad-flow" x1="0" x2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
            </linearGradient>
            <radialGradient id="grad-node">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </radialGradient>
            <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* === PATHS === */}
          {/* input -> schema */}
          <path
            d={curve(INPUT.x + 30, INPUT.y, SCHEMA.x - 60, SCHEMA.y)}
            stroke="hsl(var(--primary))"
            strokeOpacity={t >= 600 ? 0.7 : 0.2}
            strokeWidth={3}
            fill="none"
            className={t >= 600 && t < 1900 ? "flow-dash" : ""}
          />

          {/* schema -> agents */}
          {AGENTS.map((a, i) => {
            const ay = agentY(i, AGENTS.length);
            const active = branchActive;
            return (
              <path
                key={`b-${a.id}`}
                d={curve(SCHEMA.x + 60, SCHEMA.y, AGENT_X - 100, ay)}
                stroke={active ? "hsl(var(--primary))" : "hsl(var(--border))"}
                strokeOpacity={active ? 0.55 : 0.35}
                strokeWidth={2.2}
                fill="none"
                className={branchActive && !agentsActive ? "flow-dash" : ""}
              />
            );
          })}

          {/* agents -> converge */}
          {AGENTS.map((a, i) => {
            const ay = agentY(i, AGENTS.length);
            const v = agentVerdict(a);
            const active = convergeActive;
            return (
              <path
                key={`c-${a.id}`}
                d={curve(AGENT_X + 100, ay, CONVERGE.x - 50, CONVERGE.y)}
                stroke={active ? verdictColor[v] : "hsl(var(--border))"}
                strokeOpacity={active ? 0.6 : 0.3}
                strokeWidth={2}
                fill="none"
                className={convergeActive && !outputActive ? "flow-dash" : ""}
              />
            );
          })}

          {/* converge -> output */}
          <path
            d={curve(CONVERGE.x + 50, CONVERGE.y, OUTPUT.x - 30, OUTPUT.y)}
            stroke={outputActive ? verdictColor[masterVerdict] : "hsl(var(--border))"}
            strokeWidth={3.5}
            strokeOpacity={outputActive ? 0.9 : 0.3}
            fill="none"
            className={outputActive ? "flow-dash" : ""}
          />

          {/* === PACKETS === */}
          {inputPacket && (() => {
            const x = INPUT.x + 30 + (SCHEMA.x - 60 - INPUT.x - 30) * inputProgress;
            const y = INPUT.y;
            return (
              <circle cx={x} cy={y} r={6} fill="hsl(var(--primary))" filter="url(#soft-glow)">
                <animate attributeName="r" values="5;8;5" dur="0.6s" repeatCount="indefinite" />
              </circle>
            );
          })()}

          {branchActive && !agentsActive && AGENTS.map((a, i) => {
            const p = branchProgress(i);
            if (p <= 0 || p >= 1) return null;
            const ay = agentY(i, AGENTS.length);
            const x1 = SCHEMA.x + 60, y1 = SCHEMA.y;
            const x2 = AGENT_X - 100, y2 = ay;
            const mx = (x1 + x2) / 2;
            // approximate cubic bezier point
            const bx = (1 - p) ** 3 * x1 + 3 * (1 - p) ** 2 * p * mx + 3 * (1 - p) * p ** 2 * mx + p ** 3 * x2;
            const by = (1 - p) ** 3 * y1 + 3 * (1 - p) ** 2 * p * y1 + 3 * (1 - p) * p ** 2 * y2 + p ** 3 * y2;
            return (
              <circle key={`pkt-b-${a.id}`} cx={bx} cy={by} r={4} fill="hsl(var(--primary))" filter="url(#soft-glow)" />
            );
          })}

          {convergeActive && AGENTS.map((a, i) => {
            const p = convergeProgress(i);
            if (p <= 0 || p >= 1) return null;
            const ay = agentY(i, AGENTS.length);
            const x1 = AGENT_X + 100, y1 = ay;
            const x2 = CONVERGE.x - 50, y2 = CONVERGE.y;
            const mx = (x1 + x2) / 2;
            const bx = (1 - p) ** 3 * x1 + 3 * (1 - p) ** 2 * p * mx + 3 * (1 - p) * p ** 2 * mx + p ** 3 * x2;
            const by = (1 - p) ** 3 * y1 + 3 * (1 - p) ** 2 * p * y1 + 3 * (1 - p) * p ** 2 * y2 + p ** 3 * y2;
            const v = agentVerdict(a);
            return (
              <circle key={`pkt-c-${a.id}`} cx={bx} cy={by} r={4.5} fill={verdictColor[v]} filter="url(#soft-glow)" />
            );
          })}

          {outputActive && outputProgress < 1 && (() => {
            const x = CONVERGE.x + 50 + (OUTPUT.x - 30 - CONVERGE.x - 50) * outputProgress;
            return (
              <circle cx={x} cy={OUTPUT.y} r={7} fill={verdictColor[masterVerdict]} filter="url(#soft-glow)" />
            );
          })()}
        </svg>

        {/* === HTML NODES (overlaid) === */}
        {/* Input */}
        <NodeBox
          x={INPUT.x}
          y={INPUT.y}
          label="Original Claim DB"
          sub="Batch claim stream"
          active={t >= 600}
          color="primary"
          icon={<Zap className="h-4 w-4" />}
        />

        {/* Schema layer */}
        <SchemaNode
          x={SCHEMA.x}
          y={SCHEMA.y}
          active={t >= 1700}
        />

        {/* Agents */}
        {AGENTS.map((a, i) => {
          const ay = agentY(i, AGENTS.length);
          const isLive = agentsActive && t < 6400;
          const verdict = agentVerdict(a);
          const showVerdict = t >= 5400;
          return (
            <AgentNode
              key={a.id}
              x={AGENT_X}
              y={ay}
              agent={a}
              live={isLive}
              verdict={showVerdict ? verdict : null}
            />
          );
        })}

        {/* Convergence */}
        <ConvergeNode x={CONVERGE.x} y={CONVERGE.y} active={convergeActive} />

        {/* Output */}
        <OutputNode
          x={OUTPUT.x}
          y={OUTPUT.y}
          active={outputActive}
          verdict={masterVerdict}
        />
      </div>

      {/* Agent panel results — floating below viz, no border */}
      <div className="px-2 md:px-4 pt-6 mt-2">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-hp-deep mb-4">
          Live agent panel · run #{runIndex + 1}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {AGENTS.map((a) => {
            const v = agentVerdict(a);
            const showVerdict = t >= 5400;
            return (
              <div
                key={a.id}
                className="flex items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <a.Icon className="h-4 w-4 text-hp-deep shrink-0" strokeWidth={1.7} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-hp-text truncate">{a.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{a.short}</div>
                  </div>
                </div>
                {showVerdict ? (
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-1 rounded-xl"
                    style={{
                      backgroundColor: `${verdictColor[v]}14`,
                      color: verdictColor[v],
                      border: `1px solid ${verdictColor[v]}40`,
                    }}
                  >
                    {verdictLabel[v]}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground animate-pulse">…</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ===== Sub components ===== */

interface NodeBoxProps {
  x: number;
  y: number;
  label: string;
  sub?: string;
  active: boolean;
  color: "primary" | "accent";
  icon?: React.ReactNode;
}
const NodeBox = ({ x, y, label, sub, active, icon }: NodeBoxProps) => (
  <div
    className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
    style={{
      left: `${(x / VB.w) * 100}%`,
      top: `${(y / VB.h) * 100}%`,
    }}
  >
    <div
      className={`relative flex flex-col items-center justify-center rounded-xl border px-4 py-3 min-w-[120px] transition-all ${
        active
          ? "border-hp-deep bg-hp-light agent-glow"
          : "border-border bg-white"
      }`}
    >
      {active && (
        <span className="absolute inset-0 rounded-xl border border-hp-deep/40 pulse-ring pointer-events-none" />
      )}
      <div className="flex items-center gap-1.5 text-hp-deep">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-[0.16em]">{label}</span>
      </div>
      {sub && <div className="text-[10px] text-muted-foreground mt-1">{sub}</div>}
    </div>
  </div>
);

const SchemaNode = ({ x, y, active }: { x: number; y: number; active: boolean }) => (
  <div
    className="absolute -translate-x-1/2 -translate-y-1/2"
    style={{ left: `${(x / VB.w) * 100}%`, top: `${(y / VB.h) * 100}%` }}
  >
    <div
      className={`relative rounded-xl border-2 px-5 py-4 transition-all duration-500 ${
        active
          ? "border-hp-deep bg-hp-light"
          : "border-border bg-white"
      }`}
      style={{
        boxShadow: active ? "0 0 30px hsl(var(--hp-deep) / 0.22)" : undefined,
      }}
    >
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-hp-deep" />
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-hp-deep">
          Schema Layer
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">Canonical features</div>
      <div className="mt-2 flex flex-wrap gap-1 max-w-[150px]">
        {["NPI", "DOS", "CPT", "Hash", "Geo", "Modifier"].map((f, i) => (
          <span
            key={f}
            className={`text-[9px] px-1.5 py-0.5 rounded-xl border font-bold transition-all ${
              active ? "border-hp-deep/40 bg-hp-bg text-hp-deep" : "border-border bg-white text-muted-foreground"
            }`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  </div>
);

interface AgentNodeProps {
  x: number;
  y: number;
  agent: Agent;
  live: boolean;
  verdict: AgentVerdict | null;
}
const AgentNode = ({ x, y, agent, live, verdict }: AgentNodeProps) => {
  const Icon = agent.Icon;
  const color = verdict ? verdictColor[verdict] : "hsl(var(--primary))";
  const active = live || !!verdict;
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${(x / VB.w) * 100}%`, top: `${(y / VB.h) * 100}%` }}
    >
      <div
        className={`relative flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition-all duration-300 ${
          active ? "bg-white" : "bg-white/80"
        }`}
        style={{
          borderColor: active ? color : "hsl(var(--border))",
          boxShadow: active ? `0 0 16px ${color}55` : undefined,
          minWidth: 170,
        }}
      >
        {live && (
          <span
            className="absolute inset-0 rounded-xl pointer-events-none pulse-ring"
            style={{ border: `1px solid ${color}` }}
          />
        )}
        <div
          className="flex h-7 w-7 items-center justify-center rounded-xl shrink-0"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-semibold leading-tight truncate">{agent.name}</div>
          <div className="text-[9px] text-muted-foreground truncate">{agent.desc}</div>
        </div>
        {verdict && (
          <span
            className="ml-auto text-[9px] font-bold px-1 py-0.5 rounded shrink-0"
            style={{ backgroundColor: `${color}33`, color }}
          >
            {verdictLabel[verdict][0]}
          </span>
        )}
      </div>
    </div>
  );
};

const ConvergeNode = ({ x, y, active }: { x: number; y: number; active: boolean }) => (
  <div
    className="absolute -translate-x-1/2 -translate-y-1/2"
    style={{ left: `${(x / VB.w) * 100}%`, top: `${(y / VB.h) * 100}%` }}
  >
    <div
      className={`relative flex h-28 w-28 items-center justify-center rounded-full border-2 transition-all duration-500 ${
        active ? "border-hp-deep bg-hp-light glow" : "border-border bg-white"
      }`}
    >
      {active && (
        <span className="absolute inset-0 rounded-full border-2 border-hp-deep/40 pulse-ring pointer-events-none" />
      )}
      <div className="text-center px-2">
        <Activity className="h-5 w-5 mx-auto text-hp-deep" />
        <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-hp-text mt-1 leading-tight">
          Master Fraud<br />Predictor<br />Dashboard
        </div>
      </div>
    </div>
  </div>
);

const OutputNode = ({
  x,
  y,
  active,
  verdict,
}: {
  x: number;
  y: number;
  active: boolean;
  verdict: AgentVerdict;
}) => {
  const color = verdictColor[verdict];
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${(x / VB.w) * 100}%`, top: `${(y / VB.h) * 100}%` }}
    >
      <div
        className="relative flex flex-col items-center rounded-xl border-2 px-4 py-3 transition-all duration-500"
        style={{
          borderColor: active ? color : "hsl(var(--border))",
          backgroundColor: active ? `${color}14` : "hsl(0 0% 100%)",
          boxShadow: active ? `0 0 24px ${color}40` : undefined,
          minWidth: 120,
        }}
      >
        {active && (
          <span
            className="absolute inset-0 rounded-xl pointer-events-none pulse-ring"
            style={{ border: `1px solid ${color}` }}
          />
        )}
        {verdict === "block" ? (
          <AlertTriangle className="h-5 w-5" style={{ color }} />
        ) : verdict === "suspect" ? (
          <Stethoscope className="h-5 w-5" style={{ color }} />
        ) : (
          <CheckCircle2 className="h-5 w-5" style={{ color }} />
        )}
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mt-1">Output</div>
        <div
          className="text-sm font-extrabold mt-0.5 tracking-wide"
          style={{ color: active ? color : "hsl(var(--muted-foreground))" }}
        >
          {active ? verdictLabel[verdict] : "—"}
        </div>
      </div>
    </div>
  );
};

export default EngineVisualization;
