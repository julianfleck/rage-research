---
title: Oscillators (why Hopf)
internal: true
show: true
definition: Each frame is modelled as a Hopf (Stuart-Landau) oscillator — a complex state z = r·e^(iθ) carrying activation (amplitude) and timing (phase) in one variable, with a bifurcation parameter that switches it between decaying-to-silence and self-sustaining. Phase and natural frequency are seeded from the frame's embedding; attention drives the bifurcation parameter up, time drives it down.
description: What the oscillator layer in rage-substrate actually is — why we model frames as oscillators, why Hopf specifically, how it is seeded from embeddings, what reads it, and where it does and doesn't meet the coupling layer.
date: 2026-06-22
series: Lab notes
status: draft
version: 1
author: Julian Fleck
tags:
  - implementation
  - phase
---

Internal note. The published [[codebase|state-of-the-codebase]] note says, in one line, that each frame carries "an activation that decays over time and a phase". This note is what sits behind that line: what the oscillator layer actually is in rage-substrate, why it's built this way, and — the part worth being honest about — where it connects to [[coupling]] and where it only looks like it does.

## Why model a frame as an oscillator at all

A plain activation score gives one number per frame: how active it is right now. That's enough for retrieval ranking, but it can't express the thing the dynamics work is about. Two frames can both be active without being active *together*. A scalar can't tell those apart.

An oscillator carries a **phase** — a position in a cycle — on top of its amplitude. Phase is meaningless for one frame alone; it only means something relative to other frames. That relative reading is the point: two frames in the same phase are co-active in the strong sense, not just both switched on. Convergence, lock-in, drift — the regimes we want to read — are all *synchronization* phenomena, things falling into or out of step. Modelling frames as oscillators is choosing a representation where synchronization is the native quantity, and borrowing the body of oscillator math (and the whole-brain models that use it) that already knows how to measure it.

That's the bet. Whether it pays off over a knowledge graph — where "phase" has no physical referent the way it does for a neuron — is open, and the simpler alternatives in [[membrane-alternatives]] are the control we should measure it against.

## Why Hopf specifically

Two cheaper oscillator models exist, and each is missing something we need:

- **Kuramoto** — phase only, fixed amplitude. Every oscillator always oscillates. There's no way to say a frame is *dormant*; it can only be in or out of phase, never off. We need frames to fall silent when neglected, so phase-only isn't enough.
- **Leaky integrator / exponential decay** — amplitude only, no phase. Gives forgetting cleanly, but throws away the synchrony reading that was the whole reason to reach for oscillators.

The **Hopf (Stuart-Landau) oscillator** carries both in one complex number `z = r·e^(iθ)`: amplitude `r` is activation (and can decay to zero — dormant), phase `θ` is timing. And it adds the piece neither of the others has — a **bifurcation parameter** `a`, a single knob with a clean tipping point:

- `a < 0` → the frame decays to silence if nothing touches it (dormant);
- `a > 0` → the frame sustains its own oscillation (awake, limit cycle of amplitude √a);
- `a = 0` → the Hopf bifurcation, the tipping point between the two.

So one parameter gives us the dormant/awake switch *and* a named, well-studied transition to sit the dynamics on. The lineage is deliberate: whole-brain models (Deco et al., 2024) use exactly this oscillator, which is the same neuroscience analogue the project leans on elsewhere (Cole's activity-flow work). The cost is that it's the heaviest of the three — complex state per frame, an ODE integrated every tick, four parameters to tune.

## What we actually implemented

`rage_substrate/attention/hopf.py`. Each frame stores `z` (as `z_real`, `z_imag`), the bifurcation `a`, and a natural frequency `ω`. The dynamics:

```
dz/dt = (a + iω)z − |z|²z + g·C·(z_neighbours − z) + noise
```

The cubic term is **negative** — this is the *supercritical* normal form, so an isolated frame has no bistability and no hysteresis: amplitude rises smoothly as √a and falls back the same way. (Any hysteresis in the system comes from the feedback that drives `a`, not from the oscillator — see the separate hysteresis note when it exists.)

### Seeding from the embedding

`initialize_oscillator()` sets four numbers; **only two come from the embedding**, through two separate random projections:

- **Natural frequency ω** — the embedding projected onto one fixed random unit vector → scalar → sigmoid → clamped to **[0.05, 0.25]**.
- **Initial phase θ₀** — the embedding projected through a fixed 2D Gaussian matrix (Johnson–Lindenstrauss) → (x, y) → `atan2` → an angle in **[0, 2π]**.
- **Initial amplitude** — fixed at **0.1** (not from content).
- **Initial bifurcation `a`** — fixed at **−0.1**, dormant (not from content).

So the embedding sets the two *innate* properties — where a frame sits on the phase circle and how fast it wants to cycle — and the two *state* properties start at dormant defaults, driven thereafter by attention. The intent is sound: content-seeded rather than random, so similar frames start near each other in phase and phase-lock easily, and dormant so nothing is active until used. The reduction is the questionable part — see open questions.

### The step

Every tick, `step()`:

- evolves `z` by Euler integration of the equation above, where the coupling matrix `C` is the [[coupling]] **strength** read straight from the `couplings` table (`strength > 0.001`);
- decays the bifurcation: `a ← a − 0.02·dt` for every frame — the constant pull back toward dormant;
- writes `z` and `a` back to the frame, and recomputes a global **coherence** (order parameter `|⟨e^(iθ)⟩|`).

`attend()` is the counter-force: on retrieval it adds **+0.3** to `a` (pushing a dormant frame to +0.2, awake) and gives a small amplitude kick. A frame attended once decays back below zero in ~100 ticks; attended more often than that, it stays lit. Frame life is that tug-of-war: +0.3 on use against −0.02·dt of forgetting.

`ω` is **not** updated after seeding. The intended frequency-drift toward attended neighbours (mentioned in [[membranes]]) isn't implemented — frequency is fixed at birth.

### What reads the oscillator

The retrieval re-ranker (`reranker.py`) is the one consumer. A frame's bifurcation sets an activation score (`a > 0` → [0.6, 1.0]; `a < 0` → [0.2, 0.5]), amplitude adds a small prominence bonus, and phase contributes a **resonance** bonus when it aligns with a query phase (up to +0.2 for in-phase, 0 for anti-phase). So the oscillator's only effect on the substrate is to tilt what retrieval surfaces. It changes what gets read; it doesn't change what gets stored.

### Where it meets coupling — and where it doesn't

This is the part the prose tends to paper over. There are two layers — the oscillator layer and the [[coupling]] layer — and they touch in exactly one direction:

- **Coupling → oscillator: wired.** Coupling *strength* is the `C` in the step. Co-attention builds strength (+0.1 per co-retrieval), strength drives synchronization. So use pulls coupled frames into phase.
- **Oscillator → coupling: not wired.** The oscillator's phase and amplitude are never read back when building coupling. Strength is pure co-attention count; valence (alignment / interference) is computed separately from embedding similarity + keyword stance. Neither looks at `z`.
- **Valence → oscillator: not wired.** The step reads `strength` only. A coupling marked *destructive interference* pulls two frames together exactly like an *alignment* coupling — same attractive sign. Nothing makes interfering frames repel or sit anti-phase.

So the oscillator is, today, a **downstream display driven by coupling**, not a participant that shapes it. It reads the substrate (into retrieval ranking); it doesn't yet write back into the substrate's stored structure. Most of what [[membranes]] needs — a boundary drawn from coupling density — lives entirely on the coupling side and doesn't depend on the oscillator at all. That's the thread [[membrane-alternatives]] picks up.

## Open questions

- **The phase seeding is enormously lossy.** Collapsing a 4096-dimensional embedding to a single angle on a circle destroys almost all of its structure: unrelated frames collide at the same phase often, and the angle itself is arbitrary. "Similar phase ≈ similar meaning" holds only weakly. ω and θ₀ are also two *independent* random shadows of the same vector, correlated only through the source embedding. If the project is about high-dimensional spread collapsing, compressing each frame to one angle before the dynamics even start may throw away exactly what we want to watch — which is why the research direction wanted a phase *signature* (several dimensions), not a scalar. Ties to the embedding-sensitivity study Megan is scoping.
- **Global coherence is close to meaningless.** The order parameter over *all* frames, seeded at semantically spread phases, sits near its random-phase floor (≈ 1/√N) and barely moves regardless of local dynamics. Coherence is only informative over a bounded population — it should be read **per [[membranes|membrane]]**, where a region tightening is a real, local event. The global number averages out the thing it's meant to detect.
- **Is the ODE worth its weight** versus a scalar activation plus a coherence read straight off embedding geometry? Open, and the subject of [[membrane-alternatives]].

<Related tags="phase" />
