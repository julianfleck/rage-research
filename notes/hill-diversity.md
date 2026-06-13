---
title: Hill diversity
description: Effective counts of frame types at different orders — how we'd tell whether rare framings survive or get drowned out.
date: 2026-06-12
series: Lab notes
status: draft
version: 1
show: true
author: Julian Fleck
tags: [metric, diversity, substrate]
---

# Hill diversity

## What it measures

Hill numbers come from ecology. There the kinds are species and the population is the individuals in a sample, and they read diversity — how many kinds are present and how evenly — without forcing richness and evenness into a single index.

<Figure id="hill-types" margin />

These are notes on what we want to study, not measurements we have taken. The intent is to borrow Hill numbers to read *semantic* diversity over the substrate: treat the kinds as frame types and the population as a set of active frames, and ask how varied that set is. A Hill number is an *effective count* — the number of equally-common types that would produce the diversity you actually see. Ten frame types may be present, but if one dominates, the effective count drops well below ten, and the rare ones barely register.

We expect to use this as a general reading of substrate state — whether a region keeps a varied vocabulary of framings or collapses onto a few — and to read it across [[scale|scales]], since healthy diversity for the whole store, a cluster, and a single membrane need not be the same number.

One thing it should expose is a diversity signature that differs by task: a narrow task should range over few framings, an open one over many. Whether that can be turned into a judgment of [[task-appropriate-behavior|task-appropriate behavior]] is a separate and still-open question.

## How it's calculated

Hill numbers are a family, not one number. A single formula, read at different orders $q$, recovers several of the diversity indices used elsewhere as special cases. The order is a dial for how much weight rare types get.

| Order | Equivalent index | What it weights |
|---|---|---|
| ${}^{0}D$ | richness (type count) | every type equally, rare or common |
| ${}^{1}D$ | Shannon, $\exp(H)$ | each type by its frequency |
| ${}^{2}D$ | inverse Simpson | the common types; rare ones nearly ignored |
| ${}^{\infty}D$ | Berger–Parker | only the single most dominant type |

We mostly read the first three. Raising $q$ shifts weight from rare types toward common ones, so the effective count can only fall or hold as $q$ grows — never rise.

<Figure id="hill-profile" margin caption="Diversity profile: the effective count against order q. A few dominant types make it fall steeply; even types keep it flat." />

For type frequencies $p_1, \dots, p_S$ (each the share of frames of that type):

$$
{}^{q}D = \left( \sum_{i=1}^{S} p_i^{\,q} \right)^{1/(1-q)}
$$

The $q = 1$ case is taken as the limit, ${}^{1}D = \exp\!\left(-\sum_i p_i \ln p_i\right)$.

A small example. Five frame types with frequencies $[0.6, 0.2, 0.1, 0.07, 0.03]$. Richness is ${}^{0}D = 5$. The Shannon number ${}^{1}D$ comes to about 3.2, and the inverse-Simpson ${}^{2}D$ to about 2.4. So although five types are present, the substrate behaves like it holds between two and three — one type carries most of the weight.

Reading the three orders together is the point. When ${}^{0}D$ sits well above ${}^{2}D$, there is a long tail of rare types that the common ones are drowning out. Watching that gap is how we'd tell whether rare framings survive or get buried.

<Related tags="metric" title="Related metrics" />
