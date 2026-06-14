---
title: Frame-Semantic Graph Construction for Knowledge Substrates
description: Building typed, recursively-composable knowledge graphs from text — the construction layer beneath the substrate-dynamics work.
date: 2026-06-11
series: Papers
order: 1
show: true
status: draft
version: 1
author: Julian Fleck
tags: [substrate, frame-semantics, construction]
---

## Abstract

Knowledge representation for machine use is caught between two poles: hand-crafted ontologies too rigid for natural language, and flat representations — text chunks, extracted facts, entity graphs — that discard the structure of the arguments they came from. We describe a frame-semantic approach to knowledge graph construction in which structure is discovered from content rather than imposed on it. Every knowledge unit is a typed frame instance whose named slots set expectations about what should relate to it. Frames compose recursively along two axes: structurally (paragraph → section → document) and semantically (claim + evidence + source → argument support structure), with semantic composition free to cross document boundaries. Slot expectations double as a confidence instrument independent of extraction confidence: slot population, filler type match, and reference resolution propagate through the composition hierarchy. Because frame schemas and the operations on frames are themselves stored as frames, each node carries instructions for how it can be traversed and computed, and the schema registry extends itself as new content arrives. We describe a five-stage extraction pipeline and evaluate the resulting graphs on provenance traversal depth, multi-scale retrieval, and explanation subgraph generation — structural capabilities that neither flat retrieval nor fixed ontologies support.

---

## Definitions

A few terms recur throughout; the sections develop them, and this is the quick reference.

- **Frame** — the primitive: a typed unit of knowledge with named slots filled from content. A frame can be as small as a sentence-level claim or as large as a whole document, and frames nest.
- **Frame type (schema)** — the template a frame instantiates: a named kind of knowledge unit (`claim`, `evidence`, `method`, ...) declaring which slots to expect and what may fill them. Types live in a registry, not in application code.
- **Slot** — a named, typed relationship on a frame, expecting a particular filler (a frame of some type, or a literal). Typed slots make the graph queryable by structure, not only by similarity; an unfilled slot carries a default and marks what is missing.
- **Relationship (edge)** — a typed link between frames (`SUPPORTS`, `CONTRADICTS`, `HAS_CHILD`, ...), assigned as frames are extracted and grounded in the frame type's own expectations.
- **Composition** — frames combine along two axes: **structurally** (paragraph → section → document) and **semantically** (claim + evidence + source → argument support structure). Semantic composition may cross document boundaries.
- **Registry** — the store of frame type and operation definitions, itself held as frames on the graph. It is self-extending: new types can be proposed at extraction time.
- **Traversal instruction** — the navigation semantics a frame type carries through its slot structure: which relationships it expects, and toward which types. The same per-type expectations that lay down edges also guide how the graph is later traversed (Section 5).

---

## 1. Introduction

### 1.1 The knowledge representation gap

Representing knowledge so a machine can use it is among the oldest problems in the field, with a long lineage: predicate logic (Frege, Russell), the frame systems of early AI (Minsky, 1974), frame semantics in linguistics (Fillmore, 1976), the semantic web (RDF, OWL). None of it settled the question. The representations in common use in 2026 still force a choice between structure and adaptability — structure rich enough to reason over but hand-built, or representations that scale but discard it. We build on frame semantics because a frame carries both: it declares the typed roles it expects and binds them to what fills those roles, and frames nest into larger frames. The approaches below each show one form of the trade.

**Fixed ontologies** (OWL, RDFS, Cyc, domain schemas). The Semantic Web programme showed that rich relational structure supports real reasoning: inference over typed relationships, class hierarchies, property constraints. It also showed what that structure costs. An ontology has to be designed before the content arrives and maintained as the domain moves. Cyc spent decades hand-coding common-sense knowledge without reaching the coverage needed for open-domain use. Deployed OWL ontologies tend toward one of two failure modes: too coarse to capture the distinctions that matter in a domain, or so fine-grained that nobody can maintain them as the domain changes. Underneath both failures is the same issue — the categories are imposed on content rather than discovered from it. When a document makes a claim that crosscuts the existing classes, the ontology either forces it into an ill-fitting one or demands schema revision, and schema revision in a deployed system is slow and politically fraught. The problem with hand-crafted structure is not that structure is undesirable. It is that hand-crafting does not scale to the variety of natural language or the pace at which domains evolve.

**Flat retrieval** (RAG, vector search over chunks). Scales without effort: embed text, store vectors, retrieve by similarity. But a retrieved chunk carries no record of the role it played in its source — whether it stated a claim, supplied evidence for one, or argued against one. That role is destroyed at chunking time and cannot be reconstructed at retrieval time.

**AI memory systems** occupy the middle ground, and the space is crowded. Dozens of systems now persist agent knowledge across sessions, clustering into a few representational families: extracted fact stores behind hybrid search (Mem0 is representative), entity–fact–episode graphs with temporal validity (Zep), tiered memory blocks the agent edits itself (Letta, formerly MemGPT), and entity graphs with community summarization (Microsoft's GraphRAG). Graph-based memory has moved from experimental to production over the past year, and most agent frameworks now ship integrations for it. These systems solve persistence. What they store, though, is flat: facts, triples, or managed text blocks. Across the family boundaries, none preserves the argumentative structure of the source material.

**Context graphs** picked up attention after Gupta and Garg's (2025) widely circulated essay. Their thesis: what holds enterprise AI back is not model capability but missing decision provenance — the exceptions, approvals, and rationale that live in people's heads instead of systems of record. A context graph, in their framing, accumulates decision traces across entities and time. The diagnosis points at something real, but decision provenance is just one narrow kind of structured knowledge. A system that records why a discount was approved still cannot represent why a scientific claim is supported by one study and contradicted by another. Support, contradiction, derivation, illustration — the structure of arguments — is a broader problem than the structure of decisions.

**The pragmatic default**, meanwhile, is none of the above: most agent harnesses in 2026 run on a folder of markdown files read into the context window — CLAUDE.md, cursor rules, system prompts. For a single agent this works well; the model reasons over raw text. It breaks under multi-agent orchestration (LangGraph, CrewAI, AutoGen): a flat-file store has no structure to mediate concurrent write-back — no record of what role a fragment plays, who wrote it, or how it relates to another agent's. What holds up under one agent degrades as write-back velocity rises.

### 1.2 Flat representations

These approaches differ widely but share one shortfall: each loses the structure of the source — what is a claim, what supports it, what contradicts it.

| Representation | What it captures | What it loses |
|---|---|---|
| Markdown files (agent harness) | Raw text, full context (if it fits) | Scale, queryability, provenance, structure |
| Chunks (RAG) | Surface text, embedding similarity | Argumentative role, document structure, cross-document relationships |
| Facts/triples (memory systems) | Extracted assertions, entity relationships, temporal validity | Argumentative structure, composition, multi-scale representation |
| Entity graphs (GraphRAG) | Named entities, co-occurrence, community summaries | Conceptual relationships (support, contradiction), granularity, provenance chains |
| Context graphs (Gupta & Garg) | Decision traces, exception provenance, approval chains | Argument structure — decisions are captured, arguments are not |
| Fixed ontologies (OWL) | Rich formal structure | Adaptability, natural language variety, maintainability |
| Frame graphs (this work) | Typed knowledge units, semantic relationships, recursive composition, multi-scale representation, structural confidence | Cheap construction — extraction costs LLM inference per document, and structure quality is bounded by extraction quality |

**Claim:** A knowledge graph that preserves conceptual topology — how ideas nest, support, contradict, and change character across scales — supports capabilities that cannot be recovered from flat representations after the fact. The open question is whether such structure can be acquired from natural language at scale without inheriting the brittleness of hand-crafted ontologies. We argue that LLM-based frame instantiation, guided by adaptive schemas, makes this possible.

### 1.3 Implementation context and naming

The approach described here is implemented in a knowledge-graph system in production use and in a research substrate sharing the same core architecture. Both carry the name RAGE. The acronym has evolved with the work: it began as *Recursive Agentic Graph Embeddings*, a retrieval architecture extending GraphRAG, and has shifted toward *Recursive Attention-Guided Exploration* as the focus moved from retrieval to the dynamics of the substrate itself. The shift traces the boundary of this paper. Graph construction — how frame graphs are built and what their structure makes possible — is the subject here. What happens to such a graph under sustained multi-agent use belongs to a companion research programme (Section 7).

---

## 2. Frames as primitives

### 2.1 Theoretical grounding

Frame semantics (Fillmore, 1976): linguistic structures carrying expectations about participants, roles, and relationships. A "Commercial Transaction" frame expects a Buyer, Seller, Goods, Money — encountering any participant activates expectations about the others.

Frames for knowledge representation (Minsky, 1974): stereotyped situations with default values and inheritance hierarchies. Knowledge as structured expectation rather than flat assertion.

### 2.2 Frames then and now

Failed then: hand-coded and brittle. Cyc's million-rule effort could not keep up with the variety of natural language.

Work now: LLMs instantiate frames from natural language at extraction time. The schema defines the shape of knowledge (a Claim has Evidence; a Method has Steps); the model fills the shape from content. The bottleneck has moved from knowledge-engineering labour to inference cost — a constraint that eases each year rather than one that compounds.

### 2.3 Frame anatomy

A frame instance:

```
schema_id:    "claim"
slots:
  text:       "Retrieval-augmented systems lose argumentative structure"
  evidence:   → [frame: supporting_evidence_01, frame: supporting_evidence_02]
  source:     → [frame: source_attribution_01]
  implies:    → [frame: implication_01]
confidence:   0.87
source_span:  [1204, 1298]   # character offsets in source document
```

Slots are typed: they expect specific frame types or literal values as fillers. Typed slots make the graph queryable by structure as well as by similarity.

*Figure 1: A concrete frame instance with slots pointing to other frames. Show the typed relationships.*

---

## 3. Recursive Composition

Composition is the central architectural move, and it operates on two axes at once.

### 3.1 Structural composition

A paragraph yields frames (claims, evidence, observations). A section is itself a frame whose children are those paragraph-level frames. A document is a frame whose children are sections; a corpus, a frame whose children are documents. This gives multi-scale representation: the same idea is findable at sentence granularity or document granularity, and navigation between scales preserves the traversal path.

### 3.2 Semantic composition

The semantic axis carries more weight. Frames compose by *argumentative role*, independent of document position. A `claim` frame, its `supporting_evidence` frames, and their `source_attribution` frames compose into an `argument_support_structure` — a higher-order frame whose slots are the participants in a pattern of reasoning. Document structure does not dictate this; a claim in section 2 can be supported by evidence in section 5 of a different document.

The meta-structure frame types capture these semantic compositions:

- **`argument_support_structure`**: claim + evidence + sources — the basic unit of supported assertion
- **`argumentation_structure`**: thesis + multiple arguments + counterarguments — a complete argumentative arc
- **`problem_solution_structure`**: problem statement + method + evidence of solution
- **`example_illustration_structure`**: abstract principle + concrete instances

These higher-order frames are themselves frames with typed slots, and the slots carry expectations. An `argumentation_structure` expects a `thesis` slot (filled by a `thesis` frame), `supporting_arguments` (filled by `argument_support_structure` frames), and `counterarguments` (filled by `critique` frames). Each slot specifies whether it is required or optional, whether it accepts a single filler or a list, and what frame types qualify as fillers.

**Slot expectations as confidence instrument.** Slot expectations give us a structural measure of confidence, independent of the LLM's extraction confidence score. A frame's confidence is a function of how well its slots are populated:

- **Slot resolution**: Do the expected slots have fillers? An `argument_support_structure` with a `claim` but no `evidence` is structurally incomplete — lower confidence regardless of how confident the extractor was about the claim itself.
- **Filler type match**: Do the fillers match the expected types? A `supporting_arguments` slot filled with `observation` frames rather than `argument_support_structure` frames is populated, but with the wrong kind of content.
- **Reference resolution**: Do slot references resolve to existing frames? A `source` slot pointing to a `source_attribution` frame that itself carries a resolved `source_span` warrants more confidence than a dangling reference.
- **Recursive confidence**: A higher-order frame inherits from its children. An `argumentation_structure` whose `supporting_arguments` are themselves well-populated, with resolved evidence chains, is structurally sound in a way no single-frame score can capture.

This is directly from Minsky: "A frame's terminals are normally already filled with 'default' assignments... these are attached loosely to their terminals, so that they can be easily displaced by new items that fit better the current situation" (Minsky, 1974). In our system, unfilled slots retain schema-level defaults marking what *should* be there, and the gap between expected and actual population is itself a measurable signal — of extraction quality, and of how complete the knowledge in the graph actually is.

The composition is recursive: an argumentation structure can participate as evidence in a higher-level argument, and its confidence propagates upward.

This is Minsky's frame-systems applied at the semantic level: "collections of related frames are linked together into frame-systems" where "the effects of important actions are mirrored by transformations between the frames of a system" (Minsky, 1974). In our case the actions are argumentative moves — supporting, contradicting, illustrating — and the frame-system captures the pattern of reasoning rather than the text that happened to express it.

### 3.3 What each axis enables

Structural composition enables **multi-scale retrieval**: find the right granularity. Semantic composition enables **reasoning-aware retrieval**: find the argument, not the text. A query like "what evidence contradicts X?" requires the semantic axis — the system must know which frames play the role of evidence, which play the role of contradiction, and how they relate to X. Structural nesting alone cannot answer it.

**Dual embeddings:** each frame is embedded twice, once from its raw content and once from its summary. Two search surfaces at different abstraction levels, no separate indexes to maintain.

*Figure 2: Two axes of composition. (a) Structural: document → section → paragraph → sentence, with parent-child links. (b) Semantic: claim + evidence + source → argument_support_structure → argumentation_structure, with typed role links. Show a concrete example where the semantic structure crosses document boundaries.*

---

## 4. Extraction Pipeline

Five stages from document to indexed graph.

### 4.1 Ingestion and deduplication
Content hashing (SHA-256). Metadata extraction (frontmatter + LLM enrichment for unstructured documents).

### 4.2 Hierarchical parsing
Detect document structure (headings, sections). Build section hierarchy. Preserve character-level source spans for provenance.

### 4.3 Frame extraction
Per-section LLM extraction. Schema descriptions provided as structured output specification. Context injection from surrounding sections, document metadata, pre-extracted entities. Retry with graceful degradation (shrink context window, then content window).

**52 frame types** across 9 categories: document-level (10), content (20), meta-structure (4), reasoning (9), academic (5), narrative/personal/entity (4+). These counts describe the current registry rather than an ontology commitment: extracting models can propose new types and schema amendments at ingestion time (Section 5.3), so the vocabulary is a negotiated starting point that develops with the corpus.

### 4.4 Relationship assignment
Relationships are assigned at extraction time, not by a fixed lookup table. As the model emits a frame, it also emits the typed edges that connect it — selecting a meaningful relationship (SUPPORTS, CONTRADICTS, CITES, ILLUSTRATES, ARGUES_FOR, ...) rather than a generic RELATES_TO. The relationship vocabulary is open: a suggested set of edge types guides the model, but it can introduce others, and they are stored as-is.

What grounds the selection is the frame type itself. Each type carries directional traversal semantics — which relationships it expects in which direction and the frame types it expects to find there (a `claim` expects `supporting` and `contradicting` edges toward `evidence`; a child expects a `parent` edge toward its container). The edge a frame is attached by is therefore read off the type's own expectations rather than dictated by a config keyed on type pairs. This is the construction-time face of the traversal-instruction property developed in Section 5: the same per-type expectations that guide an agent's navigation also guide how edges are laid down in the first place. (An earlier implementation did use a config table mapping child type → {default relationship, parent-type overrides}; the type-carried approach replaced it.)

### 4.5 Embedding and indexing
Dual embeddings per frame (raw content + summary) using frame-type-aware prefixes. Vector indexes in the graph database for hybrid semantic + structural search.

*Figure 3: The pipeline. A concrete document passing through all five stages. Show intermediate representations at each stage.*

---

## 5. Executable Operations and Self-Extension

### 5.1 Operations as frames (homoiconicity)

In most knowledge systems, data and the operations on that data live in separate layers — content in the database, queries and transformations in application code. Frame-semantic graphs collapse the separation, following the principle Minsky sketched and Lisp made concrete: operations are data.

Each operation — Summarize, Compare, Find Related, Expand, Generate Counterargument — is defined by an `ExecutableOperationSchema`, structurally identical to a `FrameSchema`:

```
op_id:          "expand_node_op"
label:          "Expand Node"
description:    "Finds or generates specific examples, evidence,
                 or constituent parts related to a target node"
applies_to:     ["claim", "thesis", "principle", "definition"]
input_params:   [target_node_id, expansion_type, depth]
output:         new frame instances (evidence, examples, sub-claims)
```

The consequences:
- Operations live in the graph as inspectable elements rather than in application code
- An agent can query the registry for all operations applicable to a given frame type — a `claim` frame advertises that "find supporting evidence," "generate counterargument," and "expand into sub-claims" are available moves
- Operations compose: a meta-operation can chain "find related" → "compare" → "summarize differences"
- The system can reason about its own capabilities, because those capabilities are represented in the same framework as the knowledge they operate on

### 5.2 Frame types as traversal instructions

Each frame type carries traversal semantics in its slot structure. A `claim` frame with an `evidence` slot expecting `supporting_evidence` frames is a container, but it is also an instruction: from here, the evidence relationship leads to whatever grounds this claim. A `supporting_evidence` frame with a `source` slot continues the instruction: from here, the source relationship leads to where this evidence came from.

The graph is not traversed by generic algorithms applied uniformly. It is traversed by following the expectations encoded in the frame types themselves. A `claim` suggests different moves than a `method` or a `definition`. The frame type *is* the traversal instruction — in the Lisp sense, each node carries the knowledge of how it can be computed.

For agents this has a concrete consequence: an agent encountering a frame needs no external instructions about what to do next. The frame's schema tells it which slots are expected (and which are unfilled — candidate next actions), which operations apply to this frame type, and which frame types those operations will produce. The working loop becomes: encounter frame → inspect type → discover applicable operations → choose → execute → produce new frames → repeat. The schema proposes the moves; choosing among them stays with the agent or the human.

### 5.3 Self-extending registry

Frame type definitions and operation definitions are themselves stored as frames in the graph rather than in application code. This makes the system self-extending:

- The LLM can propose new frame types at extraction time when content fits no existing schema
- New operation types can be registered by composing existing operations
- Definitions are hot-reloadable — adding a schema immediately makes it available to the extraction pipeline
- The system's vocabulary for knowledge, and for actions on knowledge, grows with the knowledge it processes

This is the self-bootstrapping property: the system that extracts and organizes knowledge can extend its own vocabulary for extraction and organization. Frame schemas define knowledge structure; executable operation schemas define what can be done with it; both live on the graph and both evolve.

*Figure 5: Homoiconicity. (a) A frame type definition stored as a frame in the graph it describes. (b) An executable operation defined as a frame, with `applies_to` linking it to the frame types it can act on. (c) An agent discovering applicable operations by inspecting a frame's type and querying the operation registry.*

---

## 6. Evaluation

The contribution is structural: recursive frame composition enables capabilities that flat representations cannot support. We evaluate three such capabilities.

### 6.1 Provenance traversal depth

**Setup:** Ingest a test corpus. For each retrieved result, attempt to trace the provenance chain back to source material.

**Measure:** Maximum traversal depth (hops from retrieved frame to source document span).

| System | Hypothesized depth |
|---|---|
| Vanilla RAG | 0 (chunk is terminal) |
| GraphRAG (entities) | 1 (entity → co-occurring entity) |
| Frame graph | 3-5 (claim → evidence → source_attribution → source_span → document) |

**What this tests:** Can a reviewing principal inspect *why* the system retrieved this result? Provenance depth is a prerequisite for trustworthy retrieval.

### 6.2 Multi-scale retrieval

**Setup:** Same corpus, same queries at two granularity levels: "What does this corpus say about X?" (document-level) and "What specific evidence supports X?" (sentence-level).

**Measure:** Whether both granularities are answerable from the same index. Response relevance at each scale (human evaluation).

**What this tests:** Recursive composition gives multi-scale retrieval without maintaining separate indexes. Flat representations require re-chunking or separate summarization pipelines per granularity.

### 6.3 Explanation subgraphs

**Setup:** Given a system output ("The corpus suggests X"), request an explanation: "Show me why." The system produces a subgraph: the claim, its supporting frames, their sources, and any contradicting frames.

**Measure:** Subgraph completeness (does it include all relevant supporting and contradicting evidence?), coherence (do the relationships form a valid argument structure?), and compactness (how much irrelevant material comes along?).

**What this tests:** Whether the graph is legible — whether a reviewer can inspect the reasoning structure rather than taking the output on faith. This is the observability argument, and the bridge to the substrate dynamics work.

### 6.4 Baselines and test corpus

**Baselines:** Vanilla RAG (LangChain-style chunking + vector search), Microsoft GraphRAG (entity extraction + community summarization), LightRAG (lightweight graph-augmented retrieval).

**Test corpus:** [TBD — options: academic papers in a specific domain, technical documentation, the author's own published writing corpus. The last option is meta but demonstrates real-world usage on a corpus the author knows intimately.]

**Open questions:**
- What additional structural metrics should we measure?
- Are there existing benchmarks that test provenance or multi-scale retrieval specifically? (Most RAG benchmarks test answer accuracy, not structural properties.)
- What corpus characteristics would make the evaluation most convincing? (Highly structured academic text, messy real-world documents, or mixed?)
- Should we include an ablation — flat typed frames against recursive composition — to isolate the contribution of nesting?

---

## 7. Downstream uses and limits

**Enables:**
- Provenance chains (claim → evidence → source) for trustworthy retrieval
- Multi-scale retrieval from a single representation
- Mode-aware retrieval (different query stances activate different traversal patterns)
- Recursive retrieval (retrieve → assess → go deeper or broader)
- Explanation subgraphs for human review

**Does not address:**
- How the graph evolves under sustained multi-agent use
- Attention, decay, and coupling mechanics over the graph
- Convergence detection and divergence interventions
- Membranes between graph regions

These questions belong to the substrate dynamics programme — the *attention-guided exploration* reading of RAGE (Section 1.3) — which treats the frame graph described here as its base layer and is being pursued as open research over the coming months.

---

## 8. Related Work

- Minsky (1974) — A Framework for Representing Knowledge (MIT AI Memo 306; reprinted in Winston, 1975)
- Fillmore (1976) — Frame semantics
- Lewis et al. (2020) — RAG: Retrieval-Augmented Generation
- Edge et al. (2024) — GraphRAG: entity graphs + community summarization
- Guo et al. (2024) — LightRAG: lightweight graph-augmented retrieval
- Sarthi et al. (2024) — RAPTOR: recursive abstractive processing for tree-organized retrieval
- Gutierrez et al. (2024) — HippoRAG: neurobiologically inspired long-term memory for LLMs
- Goldberg (2006) — Construction Grammar (frame-adjacent linguistic theory)
- RDF/OWL — semantic web knowledge representation (and where this work departs: discovered structure over ontology-first design)
- Cole (2024) — Activity flow models: activation propagation over empirical connections (neuroscience analogue for the downstream dynamics work)

---

