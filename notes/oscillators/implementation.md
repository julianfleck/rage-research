---
title: Oscillators / Implementation
internal: true
show: true
definition: How the oscillator layer is actually built in julianfleck/rage-substrate — each frame a Hopf (Stuart-Landau) oscillator z = r·e^(iθ), seeded from its embedding, driven by attention, coupled through the coupling table, and read by the retrieval re-ranker. The companion to the public oscillators note; this one spells out what is and isn't wired.
description: The implementation detail behind the oscillators concept note — embedding seeding, the Stuart-Landau step, what reads the oscillator, and where it does and doesn't meet the coupling layer in julianfleck/rage-substrate.
date: 2026-06-22
series: Oscillators
status: draft
version: 1
author: Julian Fleck
tags:
  - implementation
  - phase
---

> [!note] Internal
> The implementation behind [[oscillators]]. That note says *why* we model a frame as an oscillator at all; this one covers why the current build uses a Hopf oscillator specifically, what's actually in `julianfleck/rage-substrate`, and — the part worth spelling out — where it connects to [[coupling]] and where it only looks like it does. What it leaves open is collected in [[oscillators/questions]].

## Why Hopf

The status quo. The current build models each frame as a **Hopf (Stuart-Landau)** oscillator rather than something cheaper, because the two simpler options each drop something the substrate needs:

- **Phase-only (Kuramoto).** Every oscillator always oscillates — no way to say a frame is *dormant*. It can be in or out of phase, never off. We need frames to fall silent when neglected, so phase alone isn't enough.
- **Amplitude-only (a decaying score).** Gives forgetting cleanly, but throws away the timing that was the reason to reach for oscillators at all.

Hopf carries both at once: an amplitude that can fall to zero (dormant) and a phase. And it adds the piece neither of the others has — the bifurcation parameter `a`, a single knob with a clean tipping point between decaying to silence (`a < 0`) and sustaining its own rhythm (`a > 0`). One knob gives the dormant/awake switch and a named, well-studied transition to sit the dynamics on. The lineage is deliberate: whole-brain models use exactly this oscillator, the same neuroscience analogue the project leans on elsewhere (activity-flow work on how activation travels over a fixed connectivity graph).

Whether the choice is worth its weight is the open question [[oscillators/questions]] takes up; this note describes what it is, not whether to keep it.

## What we actually implemented

`rage_substrate/attention/hopf.py`. Each frame stores `z` (as `z_real`, `z_imag`), the bifurcation `a`, and a natural frequency `ω`. The dynamics:

```
dz/dt = (a + iω)z − |z|²z + g·C·(z_neighbours − z) + noise
```

The cubic term is **negative** — this is the *supercritical* normal form, so an isolated frame has no bistability and no hysteresis: amplitude rises smoothly as √a and falls back the same way. Any path-dependence in the system comes from the feedback that drives `a` (attention up, time down), not from the oscillator itself.

## Seeding from the embedding

`initialize_oscillator()` sets four numbers; **only two come from the embedding**, through two separate random projections:

- **Natural frequency ω** — the embedding projected onto one fixed random unit vector → scalar → sigmoid → clamped to **[0.05, 0.25]**.
- **Initial phase θ₀** — the embedding projected through a fixed 2D Gaussian matrix (Johnson–Lindenstrauss) → (x, y) → `atan2` → an angle in **[0, 2π]**.
- **Initial amplitude** — fixed at **0.1** (not from content).
- **Initial bifurcation `a`** — fixed at **−0.1**, dormant (not from content).

So the embedding sets the two *innate* properties — where a frame sits on the phase circle and how fast it wants to cycle — and the two *state* properties start at dormant defaults, driven thereafter by attention. The intent is sound: content-seeded rather than random, so similar frames start near each other in phase and phase-lock easily, and dormant so nothing is active until used. The reduction is the questionable part — see [[oscillators/questions]], and the fuller treatment in [[codebase]].

## The step

Every tick, `step()`:

- evolves `z` by Euler integration of the equation above, where the coupling matrix `C` is the [[coupling]] **strength** read straight from the `couplings` table (`strength > 0.001`);
- decays the bifurcation: `a ← a − 0.02·dt` for every frame — the constant pull back toward dormant;
- writes `z` and `a` back to the frame, and recomputes a global **coherence** (order parameter `|⟨e^(iθ)⟩|`).

`attend()` is the counter-force: on retrieval it adds **+0.3** to `a` (pushing a dormant frame to +0.2, awake) and gives a small amplitude kick. A frame attended once decays back below zero in ~100 ticks; attended more often than that, it stays lit. Frame life is that tug-of-war: +0.3 on use against −0.02·dt of forgetting.

`ω` is **not** updated after seeding. The intended frequency-drift toward attended neighbours (mentioned in [[membranes]]) isn't implemented — frequency is fixed at birth.

## What reads the oscillator

The retrieval re-ranker (`reranker.py`) is the one consumer. A frame's bifurcation sets an activation score (`a > 0` → [0.6, 1.0]; `a < 0` → [0.2, 0.5]), amplitude adds a small prominence bonus, and phase contributes a **resonance** bonus when it aligns with a query phase (up to +0.2 for in-phase, 0 for anti-phase). So the oscillator's only effect on the substrate is to tilt what retrieval surfaces. It changes what gets read; it doesn't change what gets stored.

## Where it meets coupling — and where it doesn't

This is the part the prose tends to paper over. There are two layers — the oscillator layer and the [[coupling]] layer — and they touch in exactly one direction:

- **Coupling → oscillator: wired.** Coupling *strength* is the `C` in the step. Co-attention builds strength (+0.1 per co-retrieval), strength drives synchronization. So use pulls coupled frames into phase.
- **Oscillator → coupling: not wired.** The oscillator's phase and amplitude are never read back when building coupling. Strength is pure co-attention count; valence (alignment / interference) is computed separately from embedding similarity + keyword stance. Neither looks at `z`.
- **Valence → oscillator: not wired.** The step reads `strength` only. A coupling marked *destructive interference* pulls two frames together exactly like an *alignment* coupling — same attractive sign. Nothing makes interfering frames repel or sit anti-phase.

So the oscillator is, today, a **downstream display driven by coupling**, not a participant that shapes it. It reads the substrate (into retrieval ranking); it doesn't yet write back into the substrate's stored structure. Most of what [[membranes]] needs — a boundary drawn from coupling density — lives entirely on the coupling side and doesn't depend on the oscillator at all. That's the thread [[membranes/implementation]] picks up.

<Related tags="phase" />
