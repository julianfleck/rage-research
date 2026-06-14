"use client";

import { type ReactNode } from "react";
import { Line, LineChart, XAxis, YAxis } from "recharts";
import { FlowField } from "@/components/flow-field";
import { SubstrateHeroCoact } from "./substrate-hero-coact";
import { SubstratePlayground } from "./substrate-playground";
import { SubstrateField } from "./substrate-field";
import { TaskSpread } from "./task-spread";
import { HillTypes } from "./hill-types";
import { TopoZoom } from "./topo-zoom";
import { GiniNodes } from "./gini-nodes";
import { TypeDrift } from "./type-drift";
import { MembranePermeability } from "./membrane-permeability";
import { MembraneSize } from "./membrane-size";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

export type FigureKind = "svg" | "canvas" | "chart";

export interface FigureDef {
  kind: FigureKind;
  render: () => ReactNode;
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
  // Frame-type diversity: typed frames flow in varied and homogenize to one type.
  "type-drift": { kind: "canvas", render: () => <TypeDrift /> },
  // Topography: zooming into the graph exposes finer nodes (progressive disclosure).
  "topo-zoom": { kind: "canvas", render: () => <TopoZoom /> },
  // Mechanical: how a distribution's shape maps to the coefficient.
  "gini-spread": { kind: "canvas", render: () => <GiniNodes /> },
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
  // Membranes: permeability as traversal depth — resonance opens a subgraph from
  // summary to a rich subset of frames.
  "membrane-permeability": { kind: "canvas", render: () => <MembranePermeability /> },
  // Membranes: a membrane breathing over a field of subgraphs — size sets the
  // variety it admits.
  "membrane-size": { kind: "canvas", render: () => <MembraneSize /> },
};
