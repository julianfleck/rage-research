# Substrate Dynamics

The dominant picture of a "multi-agent AI system" is a diagram. Boxes labelled `planner`, `researcher`, `critic`, `executor`. Arrows between them. A supervisor on top. Sometimes a queue. Always, somewhere, a message bus.

It is a useful picture. It is also a picture from the previous regime.

What's actually being deployed now is closer to a population of always-on processes sharing a common context, reading and writing into each other's working memory, with no clean turn boundary anywhere in the system. Query → response → silence is giving way to something more like a tide. The diagrams have not caught up. Neither, more importantly, have the abstractions underneath them.

This essay is a working argument for what those abstractions should become. Its central claim is that the right model for the medium in which contemporary AI agents coordinate is not a graph of nodes exchanging messages, but a *continuous coupled dynamical system* — a substrate with its own physics, in which discrete-looking interactions are special cases of an underlying field. Most of the failure modes people are starting to worry about — echo, lock-in, drift, collective hallucination — live in that field and are largely invisible to anyone still inspecting the edges of a graph.

The shift is not metaphorical. It changes what counts as an observable, what counts as an intervention, and what counts as a unit of analysis. The rest of this piece is about each of those, in turn.

## From traffic to terrain

The graph view is built around a particular ontology: agents are nodes, messages are edges, coordination is traffic. To analyze the system, you read the message logs and reconstruct who said what to whom. To intervene, you change routing — add a supervisor, filter outputs, insert a checkpoint. The unit of observation is the message; the unit of intervention is the agent.

This is a fine ontology for hierarchical orchestration, where there genuinely is a planner, genuinely an edge to each worker, and genuinely a turn-based protocol. The graph is a faithful discretization of what the system does.

It is a poor ontology for anything more emergent than that.

Consider what happens when half a dozen agents share a context window, a memory store, and a long horizon. Each one is reading recent history and writing back into it. None of them is taking discrete turns in any meaningful sense; their "messages" are interleaved updates to a shared region of state. The interesting dynamics — does the group converge on a frame? does that frame survive the introduction of contradicting evidence? does the population fragment into incompatible sub-groups? — are not properties of any edge. They are properties of the medium the agents are coupled through.

The right reference class for this is not networking. It is coupled oscillators, reaction-diffusion fields, fluids. Systems where local interactions produce global structure, where the geometry of the medium shapes what travels through it, and where the natural observables are field quantities — density, gradient, phase, flow — rather than individual events. The language of dynamical systems is built for this. The language of graphs is fighting it.

The practical consequence of staying with the graph view is that everything emergent registers as noise. A subtle pull toward consensus in a group of agents looks like a series of unrelated outputs. A creeping loss of variance looks like a sequence of independent samples that happen to resemble each other. The system telegraphs its state continuously; the instruments aren't reading the channel.

## Frames, all the way down

If the medium is a field, what *is* the field made of? What gets activated, attended to, propagated?

A useful answer is: frames. Not in the everyday sense of "framing," but in something closer to the technical sense Minsky gave the term — a typed semantic unit, with slots, defaults, attached procedures, and the ability to compose. A claim, a piece of evidence, a method, a problem, a position, a decision. Whatever the content carries, plus its connective tissue.

The single most important property of a frame, for present purposes, is that it composes recursively. A paragraph is a frame. A document made of paragraphs is a frame. A working session made of documents is a frame. A long-running project that contains many sessions is a frame. A person who has run many projects is, in this view, also a frame — bigger, more dynamic, more embodied, but structurally the same kind of thing.

This sounds like an over-reach until you notice what is being collapsed: the difference between "users," "agents," "documents," and "interfaces" as separate categorical layers. The familiar architecture diagram has one rectangle labelled USER, another labelled AGENT, another labelled DOCUMENT, with separate logic threading them together. It treats those rectangles as ontologically different.

But what does each of them actually contribute, computationally? Each is a configuration of accumulated abstractions of experience. A paragraph is a small, mostly static world model frozen in language. A report is a larger one, aggregating many such fragments. An agent is a more active world model that updates as it interacts. A person is the most active and most embodied. What they share is the structural job they do; what differs is scale, dynamism, and embodiment.

Treating them as instances of one composition mechanism is what makes substrate-wide dynamics analyzable at all. Otherwise the dynamics have to be modelled separately at every layer, and properties that cut across scales — like collective drift — have no natural representation. With a recursive primitive, the substrate becomes fractal in the technical sense: the same dynamics run at every level of nesting, and a phenomenon visible at one scale can be measured at any other. There is no special-case logic for the "user layer" or the "session layer." There is one substance.

This recursive uniformity is what underwrites a particular kind of observability. A sub-agent of a sub-agent of a sub-agent that has quietly fallen into circular reasoning is invisible to an orchestrator looking only at top-level outputs; the orchestration boundary is opaque from above. The same pathology, in a substrate where every nesting level shares a primitive, shows up as a closed circuit in the field — visible regardless of depth.

## Push, not pull

Most of what gets called "AI memory" today operates on a single rhythm: query, traverse, retrieve, respond. The agent stands outside a store and reaches in. Even sophisticated systems — graph retrieval, hierarchical chunking, hybrid sparse-dense indexes — share this gesture. Retrieval is a verb. The agent decides what to ask, the store delivers what was asked.

A continuous substrate inverts the gesture.

In the substrate view, knowledge is not a store. It is a field of past activation, all of it alive at some level, with gradients of salience propagating material toward where it is needed. Attention does not summon answers; it sharpens local intensity. Action does not consume retrieved chunks; it sustains regions of the field. Context arrives pre-assembled, because the agent is already immersed in it. The verb is not *retrieve* but *attend*.

What does the difference change? Several things.

First, relevance ranking and decay swap roles. In a pull-based system, relevance is the gate: a ranking function decides what gets returned at query time. In a push-based substrate, decay is the gate: material that no one is sustaining fades, material that several agents touch stays present. The selection is continuous, distributed across the agents acting through the substrate, rather than centralized in a ranker. This makes the gate harder to game and easier to instrument — it is a property of the field, not a hidden function inside a service.

Second, coordination among agents becomes implicit. When N agents share a substrate, activation by one agent raises ambient salience for others. Decay for one is decay for the field. A group of agents working on related problems does not have to pass messages to coordinate; the shared field is doing it. This is the regime in which stigmergic coordination — agents acting on traces left in a medium, without direct communication — becomes a software-tractable phenomenon rather than a biological curiosity.

Third, the relationship between agent and medium shifts. A pull-based system delivers answers; a substrate provides cognitive context. The agent is not interrogating a store and reaching in. It is moving through a field that continuously offers material at the periphery of its attention, with the gradient sharpening or softening as the agent moves. That difference is what makes ambient coupling possible. Pull regimes synchronize on events. Push regimes synchronize on phase.

## Coupling that earns its place

The next question is where structure in the substrate comes from. Schemas, taxonomies, ontologies — the usual answers — are imposed from outside. They are useful, sometimes necessary, and entirely the wrong primitive for a substrate that has to remain responsive to use.

A better primitive is reinforcement on co-activation. Frames that are attended to or acted on together accumulate mutual influence. The strength of that influence grows with use and decays without it. Hebb's "fire together, wire together," generalized: a positive feedback loop on coupling between elements of the medium, paired with negative feedback through decay.

This is what gives the substrate a structure that earns its place. Nothing is connected because a schema said so. Things are connected because they have been used together, by agents whose use of them matters. Any graph one could draw at a given instant is a snapshot of an underlying continuous process — a freeze-frame of coupling strengths that are themselves moving.

Two consequences follow.

One is that identity becomes emergent. A frame, or an agent, accumulates a high-dimensional signature from the history of what it has been jointly activated with. Frames with similar signatures sit close in the field; agents with similar signatures can coordinate through the substrate without explicit messaging. Agents with orthogonal signatures struggle to exchange context even when nominally in the same conversation. Identity, here, is what the substrate produces, not what it requires up front.

The other is that the substrate has built-in resistance to lock-in. An attractor that no agent attends to anymore decays, regardless of how dominant it once was. This is the negative-feedback complement to the Hebbian loop, and it is the structural reason a substrate can survive the kinds of premature consensus that flatten static knowledge graphs. The medium has a forgetting curve baked into its geometry.

## The cycle as a field property

The most interesting thing a substrate can make legible is something current architectures actively obscure: the divergence/convergence cycle.

Cognition at every scale where it has been studied — neural, individual, cultural — operates through recursive cycles between divergence and convergence. Divergence: extraction, mapping, surfacing alternatives, holding multiple framings open. Convergence: evaluation, compression, stabilization on a frame, action. Neither pole is the goal. The pathology is loss of the cycle itself — getting stuck in convergence (premature closure, attractor lock-in, echo) or getting stuck in divergence (drift, chaos, failure to act).

In a graph-plus-messages model of multi-agent coordination, the cycle is at best a statistical pattern across many independent observations. You can compute output diversity after the fact. You can notice, in retrospect, that the agents all said roughly the same thing. The cycle is reconstructed from a record.

In a substrate-mediated model, the cycle is a field property. The active region of the substrate expands and contracts. Phase signatures across agents disperse and re-cohere. Gradients sharpen and flatten. Premature collective closure shows up as an active region that contracted and stayed contracted. Failure to stabilize shows up as one that never settled. Both are *observations on a thing that exists*, not statistical aggregates over things.

This is a substantial difference. It moves the cycle from something inferred (by looking at outputs after the fact) to something instrumented (by reading field state during operation). The instruments do not exist yet for AI substrates in the way they exist for, say, brain dynamics. But the conceptual move — from forensic reconstruction to embedded measurement — is the one that has to come first.

Recent empirical work on the diversity-accuracy tradeoff in reinforcement learning gives this picture an unusually crisp anchor. Multiple results now show that optimization for outcome correctness systematically narrows the distribution of model outputs, and that this loss of variance is not aesthetic — it transfers from solved problems to unsolved ones, undermining the very capacity for future problem-solving the system was trained to improve. Diversity is being lost, structurally, by mechanisms that have no instrument for noticing they are losing it. The substrate is, in part, what such an instrument could look like.

## Membranes, not folders

Once the substrate is the medium, the natural intervention surface is the medium itself.

The structure of a continuous field shows up as differential permeability — regions of higher and lower coupling, faster and slower flow, denser and sparser propagation. A *membrane*, in this sense, is exactly such a structural feature: a region of differential flow rate between two parts of the substrate.

The contrast worth holding is: folds, not folders. Folders gate by category — discrete, syntactic, identity-bound. You are in this folder or not; this document is shared or not. Folds gate by flow rate — continuous, structural, dynamic. They modulate how fast information propagates between regions, how dense the flow gets under sustained attention, how sharp the gradient across the boundary is, whether flow is symmetric or asymmetric in direction.

Folders belong to a different layer of the stack — closer to identity and access policy, which has well-established machinery. Membranes are the unit of the coordination layer, and the two are not in competition. They sit on top of each other.

What this gives is a structurally different kind of safety lever. Existing oversight is predominantly behavioral: observe outputs, intervene on outputs, constrain outputs. Substrate-level intervention is structural: observe field properties, intervene on field properties, shape the medium. No agent is overridden, no output is filtered, no supervisor inserted. The rate at which information propagates between two regions of the shared substrate changes, and the coordination dynamic between the agents coupled through that membrane changes accordingly. The intervention happens to the medium, not to the agents.

This lever runs in both directions, which is what makes it interesting. Lowering coupling between regions makes room for divergence — agents stop reinforcing each other's frames, the active field broadens, exploratory capacity returns. Raising coupling promotes convergence — shared frames accumulate, agents stabilize on a coherent position. Neither move is intrinsically good. Which one applies depends on what is currently going wrong. A network stuck in echo wants attenuation. A network unable to coordinate wants amplification. Substrate-level transparency is what would let that judgment be made before the intervention is selected, instead of after.

## What this opens

This is a sketch of an architectural commitment, not a finished system. The hard work is empirical: identifying the right field observables, building formalisms that yield small sets of order parameters meaningfully characterizing the phase of the cycle, characterizing the operators for bidirectional intervention, understanding how the signal degrades or compounds across nesting depth. The history of dynamical-systems methods, of coupled-oscillator analysis, of field-based models of distributed cognitive activity gives a usable starting toolkit. None of it is presumed to be exactly the right instrument; what is presumed is the category.

What the substrate frame opens, more than anything, is the question of where to look. As long as multi-agent AI is studied through the diagram — through which agent passed which message to which other — the most important things about it will continue to register as noise. Treat the medium as a field with its own dynamics, and the things that have been hard to measure become measurable, and the things that have been hard to intervene on become interventionable.

Worth asking, then, of any contemporary multi-agent system: what is your substrate doing right now? Where is it converging? Where is it dispersing? What does its current geometry afford, and what is it foreclosing?

Those are questions the diagrams cannot answer. They are also the questions the regime to come will be made of.
