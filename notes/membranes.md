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
  - membrane
  - structure
show: true
---

In substrate dynamics, *membrane* is meant in the cell-biology sense: a **semipermeable boundary** — not a wall (nothing crosses) and not an open door (everything crosses). Over the substrate it is the surface drawn at a moment around a co-active region: the frames, and the agents working over them, bound more tightly to each other than to what surrounds them. A membrane is drawn and released, not a fixed group.

<Figure id="substrate-hero" margin caption="Membranes forming around co-active regions and releasing as coupling decays." />

## Constituents

A membrane encloses both the information and the actors working on it, not one or the other. And the levels are not fixed: a membrane is itself a frame — collapse a co-active region to a point and it behaves as one — while an agent is a membrane, the bounded bundle of its harness and currently retrieved context. So an agent is a frame too, one scale up. Frame, membrane, and agent are the same kind of object seen at different grain.

Because they are the same kind of object, the same mechanics run at every level — activation, coupling, resonance, decay — and the same metrics can be read over a membrane as over an atomic leaf frame (see [[fractal-composition]]). Computing that fingerprint over frames is what picks out a membrane: two agents on the same codebase fall inside one naturally, and two people with overlapping research interests are grouped just as organically — close enough on the substrate to be put in touch.

## Formation and dissolution

Membranes are established over the continuous evolution of the graph, not minted in discrete steps. Whenever context is retrieved from the substrate, the membrane is the region picked out by the current [[coupling]] density — the dense neighbourhood the retrieval draws on, set off against the sparser coupling around it.

What raises that coupling is co-attention — an agent reading, then writing, over a set of frames. It strengthens the coupling across the frames it draws together and sets the requisite variety inside the boundary: how much, and how varied, the context in play is (see also [[frame-type-diversity]]). The rule we currently use is Hebbian — build on co-activation, decay otherwise — but the underlying mechanism is still being worked out: frames carry an initial phase seeded from their content, and attention events drive them toward alignment from there, one candidate among others.

The agent acts — acting is closing the loop, writing back — and the next retrieval re-draws the boundary at the coupling density it then finds. Read and write are the same event class: both feed coupling. Decay runs against coupling and lets the membrane close again; without it a membrane would lock open and never reset.

## Selective permeability

A membrane is semipermeable: its channels open and close at thresholds, so flow across the boundary is conditional, set by what has accumulated on either side. What crosses is gated on more than one dimension.

How *deep* a retrieval reaches is a threshold on [[resonance]] — the coupling frames have built by use (Hebbian) together with their semantic coherence. Resonant units are retrieved together, and nothing about the boundary privileges a reader: what retrieves can be an agent, a person, a document, a set of instructions. Held high, the threshold returns only the most resonant — the summary at the top of a subgraph; lowered, retrieval reaches deeper and more of the detail beneath it clears the bar. Concretely it is a setting in the re-ranker. The threshold is the knob behind granularity — how coarse or fine the retrieved context is (see [[fractal-composition]]).

<Figure id="membrane-permeability" margin caption="A channel in the membrane opens when retrieval clears a threshold: the summary always comes back, and the deeper the channel opens, the further into the subgraph it reads — more detail through the same channel." />

Beyond depth, a membrane regulates two axes, and the work here can read it through either.

- **Density.** A membrane modulates the density of flow through its channels — the requisite variety crossing in and out — and through that the capacity to act. On this reading, disclosure policies and decision rights are emergent rather than primitive: the boundary's permeability and the variety it admits produce an effective distribution of disclosure and authority, instead of that distribution being assigned agent by agent.
- **Access.** A membrane is semipermeable in the access-control sense — scoped, caveated, revertible exchange: who may pass which channel, granted in small reversible amounts. This is the reading developed in *Mythic Membranes* by [Kenneth Bruskiewicz](https://www.linkedin.com/in/kenneth-bruskiewicz) and [Christina Bowen](https://www.knowledgeecologist.me/) ([Atlas Research Group](https://atlasresear.ch)).

The two are complementary — one gates how much, the other gates who. The open question is which axis dominates for which problem, and whether they are two views of one gating mechanism or two mechanisms sharing a boundary.

## Nesting and overlap

A membrane is not a cluster. Clusters partition: each node lands in one group. Membranes nest and overlap — one can sit inside another, and two can share frames without either containing the other. A membrane need not be semantically coherent: co-activation defines it, not similarity, so one can span diverse regions of the substrate, holding frames pulled together by use rather than by meaning. An agent's active context, a project's working set, and a team's shared region are membranes at different [[scale|scales]], drawn at the same moment over overlapping material. The object of study is membranes over membranes: boundaries layered and crossing, not tiles.

<Figure id="membrane-nesting" margin caption="Three membranes over one field: one nested inside another, a third overlapping it — boundaries that layer and cross, not a partition into tiles." />

## Intervention and coordination

Membranes over shared substrate are an active interest across a few projects, each coming at them from a different direction — from [selectively permeable communication](https://www.julianfleck.net/articles/spirits-dark-forest) to trust-scoped coordination across teams. We mostly want a membrane to do two things at once. It **mediates context availability** — deciding what context a turn can reach, and (through [[resonance]]) at what granularity. And it is a **coordination surface** — agents that share a membrane coordinate through it: each one's writes change the coupled region the others retrieve from next, so they align by acting on shared state rather than by messaging each other.

Because an agent is itself a membrane, the rule that builds any membrane builds these too: agents that fire together wire together. Co-acting agents accumulate coupling and are drawn together; the membrane around a team is a membrane over membranes, formed from the coordinating itself, bottom-up, rather than drawn around an org chart — and decay dissolves it again once the coordinating stops.

<Figure id="membrane-coordination" margin caption="Agents are frames too: when a set of them co-acts, coupling builds and a membrane closes around them — a team that forms from the coordinating itself, then dissolves as the coupling decays." />

The membrane is also where we intervene. The variety it admits bounds what an agent can do: narrow context, limited reasoning and limited agency; broader inputs, broader reasoning and more room to act. So modulating the variety — the size and density of a membrane — is how we act on the agents inside it without touching them one by one. The same boundary makes their state legible from outside: read the membrane and you read what the agents have to work with.

## Open problems

- What sets a channel's threshold — how much [[resonance]] it takes to open one, and how far past it the channel opens — the size and permeability a membrane should have for a task, the same unsettled referent as [[task-appropriate-behavior]].
- How to measure a membrane's permeability, and the variety it admits.
- How nesting and overlap interact with any [[gini-coefficient|metric]] read over a membrane: the boundary drawn is the population measured.

<Related tags="membrane" />
