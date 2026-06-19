---
title: Gini coefficient
definition: "A single number (0–1) for how unequally activation is concentrated across frames — high values flag a few frames hoarding the energy."
description: A single number for how unequally energy is spread across the substrate.
date: 2026-06-12
series: Lab notes
status: draft
version: 1
show: true
author: Julian Fleck
tags: [metric]
---

# Gini coefficient

<Figure id="substrate-spread" margin caption="Gini coefficients could measure gathering and dispersal of activation across the substrate." />

The Gini coefficient is a single number for how unequal a distribution is. It runs from 0 to 1: 0 means everything is shared equally, 1 means one item holds all of it. It comes from economics, where it measures income inequality.

Here it is applied to the substrate — the activation across frames, or the energy across territories. It answers one question: is attention spread out, or concentrated in a few places?

## Scale

A Gini value is only defined over a chosen set, and the substrate offers several — the whole store, a single membrane, or anything between. The coefficient means different things at each, and within a single membrane the reading even inverts: a low Gini there is coherence, where a low Gini over the whole store is [[metrics#Semantic Heat Death|heat death]]. This is the general problem of [[scale]], and the coefficient should be read with it in mind: compute it across scales, and always say which one you mean.

<details>
<summary>How it is computed</summary>

<Figure id="gini-spread" margin caption="The same total, spread differently — and the coefficient it yields." />

Start with the plainest version: pick two frames at random, note the gap between their activations, and average that gap over every possible pair. That average — the *mean absolute difference* — is how far apart two frames typically are. If every frame holds the same activation the gap is always zero; if one frame holds everything and the rest hold nothing, almost every pair shows a large gap.

The average gap still depends on the units, so divide it by twice the mean activation. That pins it to a 0–1 scale, because twice the mean is the largest the average gap can get (one frame with everything, the rest empty). That ratio is the Gini coefficient:

$$
G = \frac{\sum_{i}\sum_{j} |x_i - x_j|}{2\,n^2\,\bar{x}}
$$

where $\bar{x}$ is the mean and the double sum runs over every pair of frames.

A small example. Four frames at $[1, 1, 1, 1]$ are perfectly equal: every gap is 0, so $G = 0$. Four frames at $[0, 0, 0, 4]$ are as lopsided as four frames get — the mean is 1, the average gap is 1.5, so $G = 1.5 / 2 = 0.75$, the most a set of four can reach ($1 - 1/n$).

The same number has a cheaper form — sort the values ascending and use:

$$
G = \frac{2 \sum_{i=1}^{n} i\,x_i}{n \sum_{i=1}^{n} x_i} - \frac{n + 1}{n}
$$

with $i$ the 1-based rank. Sorting once beats comparing every pair, but it computes exactly the same value.

In practice:

- All-equal values give 0; a single nonzero value gives almost 1.
- If everything is zero the coefficient is undefined (you divide by the total).
  Skip empty regions, or treat them as 0 deliberately.
- Decide whether inactive frames (activation 0) count. Including them raises the
  global number; restricting to active frames measures concentration among what
  is actually live.

<Related tags="metric" title="Related metrics" />
