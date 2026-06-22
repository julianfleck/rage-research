---
title: Oscillators
definition: We model each frame as an oscillator rather than a flat activation score — a thing with both a loudness (amplitude, how active it is) and a timing (phase, where it is in its cycle). Phase is what lets us ask whether two active frames are active together; synchronization is the native quantity, and the convergence and lock-in we want to read are synchronization phenomena.
description: Why substrate dynamics models each frame as an oscillator — what phase buys over a flat activation score, why the Hopf oscillator specifically (amplitude, phase, and a dormant/awake switch in one object), and what that gives the substrate.
date: 2026-06-22
series: Lab notes
status: draft
version: 1
author: Julian Fleck
tags:
  - phase
  - structure
show: true
---

A flat activation score gives one number per frame: how active it is right now. That's enough to rank what a query returns, but it can't express the thing this work is about. Two frames can both be active without being active *together*. A single number can't tell those apart.

So we model each frame as an **oscillator** — something that pulses, carrying a **phase** (a position in a cycle) on top of its amplitude. Phase means nothing for one frame alone; it only means something *relative* to other frames. That relative reading is the point. Two frames sharing a phase are co-active in the strong sense, not just both switched on. Convergence, lock-in, drift — the regimes substrate dynamics tries to read — are all *synchronization* phenomena, things falling into or out of step. Modelling frames as oscillators chooses a representation where synchronization is the native quantity, and borrows the body of oscillator mathematics (and the brain models built on it) that already knows how to measure it.

<Figure id="oscillators" margin caption="Each frame as an oscillator: the tick on the ring is its phase, the pulse of the core its amplitude (how active it is). Coupled frames pulse in unison; loners fall out of step; dormant frames barely stir." />

## Why a Hopf oscillator

Two simpler oscillator models exist, and each is missing something the substrate needs:

- **Phase-only (Kuramoto).** Every oscillator always oscillates; there's no way to say a frame is *dormant*. It can be in or out of phase, never off. We need frames to fall silent when neglected, so phase alone isn't enough.
- **Amplitude-only (a decaying score).** Gives forgetting cleanly, but throws away the timing that was the whole reason to reach for oscillators.

The **Hopf (Stuart-Landau)** oscillator carries both at once: an amplitude that *can* fall to zero (dormant), and a phase. And it adds the piece neither of the others has — a single parameter with a clean tipping point between **decaying to silence** and **sustaining its own rhythm**. One knob gives us the dormant/awake switch and a named, well-studied transition to sit the dynamics on. The lineage is deliberate: whole-brain models use exactly this oscillator, which is the same neuroscience analogue the project leans on elsewhere (activity-flow work on how activation travels over a fixed connectivity graph).

## What it gives the substrate

- **Coherence.** Because frames carry phase, we can ask how in-step a region is right now — one reading of how aligned a set of frames has become. The aim is to read this *over a [[membranes|membrane]]*, not over the whole substrate, where it averages out.
- **Self-forming structure.** Phase plus [[coupling]] lets clusters assemble themselves: frames used together are pulled toward the same rhythm. Nothing clusters the graph by hand; pulsing-together does it.
- **A grip for the dynamics.** Synchronization is a measured quantity in the oscillator literature, which is where the candidate readings for convergence, lock-in, and drift come from.

## Honesty about what's built

We model frames as oscillators, and coupling already pulls them toward synchrony. What isn't settled is whether the oscillator is the right instrument for the questions — whether a single phase angle, seeded from a frame's embedding, holds enough of its meaning to be worth the machinery, and whether the oscillator is even needed to draw a [[membranes|membrane]] (it may not be). The detail of what's actually wired is in [[oscillator-implementation]]; the question of whether a simpler instrument does the same job is [[membrane-metrics]].

<Related tags="phase" />
