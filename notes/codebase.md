---
title: State of the codebase
definition: RAGE in three pieces — v1 (Recursive Agentic Graph Embeddings, the production graph builder behind recurse.cc), v2 (Recursive Attention-Guided Explorations, the dynamics layer where the oscillator and coupling machinery run), and rage-substrate-lab (the modular testbed where construction, retrieval, and dynamics become swappable passes measured against baselines) — plus the deltas between concept and code the lab is built to settle.
description: The state of the RAGE code — the production graph builder, the dynamics implementation, and the modular lab that isolates and measures each mechanism — and the backlog of gaps between the concept notes and what's built, each reframed as a swappable pass and the experiment that settles it.
date: 2026-06-24
series: Lab notes
status: draft
version: 3
author: Julian Fleck
tags:
  - implementation
internal: true
show: true
---

> [!note] Internal
> Orientation for the lab work, paired with the concept notes. The published concepts ([[membranes]], [[coupling]], [[coordination-phase]], [[resonance]], [[oscillators]]) describe what we *want* the substrate to be, and they should stay aspirational. This note tracks the distance between those descriptions and the code — and, since the lab now exists, the apparatus for closing it. Each delta below follows the same shape: what runs today, why it falls short, the candidate, the experiment that settles it, and whether the lab pieces that experiment needs are built yet.

## Current approach

RAGE has had two lives, and a third thing has grown up beside them.

**v1 — *Recursive Agentic Graph Embeddings*** is the production system behind [recurse.cc](https://www.recurse.cc/): it builds a frame-semantic knowledge graph out of documents and serves it to users. What that system does is written up in the companion paper, *[[graph-construction]]*.

**v2 — *Recursive Attention-Guided Explorations*** came out of getting interested in what happens to such a graph under sustained use: its dynamics. It's a dynamics layer grown on top of the production ingestion/retrieval/serving stack (`julianfleck/rage-substrate`) — where the oscillator and coupling machinery actually run. It is the subject of the deltas below. What it does:

- builds the typed [[frame]] graph, with named slots and frames nesting inside frames;
- records [[coupling]] between frames, including whether a pairing reinforces or conflicts — its valence;
- gives each frame an activation that decays over time and a phase, so attention and rhythm are first-class rather than bolted on (the [[oscillators|oscillator layer]]);
- retrieves by a mix of keywords and meaning, and can walk the graph along its own structure;
- streams its changes live, so the substrate can be watched as it moves rather than polled after the fact.

A caveat on how much of that is joined up. The activation-and-phase layer and the [[coupling]] layer are wired in one direction only: coupling drives the oscillators (frames used together are pulled toward the same rhythm), but the oscillators don't yet feed back — a frame's phase and activation tilt what retrieval surfaces, not what the substrate stores. So the rhythm reads the substrate; it doesn't yet shape it. The detail is in [[oscillators/implementation]].

**The lab — `rage-substrate-lab`** is the testbed we set up to do this work properly: the smallest thing that lets us swap out *how* we construct, retrieve, and evolve a substrate and measure what each choice does, without dragging the production surface along. The organising idea is that an experiment is a transformation of substrate configuration, `config_in → config_out`, and you can measure the input, the output, the **delta**, or the **trajectory**. Push that all the way and the only invariants are the **representation** and the **harness**; everything procedural is a swappable **pass**. Three layers — a kernel (frames, format, the Pass protocol + catalog, the harness, fixtures), the passes (construct · retrieve · evolve), and measurement (signals, metrics). v2 is where the current mechanisms live; the lab is where they get isolated, swapped, and compared. The architecture is documented in the lab repo; what matters here is what it can measure today.

## What the lab can measure today

Some of the gaps below already have a baseline in the lab; others wait on a pass that isn't built. The honest inventory:

| Lab component | What it does | Status |
|---|---|---|
| `extraction` | construct the graph — LLM cypher, GLiNER, and hybrid passes behind one interface; edges resolved schema-first from registry slots | **built** |
| `retrieval` | simulate dense / hybrid-RRF / graph-walk retrieval over a query workload, laying down [[coupling]] by co-retrieval (Hebbian) | **built** |
| `membranes` | draw a boundary from coupling density (overlapping connected-components) | **built** |
| `metrics` | read coherence (phase order parameter, the √π/(2√N) floor, per-region, embedding tightness) and recovery (overlap-aware F1) over a region | **built** |
| `dynamics` (evolve) | port v2's Hopf step as one swappable update rule — feedback, valence response, frequency drift | *scaffolded* |
| `signals` | readouts over a trajectory (time-to-synchronise, when a membrane crystallises) | *scaffolded* |

So construction, retrieval, and the membrane *measurement* are real and runnable — enough to run [[membranes/experiments]] end to end. The evolve pass that ports the oscillator is the next thing to build; until it exists, the oscillator runs only in v2.

## The deltas, and the experiments that settle them

Each gap is now a swappable mechanism, measurable against a simpler baseline rather than adopted by commitment.

**1. Embedding richness collapsed to scalars.** The one that runs through the rest. v2's whole subject is high-dimensional structure — meaning spread across a 4096-dimensional space — converging or diverging, yet almost every place it turns an embedding into a dynamical quantity it first crushes it to a scalar: phase to a single *angle*, frequency to one number, valence to a cosine plus keyword stance markers. So the representation collapses the very dimensionality the project exists to study, then reads convergence off the collapsed version. *Candidate:* read dynamical quantities from embedding geometry directly — coherence as cluster tightness rather than a phase order parameter; phase, if kept, as a *signature* (several dimensions) not one angle; valence from frame **slot structure** rather than lexical markers. *Experiment:* the [[oscillators/questions|phase-representation study]] makes "is one angle enough" measurable — quantify what survives the collapse at d = 1, 2, 4, … against full-embedding similarity. **Lab:** coherence-as-tightness is **built** (`metrics`); the multi-dimensional phase signature is *not built* — it's exactly what that experiment would prototype.

**2. Oscillator and coupling wired one-directionally.** The concept implies a single coupled system where structure and rhythm shape each other; v2's coupling drives the oscillator but the oscillator never feeds back (see [[oscillators/implementation]]). *Candidate:* either close the loop (let phase relationships inform coupling — two frames that won't phase-lock are evidence of interference) or accept the oscillator as a read-only instrument and stop implying otherwise. In the lab this is simply *which evolve pass you plug in*, the two variants compared rather than argued. **Lab:** needs the `dynamics` pass — *scaffolded*.

**3. Coupling valence recorded but inert.** [[coupling]] valence (alignment / interference) is computed and stored, then ignored by v2's Hopf step, which reads `strength` only — so an interfering pair is pulled together exactly like an aligning one, with no anti-phase push. *Candidate:* make valence modulate the coupling sign — interference as repulsive coupling, driving the pair toward anti-phase. At minimum, have *something* respond to a recorded conflict. **Lab:** lives in the `dynamics` pass — *scaffolded*.

**4. Coherence is global, should be per membrane.** v2's order parameter over all frames, seeded at semantically spread phases, sits near its random floor (≈ 1/√N) and barely moves — it averages out exactly the local synchrony it's meant to detect. *Candidate:* read coherence over a [[membranes|membrane]] (a bounded co-active region), making it a readout *over* a drawn boundary, not a substrate-wide statistic. **Lab:** **built** (`metrics` reads per-region); whether it separates structure where the global number can't is run 1 of [[membranes/experiments]].

**5. Membrane drawing isn't built in v2 — and may not need the oscillator.** Taking [[coupling]] density and emitting an *overlapping, nested* membrane, with metrics over the enclosed subgraph, had no implementation in v2; and the boundary is a coupling-graph problem that doesn't depend on the oscillator at all. *Candidate:* a scalar-activation + overlapping-community baseline for drawing and reading membranes, with the Hopf model measured against it (full argument in [[membranes/metrics]]). **Lab:** **built** as a baseline (`membranes` draws it, `metrics`/recovery score it against planted ground truth); the open part — whether phase adds anything over density and tightness — is [[membranes/questions|the gating question]].

**6. Frequency fixed at seeding.** [[membranes]] describes a frame's frequency drifting toward the ones it attends to; v2 sets `ω` once and never updates it. Minor, but it's a stated mechanism that isn't there. *Candidate:* implement the drift as an evolve variant, or drop the claim from the concept note. **Lab:** an option on the `dynamics` pass — *scaffolded*.

## Through-line

Most of these are the same mistake in different places — reaching for a scalar (one phase angle, one frequency, one similarity, one global coherence) where the substrate's whole point is structure a scalar can't hold. And every result is conditional on the embedding model that seeds initial positions — a sensitivity study cutting across all of them. The lab is what makes fixing them tractable: each becomes a swappable mechanism behind a common interface, measured against the simpler baseline. The aspirational concept notes stay as they are; this note tracks the distance to them, and the apparatus for closing it.

<Related tags="implementation" />
