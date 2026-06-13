"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Bar, BarChart, Cell, Line, LineChart, XAxis, YAxis } from "recharts";
import { FlowField } from "@/components/flow-field";
import { SubstrateHeroCoact } from "./substrate-hero-coact";
import { SubstratePlayground } from "./substrate-playground";
import { SubstrateField } from "./substrate-field";
import { TaskSpread } from "./task-spread";
import { HillTypes } from "./hill-types";
import { TopoZoom } from "./topo-zoom";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

export type FigureKind = "svg" | "canvas" | "chart";

export interface FigureDef {
  kind: FigureKind;
  render: () => ReactNode;
}

// ---- Gini, animated (recharts / shadcn chart) ---------------------------
// One bar per frame. The distribution morphs from flat to concentrated and
// back; the coefficient is computed from the live values and shown above, so
// the figure shows how concentration drives G without any prose.
const oneSeries = { v: { label: "Activation", color: "var(--foreground)" } } satisfies ChartConfig;

// Mean absolute difference over twice the mean — the plain Gini definition.
function gini(xs: number[]): number {
  const n = xs.length;
  const sum = xs.reduce((a, b) => a + b, 0);
  if (sum <= 0 || n === 0) return 0;
  let diff = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) diff += Math.abs(xs[i] - xs[j]);
  return diff / (2 * n * sum);
}

// Each distribution holds the SAME total (50), spread increasingly unevenly and
// looping. A fixed y-domain (DOMAIN) keeps the scale constant, so concentration
// shows as one bar rising while the rest fall — not everything pinned to the top.
const DISTS: number[][] = [
  [5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  [9, 8, 7, 6, 5, 4, 3, 3, 3, 2],
  [14, 10, 7, 5, 4, 3, 2, 2, 2, 1],
  [24, 8, 5, 4, 3, 2, 1, 1, 1, 1],
  [41, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
const DOMAIN = Math.max(...DISTS.flat());

// Hold on each state long enough to read its coefficient, then morph to the next.
const HOLD = 2400;
const TRANSITION = 1000;

function GiniAnimated() {
  // Interpolate the bar values ourselves and derive the coefficient from the
  // same per-frame values, so the bars and the readout move in exact lockstep
  // (recharts' own tween is disabled). Loops flat → concentrated → flat.
  const [vals, setVals] = useState(DISTS[0]);
  useEffect(() => {
    let raf = 0;
    let hold = 0;
    let from = DISTS[0];
    let step = 0;
    const animate = (target: number[]) => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / TRANSITION);
        const e = 1 - Math.pow(1 - k, 3);
        setVals(target.map((to, i) => from[i] + (to - from[i]) * e));
        if (k < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          from = target;
          hold = window.setTimeout(next, HOLD);
        }
      };
      raf = requestAnimationFrame(tick);
    };
    const next = () => {
      step = (step + 1) % DISTS.length;
      animate(DISTS[step]);
    };
    hold = window.setTimeout(next, HOLD);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hold);
    };
  }, []);

  const g = gini(vals);
  const data = vals.map((v, i) => ({ name: `${i}`, v }));

  return (
    <div className="relative">
      <div className="absolute left-0 top-0 z-10 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        G = <span className="text-foreground tabular-nums">{g.toFixed(2)}</span>
      </div>
      <ChartContainer config={oneSeries} className="aspect-square w-full">
        <BarChart data={data} margin={{ top: 26, right: 2, bottom: 0, left: 2 }} barCategoryGap={2}>
          <XAxis dataKey="name" hide />
          <YAxis hide domain={[0, DOMAIN]} />
          <Bar dataKey="v" radius={1} isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell key={i} fill="var(--foreground)" fillOpacity={0.3 + 0.7 * (d.v / DOMAIN)} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

// ---- Hill diversity profile (recharts / shadcn chart) -------------------
// The effective count plotted against order q. A few dominant types make the
// curve fall steeply; even types keep it flat — the canonical Hill picture.
const hillConfig = {
  even: { label: "even", color: "var(--muted-foreground)" },
  conc: { label: "concentrated", color: "var(--foreground)" },
} satisfies ChartConfig;

function hill(ps: number[], q: number): number {
  const nz = ps.filter((p) => p > 0);
  if (Math.abs(q - 1) < 1e-9) return Math.exp(-nz.reduce((a, p) => a + p * Math.log(p), 0));
  const s = nz.reduce((a, p) => a + Math.pow(p, q), 0);
  return Math.pow(s, 1 / (1 - q));
}

const EVEN = Array.from({ length: 8 }, () => 1 / 8);
const CONC = (() => {
  const w = [0.45, 0.22, 0.13, 0.08, 0.05, 0.04, 0.02, 0.01];
  const s = w.reduce((a, b) => a + b, 0);
  return w.map((x) => x / s);
})();
const PROFILE = [0, 0.5, 1, 1.5, 2, 2.5, 3].map((q) => ({ q, even: hill(EVEN, q), conc: hill(CONC, q) }));

function HillProfile() {
  return (
    <div className="relative">
      <div className="absolute left-0 top-0 z-10 flex gap-3 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-0 w-3 border-t border-foreground" />
          concentrated
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0 w-3 border-t border-dashed border-muted-foreground" />
          even
        </span>
      </div>
      <ChartContainer config={hillConfig} className="aspect-square w-full">
        <LineChart data={PROFILE} margin={{ top: 26, right: 8, bottom: 2, left: 2 }}>
          <XAxis dataKey="q" type="number" domain={[0, 3]} ticks={[0, 1, 2, 3]} tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
          <YAxis hide domain={[0, 8.5]} />
          <Line dataKey="even" stroke="var(--color-even)" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
          <Line dataKey="conc" stroke="var(--color-conc)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

export const figures: Record<string, FigureDef> = {
  // Conceptual: activation gathering/dispersing across the substrate.
  "substrate-spread": { kind: "canvas", render: () => <SubstrateField /> },
  // Task spread: a narrow run vs an open run — measurable difference in spread.
  "task-spread": { kind: "canvas", render: () => <TaskSpread /> },
  // Topography: zooming into the graph exposes finer nodes (progressive disclosure).
  "topo-zoom": { kind: "canvas", render: () => <TopoZoom /> },
  // Mechanical: how a distribution's shape maps to the coefficient.
  "gini-spread": { kind: "chart", render: () => <GiniAnimated /> },
  // Hill intro: type-bubbles breathing between varied and collapsed.
  "hill-types": { kind: "canvas", render: () => <HillTypes /> },
  // Hill: effective count vs order q for even vs concentrated distributions.
  "hill-profile": { kind: "chart", render: () => <HillProfile /> },
  "flow-field": { kind: "canvas", render: () => <FlowField /> },
  // Landing hero: activation traveling over an evolving substrate — coupling
  // forms/resolves over subgraphs, membranes painted around durable clusters.
  "substrate-hero": { kind: "canvas", render: () => <SubstrateHeroCoact /> },
  // The hero's tunable companion (figure + sliders + captions), embedded into an
  // MDX page. `chart` kind renders raw — no aspect-square wrapper.
  "substrate-playground": { kind: "chart", render: () => <SubstratePlayground /> },
};
