---
title: Membranes / Experiments
internal: true
show: true
definition: "The first membrane experiment setup — draw membranes from a synthetic substrate where the structure is planted, and score how well each design recovers it: coupling-density community vs embedding-cluster tightness vs phase coherence, against known ground truth. Three small, fully observable runs, with a table of the quantities measured."
description: "Experiment setup for membrane detection: draw membranes from planted synthetic substrates and score recovery against ground truth, comparing coupling-density, embedding-tightness, and phase-coherence designs, with a table of exactly what each run measures."
date: 2026-06-24
series: Membranes
status: draft
version: 2
author: Julian Fleck
tags:
  - membrane
  - experiment
  - validation
---

> [!note] Internal
> The first experiment setup under [[experiments/experiments|Experiments]], and one of the [[membranes]] working notes. It turns the recommendation in [[membranes/metrics]] — build a membrane baseline and measure the oscillator against it — into something runnable, on synthetic substrates where the structure is *planted*, so a method can be scored on whether it recovers what's there. Owner: Megan. Run in the `rage-substrate-lab` testbed.

## What we're testing

[[membranes|Membranes]] are boundaries the substrate draws for itself from [[coupling]] density. Two things are unsettled (see [[membranes/implementation]] and [[membranes/metrics]]): how to *draw* the boundary, and how to *read* coherence over it. The blunt version of the second: today coherence is a single global order parameter over every frame. Seeded at semantically spread phases it sits near its random floor — roughly 1/√N — and barely moves regardless of local dynamics, averaging out exactly the local synchrony it should detect. The claim is that coherence has to be read *per membrane*, and that a density or embedding baseline may draw the boundary as well as the [[oscillators|oscillator]] does.

The way to settle a measurement question is to run it where the answer is known. So we work on synthetic substrates with **planted** membranes.

## The sandbox

A planted fixture is a set of frames whose embeddings are sampled around known cluster centres, with cluster membership recorded as ground truth. Overlap is a dial — how far the clusters bleed into one another. Couplings come from simulated [[resonance|retrieval]]: a query aimed at each region pulls its frames, and co-retrieval binds them, so the coupling graph reflects how the substrate was *used* — and the retrieval strategy is itself something we can vary. Both pieces live in the testbed: the planted generators and the retrieval simulator.

That gives the two ingredients a membrane method needs — embedding geometry and a coupling graph — with an answer key attached.

## What we're measuring

Every quantity below is computed against the planted membranes, so each has an unambiguous right answer. The first two settle the per-membrane claim; the third scores boundary-drawing; the last asks whether the coupling source matters.

| Quantity | What it is | Computed over | Contrast | A positive result |
|---|---|---|---|---|
| **Global order parameter** `R` | magnitude of the averaged unit phase vector | all frames at once | the random floor √π / (2√N) | sits *at* the floor — the null we expect |
| **Per-region coherence** | the same magnitude, restricted to one region | each planted membrane | global `R`, and the floor | per-region ≫ global; the regions separate |
| **Embedding tightness** | mean cosine similarity to the region centroid | each planted membrane | per-region phase coherence | separates regions where phase can't |
| **Recovery F1** | overlap-aware best-match F1, drawn vs planted | the drawn boundary, swept over overlap | designs A / B / phase against each other | high F1 that degrades *gracefully* as overlap rises |
| **Coupling-source sensitivity** | spread in recovery F1 across retrieval strategies | a fixed fixture, varied retrieval | dense vs hybrid-RRF vs graph-walk | reveals whether *how* it was queried changes the structure |

The designs named in the table are from [[membranes/metrics]]: **A** (coupling-density community, overlap allowed), **B** (embedding-cluster tightness), and **phase** (coherence read off the [[oscillators|oscillator]]).

## Three runs

Each is small, fully observable, and scored against the planted membranes.

1. **The random floor.** Compute the global order parameter and show it sits near 1/√N and barely moves as overlap changes; then compute coherence *per planted region* and show it separates them. This settles whether the per-membrane claim holds before anything is built on it.
2. **Recovery against overlap.** Sweep the overlap dial. For each boundary-drawing design — A (coupling-density community, allowing overlap) and B (embedding-cluster tightness) from [[membranes/metrics]] — score the drawn membranes against the planted ones with an overlap-aware measure, since membranes may overlap. Which design degrades more gracefully as the regions merge? The curve is the result.
3. **Does the coupling source matter.** Hold the fixture fixed and generate couplings with different retrieval strategies (dense, hybrid, graph-walk). Does the recovered membrane structure depend on how the substrate was queried, and where do designs A and B diverge? This is where drawing-from-coupling meets the dynamics.

## What corpus

This runs over no text corpus at first — the planted fixture is geometry with a known answer, on purpose, because you can only tell whether a metric recovers structure if you planted it. It graduates outward in three tiers, trading the answer key for realism: **planted** (synthetic vectors, exact ground truth — where the metric is developed), **designed topics** (authored, deliberately distinct paragraphs embedded with a real model — topic labels as an approximate answer), and **full pipeline** (a real document set through extraction — no planted answer, so the evaluation shifts to human-judged or held-out structure). "What corpus" only becomes a live question at the later tiers; the testbed organises the experiment by tier so the trade is explicit.

## What a result would settle

If per-region coherence separates planted clusters where the global parameter can't, the per-membrane read is justified — measured, not asserted. If A and B recover the planted membranes as well as a phase-coherence read does, the [[oscillators|oscillator]] stays in the dynamics track and out of the membrane path, which resolves the central question [[membranes/questions|the membrane track]] leaves open. And if phase leads where density lags, that is the first concrete evidence the oscillator earns its weight for boundaries too.

## Setup

Owner: Megan. The planted generators and the retrieval simulator are in the `rage-substrate-lab` testbed; the metrics each method needs become swappable measurements there once they settle. A good entry point is a planted two-region fixture with the dense retrieval simulator — the open part is the math: which coherence estimator, which (overlapping) community method, and which overlap-aware recovery score. The open questions that frame the whole family are collected in [[membranes/questions]].

<Related tags="membrane" />
