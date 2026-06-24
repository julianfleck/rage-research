---
title: Membranes / Questions
internal: true
show: true
definition: "The open questions on the membrane track — what's genuinely unsettled about drawing a boundary and reading over it: which community method, which coherence estimator, which overlap-aware recovery score, and the one that gates the rest — whether the oscillator earns its place in the membrane path at all."
description: "The collected open questions for membranes — boundary-drawing method, coherence estimator, recovery scoring, how nesting and overlap interact with any metric, and whether phase coherence beats coupling density and embedding tightness."
date: 2026-06-24
series: Membranes
status: draft
version: 1
author: Julian Fleck
tags:
  - membrane
---

> [!note] Internal
> The open questions for the [[membranes]] track — the things [[membranes/implementation]] and [[membranes/metrics]] leave genuinely unsettled, and that [[membranes/experiments]] is built to answer. Kept in one place so the experiment has a target list.

## The question that gates the rest

Does phase-coherence over a membrane tell us anything that internal coupling density and embedding-cluster tightness don't already? Build design A as the baseline and measure the Hopf model against it. If it doesn't, the [[oscillators|oscillator]] stays in the dynamics track and out of the membrane path. If it does — if phase leads where density lags — that's the first concrete evidence the oscillator is worth its weight for boundaries. This is the central architectural question; everything below is a sub-problem of answering it cleanly. (The oscillator has a *prior* question of its own — whether one phase angle is even the right representation — in [[oscillators/questions]].)

## The method choices

The experiment can't be run until three modelling choices are made, and each is a real question, not a default:

- **Which coherence estimator** reads "in sync" over a region — the phase order parameter, embedding tightness, or something that combines them.
- **Which (overlapping) community method** turns coupling density into a boundary that allows nesting and overlap rather than a partition — link-based, clique-percolation, or another.
- **Which overlap-aware recovery score** compares a drawn membrane to a planted one when both can overlap — a best-match F1, or a soft set measure.

## Cutting across

- **Nesting and overlap vs. the metric.** How do nesting and overlap interact with any [[gini-coefficient|metric]] read over a membrane? The boundary drawn is the population measured — change the boundary and you change the number, so a metric and a boundary-drawer can't be validated fully independently.
- **What sets a channel's threshold** — how much [[resonance]] it takes to open one, and how far past it the channel opens — the size and permeability a membrane should have for a task, the same unsettled referent as [[task-appropriate-behavior]].
- **Measuring permeability.** How to measure a membrane's permeability, and the variety it admits — the behaviour of the channel, not just where the boundary falls.
- **Embedding-model sensitivity.** Every result is conditional on the embedding model that seeds initial positions — a sensitivity study of its own.

<Related tags="membrane" />
