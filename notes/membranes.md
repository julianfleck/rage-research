---
title: Membranes
definition: A semipermeable boundary in the cell-membrane sense — drawn around a co-active region of the substrate (the frames and agents working together) with channels that open and close at thresholds. Co-attention opens them, decay closes them; membranes nest and overlap rather than partition.
description: What a membrane is in substrate dynamics — a semipermeable, threshold-gated boundary over a co-active region — how it is defined by coupling density, what it regulates, and why membranes nest and overlap.
date: 2026-06-14
series: Lab notes
status: draft
version: 1
author: Julian Fleck
tags:
  - substrate
  - membrane
  - structure
show: true
---

In substrate dynamics, *membrane* is meant in the cell-biology sense: a **semipermeable boundary** — not a wall (nothing crosses) and not an open door (everything crosses), but a surface whose **channels open and close at thresholds**. The gating is the point: flow across the boundary is conditional, set by what has accumulated on either side.

<Figure id="membrane-channels" margin caption="A channel opens only once enough has accumulated on its side, lets a burst across, then closes again as the pressure decays." />

Over the substrate, a membrane is that surface drawn at a moment around a co-active region — the frames and the agents working over them. What opens its channels is local alignment between frames. How we currently raise that alignment: frames carry an initial phase seeded from their content, and attention events drive them toward each other from there — one mechanism among possible others, and still being worked out. Decay pulls the alignment back down and lets the channels close. A membrane is drawn and released, not a fixed group.

<Figure id="substrate-hero" margin caption="Membranes forming around co-active regions and releasing as coupling decays." />

A membrane encloses both the information and the actors working on it, not one or the other. An agent, in this reading, is itself a frame — an aggregation over the context it currently holds, its harness plus what it has in play this turn. It carries an activation pattern like any other frame, so computing that fingerprint over frames picks out the membrane: two agents on the same codebase fall inside one naturally, and two people with overlapping research interests are grouped just as organically — close enough on the substrate to be put in touch.

Membranes over shared substrate are an active interest across a few projects, each coming at them from a different direction — from [selectively permeable communication](https://www.julianfleck.net/articles/spirits-dark-forest) to trust-scoped coordination across teams. We mostly want a membrane to do two things at once. It **mediates context availability**: deciding what context a turn can reach, and at what granularity, since retrieving across the depth of subgraphs sets how coarse or fine it is (see [[fractal-composition]]). And it is a **coordination surface**: agents that share a membrane coordinate through it — each one's writes change the coupled region the others retrieve from next, so they align by acting on shared state rather than by messaging each other.

## Membranes over membranes

A membrane is not a cluster. Clusters partition: each node lands in one group. Membranes nest and overlap — one can sit inside another, and two can share frames without either containing the other. A membrane need not be semantically coherent: co-activation defines it, not similarity, so one can span diverse regions of the substrate, holding frames pulled together by use rather than by meaning. An agent's active context, a project's working set, and a team's shared region are membranes at different [[scale|scales]], drawn at the same moment over overlapping material. The object of study is membranes over membranes: boundaries layered and crossing, not tiles.

## How a membrane is defined

Membranes are established over the continuous evolution of the graph, not minted in discrete steps. Whenever context is retrieved from the substrate, the membrane is the region picked out by the current coupling density — the dense neighbourhood the retrieval draws on, set off against the sparser coupling around it. Co-attention — an agent reading, then writing, over a set of frames — feeds that density back: it strengthens the coupling across the frames it draws together (the rule we currently use is Hebbian — build on co-activation, decay otherwise), and sets the requisite variety inside the boundary: how much, and how varied, the context in play is (cf. [[frame-type-diversity]]).

That variety is the intervention surface. Context width bounds what an agent can do: narrow context, limited reasoning and limited agency; broader inputs, broader reasoning and more room to act. So modulating the variety — the size and density of a membrane — is how we act on the agents inside it without touching them one by one. The same boundary makes their state legible from outside: read the membrane and you read what the agents have to work with. The agent acts — acting is closing the loop, writing back — and the next retrieval re-draws the boundary at the coupling density it then finds. Read and write are the same event class: both feed coupling. Decay runs against coupling and closes the channels again; without it a membrane would lock open and never reset.

<Figure id="membrane-aperture" />

## What a membrane regulates

A membrane regulates two axes, and the work here can read it through either.

- **Density.** A membrane modulates the density of flow through its channels — the requisite variety crossing in and out — and through that the capacity to act. On this reading, disclosure policies and decision rights are emergent rather than primitive: the boundary's permeability and the variety it admits produce an effective distribution of disclosure and authority, instead of that distribution being assigned agent by agent.
- **Access.** A membrane is semipermeable in the access-control sense — scoped, caveated, revertible exchange: who may pass which channel, granted in small reversible amounts. This is the reading developed in *Mythic Membranes* by [Kenneth Bruskiewicz](https://www.linkedin.com/in/kenneth-bruskiewicz) and [Christina Bowen](https://www.knowledgeecologist.me/) ([Atlas Research Group](https://atlasresear.ch)).

The two are complementary — one gates how much, the other gates who. The open question is which axis dominates for which problem, and whether they are two views of one gating mechanism or two mechanisms sharing a boundary.

## Open Questions

- What sets a channel's threshold — the size and permeability a membrane should have for a task, the same unsettled referent as [[task-appropriate-behavior]].
- How to measure a membrane's permeability, and the variety it admits.
- How nesting and overlap interact with any [[gini-coefficient|metric]] read over a membrane: the boundary drawn is the population measured.

<Related tags="membrane, substrate" />
