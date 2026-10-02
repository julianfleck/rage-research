---
title: Measurement research
definition: Internal working account of diversity, concentration, and the limits of earlier substrate-health metrics.
description: Consolidated internal note covering frame-type diversity, Hill numbers, Gini concentration, and the deprecated energy-and-health model.
date: 2026-10-02
series: Lab notes
order: 22
status: draft
version: 1
author: Substrate Dynamics Lab
tags: [measurement, diversity, concentration]
internal: true
show: true
---

> [!note] Internal
> This note consolidates the former frame-type-diversity, Hill-diversity, Gini, and Metrics notes. The detailed source notes are preserved under `TRASH/notes/` and `TRASH/references/`.

## Measurement guardrail

No single statistic diagnoses substrate health. Diversity and concentration are descriptive lenses whose meaning depends on the task, the population, the grain, the time window, and the sequence that produced the observed state.

The earlier energy-and-health model treated activation thresholds as direct evidence of healthy exploration, fixation, circular reasoning, or heat death. That interpretation is deprecated. Activation, coupling, and flow remain useful observables, but labels and interventions must be validated against controlled outcomes rather than read directly from a dashboard.

## Frame-type diversity

Frame-type diversity asks which kinds of knowledge units are active in a region and how evenly activity is distributed among them. A narrowing profile may indicate useful consolidation or premature exclusion. An expanding profile may indicate productive exploration or failure to settle.

Hill numbers express the profile as an effective number of types:

| Order | Familiar form | Emphasis |
|---|---|---|
| 0 | Richness | Counts every observed type equally |
| 1 | Exponential Shannon entropy | Weights types by frequency |
| 2 | Inverse Simpson | Emphasizes common types |
| ∞ | Berger-Parker inverse | Reflects the most dominant type |

Reading several orders together shows whether apparent variety rests on substantial participation or a long tail of rare types.

## Concentration

The Gini coefficient summarizes how unevenly a quantity is distributed. Applied to activation, retrieval, or coupling, it can show whether a small part of the substrate carries most of the activity. It does not explain why the concentration formed or whether it fits the task.

Concentration should be read alongside diversity and [[movement]]. Two regions can have the same Gini value while one is stabilizing after broad exploration and the other has remained closed throughout. The path distinguishes them.

## Required comparisons

Any proposed measurement should state:

- the population and region over which it is computed;
- the grain and time window;
- the expected behavior under a planted positive and negative control;
- the trace-level or simpler structural baseline it must beat;
- the task outcome against which its interpretation is validated;
- its sensitivity to retrieval policy, embeddings, and boundary choice;
- whether it provides enough lead time for a reversible intervention.

Metrics become useful as a set of conditional observations. They should remain separate from the normative judgment about which state a particular task ought to occupy.

<Related tags="measurement, diversity, concentration" />
