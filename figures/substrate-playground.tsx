"use client";

import { useState } from "react";
import { SubstrateHeroCoact } from "@/components/figures/substrate-hero-coact";

// The interactive substrate playground: the landing figure with its governing
// parameters exposed, each captioned with the substrate metric it maps to.
// Embedded into an MDX page via <Figure id="substrate-playground" />, so it sits
// inside the normal article layout.
type Key = "actDecay" | "coupDecay" | "coupLearn" | "pull" | "restLen" | "injMin" | "injMax";

const DEFAULTS: Record<Key, number> = {
  actDecay: 0.98,
  coupDecay: 0.97,
  coupLearn: 0.033,
  pull: 0.052,
  restLen: 0.065,
  injMin: 0.4,
  injMax: 1.3,
};

const SETTINGS: { key: Key; label: string; min: number; max: number; step: number; blurb: string }[] = [
  {
    key: "actDecay",
    label: "activation decay",
    min: 0.9,
    max: 0.999,
    step: 0.001,
    blurb:
      "How fast an injection's energy dissipates once it lands — the substrate's forgetting rate, the decay the metrics watch against collapse. Held high, activation lingers and travels hop to hop, spreading across many frames: high entropy, low concentration, the signature of exploration. Dropped low, energy dies near its injection site before it can reach neighbours, and the substrate fixates.",
  },
  {
    key: "coupDecay",
    label: "coupling persistence",
    min: 0.9,
    max: 0.999,
    step: 0.001,
    blurb:
      "How long a coupling survives without fresh co-activation — the line between the stabilization and drift phases. High persistence lets couplings consolidate into durable structure, so membranes hold once formed; pushed too high, coupling density climbs toward heat death, where everything is weakly tied to everything. Too low and couplings decay before they accumulate: activity without structure.",
  },
  {
    key: "coupLearn",
    label: "coupling build rate",
    min: 0.005,
    max: 0.08,
    step: 0.001,
    blurb:
      "How much a single co-activation strengthens the coupling between two frames — the Hebbian learning rate. High, and a coupling forms on one shared firing: fast attractor onset, coupling concentration (Gini) spiking as the rich get richer. Low, and coupling has to be earned through repeated co-activation, so structure consolidates slowly and the long tail of rarer framings (Hill diversity) survives.",
  },
  {
    key: "pull",
    label: "pull strength",
    min: 0,
    max: 0.1,
    step: 0.002,
    blurb:
      "The spatial expression of coupling: how firmly coupled frames draw toward each other (entrainment). More a visualization control than a substrate measure — it renders cluster coherence as physical proximity. Strong pull gives tight, legible territories; weak pull leaves coupled frames loosely gathered.",
  },
  {
    key: "restLen",
    label: "rest length",
    min: 0.04,
    max: 0.16,
    step: 0.005,
    blurb:
      "The spacing a coupled cluster settles at — and so the visual size and density of a membrane. Also a visualization control: it sets how compact each consolidated territory looks. Short rest length packs frames into dense knots; long rest length keeps territories airy and open. (Together with pull strength, this is what stops coupled frames from collapsing onto each other.)",
  },
  {
    key: "injMin",
    label: "inject interval — floor",
    min: 0.1,
    max: 1.5,
    step: 0.05,
    blurb:
      "The shortest gap between energy injections. Attention is the only way energy enters the substrate, and the per-turn injection point is the leverage the whole model turns on. Each injector runs its own random interval between this floor and the ceiling below it, so attention arrives in bursts across the graph rather than on a single metronome — which is what keeps the field from globally fading between turns.",
  },
  {
    key: "injMax",
    label: "inject interval — ceiling",
    min: 0.3,
    max: 2.5,
    step: 0.05,
    blurb:
      "The longest gap between injections. Widen the range toward here and the substrate gets long quiet stretches where decay outruns input and structure cools toward drift; keep it tight against the floor and near-continuous energy holds the field in exploration. The spread between floor and ceiling is what makes the rhythm breathe.",
  },
];

function Control({ label, min, max, step, value, set, blurb }: { label: string; min: number; max: number; step: number; value: number; set: (v: number) => void; blurb: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-foreground">{value.toFixed(3)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(parseFloat(e.target.value))} className="mt-2 w-full accent-foreground" />
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{blurb}</p>
    </div>
  );
}

export function SubstratePlayground() {
  const [v, setV] = useState(DEFAULTS);
  const set = (k: Key) => (val: number) => setV((prev) => ({ ...prev, [k]: val }));

  return (
    <div className="not-prose">
      <div className="mx-auto aspect-square w-full max-w-[22rem] text-foreground">
        <SubstrateHeroCoact actDecay={v.actDecay} coupDecay={v.coupDecay} coupLearn={v.coupLearn} pull={v.pull} restLen={v.restLen} injMin={v.injMin} injMax={v.injMax} />
      </div>
      <div className="mt-8 flex flex-col gap-7">
        {SETTINGS.map((s) => (
          <Control key={s.key} label={s.label} min={s.min} max={s.max} step={s.step} value={v[s.key]} set={set(s.key)} blurb={s.blurb} />
        ))}
      </div>
    </div>
  );
}
