# Frame-Semantic Graph Construction for Knowledge Substrates

**Julian Fleck** — Atlas Research Group
arXiv preprint (cs.IR / cs.AI) · Draft outline v1 · June 2026

---

## Abstract (draft)

Knowledge representation for machine intelligence remains caught between rigid hand-crafted ontologies that cannot adapt to natural language and flat representations (text chunks, extracted facts, entity graphs) that discard argumentative structure. We introduce a frame-semantic approach to knowledge graph construction where structure emerges from content rather than being imposed on it. Every knowledge unit is a typed frame instance with named slots that set expectations about what should relate to it. Frames compose recursively along two axes: structurally (paragraph → section → document) and semantically (claim + evidence + source → argument support structure), with semantic composition crossing document boundaries. Slot expectations yield a structural confidence measure independent of extraction confidence: population completeness, filler type match, and reference resolution propagate recursively through the composition hierarchy. We describe a five-stage extraction pipeline using LLM-based frame instantiation guided by a self-extending schema registry, and evaluate the resulting graphs on provenance traversal depth, multi-scale retrieval, and explanation subgraph generation — structural capabilities that neither flat retrieval nor fixed ontologies support.

---

## 1. Introduction

### 1.1 The knowledge representation gap

The question of how to represent knowledge for machine use is fifty years old (Minsky, 1974; Fillmore, 1976) and still unresolved. The systems that dominate practice in 2026 cluster around three approaches, each trading off structure against adaptability:

**Fixed ontologies** (OWL, RDFS, Cyc, domain-specific schemas). The Semantic Web programme demonstrated that rich relational structure enables powerful reasoning — inference over typed relationships, class hierarchies, property constraints. These are real capabilities that flat systems cannot replicate. But the programme also demonstrated the cost: ontologies must be designed before content arrives, maintained as domains evolve, and agreed upon across communities. Cyc spent decades hand-coding common-sense knowledge and never reached coverage sufficient for open-domain use. OWL ontologies in practice tend toward one of two failure modes — either too coarse to capture the distinctions that matter in a specific domain, or too fine-grained to maintain as the domain changes. The deeper issue is that ontological categories are imposed *on* content rather than discovered *from* it. When a document makes a novel claim that crosscuts existing categories, a fixed ontology either forces it into an ill-fitting class or requires schema revision — and schema revision in a deployed system is expensive, slow, and politically fraught. The knowledge representation problem is not that structure is undesirable (it clearly is desirable); it is that hand-crafted structure does not scale to the variety of natural language or the pace at which domains evolve.

**Flat retrieval** (RAG, vector search over chunks). Scales effortlessly: embed text, store vectors, retrieve by similarity. But chunks are structureless — a retrieved passage carries no information about whether it is a claim, its evidence, a counterargument, or a definition. The passage's role in its surrounding argument is lost at chunking time and cannot be recovered at retrieval time.

**The current generation of AI memory systems** occupies a middle ground that is rapidly converging. Mem0 extracts facts from conversations via LLM and stores them as retrievable units with hybrid search (semantic + BM25 + entity matching). Zep builds entity-fact-episode graphs with temporal validity windows. Letta (formerly MemGPT) manages tiered memory (core/archival/recall) with self-editing capabilities. Microsoft's GraphRAG extracts entities, detects communities, and generates hierarchical summaries. By early 2026, graph-based memory has moved from experimental to production — 13 agent frameworks support graph memory integrations. All of these systems solve the persistence problem. But they represent knowledge as flat facts (Mem0), entity-relationship triples (Zep, GraphRAG), or managed text blocks (Letta). None preserves the *argumentative structure* of the source material.

**"Context graphs"** — a term gaining traction after Gupta and Garg's (2025) viral analysis — point at a real gap but address only a narrow slice of it. Their thesis: AI is held back not by better models but by missing *decision provenance* — the exceptions, approvals, and rationale that live in people's heads rather than systems of record. A context graph, in their framing, is the accumulated structure of decision traces stitched across entities and time. This is genuinely important for enterprise autonomy. But decision provenance is one specific kind of structured knowledge. A system that captures *why a discount was approved* still cannot represent *why a scientific claim is supported by this evidence but contradicted by that study*. The argumentative structure of knowledge — support, contradiction, derivation, illustration — is a broader problem that decision traces alone do not solve.

**The pragmatic default** in most agent harnesses today is simpler still: a folder of markdown files that the agent reads into its context window. CLAUDE.md, cursor rules, system prompts with pasted documentation. This works surprisingly well for small knowledge bases because the LLM can reason over the raw text — but it cannot scale, cannot be queried structurally, and carries no provenance.

### 1.2 The flattening problem

All of these approaches share a common failure mode: they flatten meaning.

| Representation | What it captures | What it loses |
|---|---|---|
| Markdown files (agent harness) | Raw text, full context (if it fits) | Scale, queryability, provenance, structure |
| Chunks (RAG) | Surface text, embedding similarity | Argumentative role, document structure, cross-document relationships |
| Facts/triples (Mem0, Zep) | Extracted assertions, entity relationships, temporal validity | Argumentative structure, composition, multi-scale representation |
| Entity graphs (GraphRAG) | Named entities, co-occurrence, community summaries | Conceptual relationships (support, contradiction), granularity, provenance chains |
| Context graphs (Gupta & Garg) | Decision traces, exception provenance, approval chains | General argumentative structure — only captures *decisions*, not *arguments* |
| Fixed ontologies (OWL) | Rich formal structure | Adaptability, natural language variety, maintenance cost |
| Frame graphs (this work) | Typed knowledge units, semantic relationships, recursive composition, multi-scale representation, structural confidence | — |

**Claim:** A knowledge graph that preserves *conceptual topology* — how ideas nest, support, contradict, and change character across scales — enables capabilities that structurally cannot emerge from flat representations. The question is whether such structure can be acquired from natural language at scale without the brittleness of hand-crafted ontologies. We argue that LLM-based frame instantiation, guided by adaptive schemas, makes this possible.

*Figure 1: The flattening problem. Same source document represented as (a) markdown file, (b) chunks, (c) entity graph with facts, (d) frame graph. Annotate what is preserved and lost at each level.*

---

## 2. Frames as Knowledge Primitives

### 2.1 Theoretical grounding

Frame semantics (Fillmore, 1976): linguistic structures carrying expectations about participants, roles, and relationships. A "Commercial Transaction" frame expects a Buyer, Seller, Goods, Money — encountering any participant activates expectations about the others.

Frames for knowledge representation (Minsky, 1975): stereotyped situations with default values and inheritance hierarchies. Knowledge as structured expectations, not flat assertions.

### 2.2 Why frames failed (GOFAI) and why they work now

Failed: hand-coded, brittle, didn't scale. Cyc's million-rule approach couldn't keep up with the variety of natural language.

Work now: LLMs instantiate frames from natural language at extraction time. The schema defines the *shape* of knowledge (a Claim has Evidence, a Method has Steps); the LLM fills the shape from content. Scale is no longer the bottleneck — LLM inference is.

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

Slots are typed: they expect specific frame types or literal values as fillers. This makes the graph *queryable by structure*, not just by content similarity.

*Figure 2: A concrete frame instance with slots pointing to other frames. Show the typed relationships.*

---

## 3. Recursive Composition

The key architectural move. Composition operates at two levels simultaneously: structural and semantic.

### 3.1 Structural composition

A paragraph yields frames (claims, evidence, observations). A section is itself a frame whose children are those paragraph-level frames. A document is a frame whose children are sections. A corpus is a frame whose children are documents. This gives multi-scale representation: the same idea is findable at sentence granularity or document granularity, and navigation between scales preserves the traversal path.

### 3.2 Semantic composition

More importantly, frames compose by *argumentative role*, not just by document position. A `claim` frame, its `supporting_evidence` frames, and their `source_attribution` frames compose into an `argument_support_structure` — a higher-order frame whose slots are the participants in a pattern of reasoning. This is not imposed by document structure; a claim in section 2 can be supported by evidence in section 5 of a different document.

The meta-structure frame types capture these semantic compositions:

- **`argument_support_structure`**: claim + evidence + sources — the basic unit of supported assertion
- **`argumentation_structure`**: thesis + multiple arguments + counterarguments — a complete argumentative arc
- **`problem_solution_structure`**: problem statement + method + evidence of solution
- **`example_illustration_structure`**: abstract principle + concrete instances

These higher-order frames are themselves frames with typed slots — and the slots carry expectations. An `argumentation_structure` expects a `thesis` slot (filled by a `thesis` frame), `supporting_arguments` (filled by `argument_support_structure` frames), and `counterarguments` (filled by `critique` frames). Each slot specifies whether it is required or optional, whether it accepts a single filler or a list, and what frame types qualify as fillers.

**Slot expectations as confidence instrument.** This gives us a structural measure of confidence that is independent of the LLM's extraction confidence score. A frame's confidence is a function of how well its slots are populated:

- **Slot resolution**: Do the expected slots have fillers? An `argument_support_structure` with a `claim` but no `evidence` slot filled is structurally incomplete — lower confidence regardless of how confident the extractor was about the claim itself.
- **Filler type match**: Do the fillers match the expected types? A `supporting_arguments` slot filled with `observation` frames rather than `argument_support_structure` frames is a type mismatch — the structure is populated but not with the right kind of content.
- **Reference resolution**: Do slot references actually resolve to existing frames in the graph? A `source` slot pointing to a `source_attribution` frame that itself has a resolved `source_span` (character offsets in the original document) carries higher confidence than a dangling reference.
- **Recursive confidence**: A higher-order frame's confidence propagates from its children. An `argumentation_structure` whose `supporting_arguments` are themselves well-populated `argument_support_structures` with resolved evidence chains is structurally sound in a way that no single-frame confidence score can capture.

This is directly from Minsky: "A frame's terminals are normally already filled with 'default' assignments... these are attached loosely to their terminals, so that they can be easily displaced by new items that fit better the current situation" (Minsky, 1974). In our system, unfilled slots retain schema-level defaults (marking what *should* be there), and the gap between expected and actual population is itself a measurable signal — both for extraction quality and for the completeness of the knowledge the graph represents.

The composition is recursive: an argumentation structure can participate as evidence in a higher-level argument, and its confidence propagates upward.

This is Minsky's frame-systems applied at the semantic level: "collections of related frames are linked together into frame-systems" where "the effects of important actions are mirrored by transformations between the frames of a system" (Minsky, 1974). In our case, the "actions" are argumentative moves — supporting, contradicting, illustrating — and the frame-system captures the pattern of reasoning, not just the text that expressed it.

### 3.3 Why both levels matter

Structural composition enables **multi-scale retrieval** (find the right granularity). Semantic composition enables **reasoning-aware retrieval** (find the argument, not just the text). A query like "what evidence contradicts X?" requires semantic composition — the system must know which frames play the role of evidence, which play the role of contradiction, and how they relate to X. Structural nesting alone cannot answer this.

**Dual embeddings:** each frame is embedded twice — once from its raw content, once from its summary. This gives two search surfaces at different abstraction levels without maintaining separate indexes.

*Figure 3: Two axes of composition. (a) Structural: document → section → paragraph → sentence, with parent-child links. (b) Semantic: claim + evidence + source → argument_support_structure → argumentation_structure, with typed role links. Show a concrete example where the semantic structure crosses document boundaries.*

---

## 4. Extraction Pipeline

Five stages from document to indexed graph.

### 4.1 Ingestion and deduplication
Content hashing (SHA-256). Metadata extraction (frontmatter + LLM enrichment for unstructured documents).

### 4.2 Hierarchical parsing
Detect document structure (headings, sections). Build section hierarchy. Preserve character-level source spans for provenance.

### 4.3 Frame extraction
Per-section LLM extraction. Schema descriptions provided as structured output specification. Context injection from surrounding sections, document metadata, pre-extracted entities. Retry with graceful degradation (shrink context window, then content window).

**52 frame types** across 9 categories: document-level (10), content (20), meta-structure (4), reasoning (9), academic (5), narrative/personal/entity (4+).

### 4.4 Relationship assignment
Semantic relationship selection based on frame type pairs. 19 semantic types (SUPPORTS, CITES, ILLUSTRATES, IMPLIES, ARGUES_FOR, CONTRADICTS, ...) and 8 structural types (HAS_CHILD, REFERENCES, INSTANCE_OF, ...). Assignment is config-driven: child frame type → {default relationship, parent-type overrides}.

### 4.5 Embedding and indexing
Dual embeddings per frame (raw content + summary) using frame-type-aware prefixes. Vector indexes in the graph database for hybrid semantic + structural search.

*Figure 4: The pipeline. A concrete document passing through all five stages. Show intermediate representations at each stage.*

---

## 5. Executable Operations and Self-Extension

### 5.1 Operations as frames (homoiconicity)

In most knowledge systems, the data and the operations on that data live in separate layers — content in the database, queries and transformations in application code. Frame-semantic graphs collapse this separation, following the principle Minsky sketched and Lisp made concrete: operations are data.

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

This means:
- Operations are inspectable graph elements, not hidden application logic
- An agent can query the registry to find all operations applicable to a given frame type — a `claim` frame advertises that "find supporting evidence," "generate counterargument," and "expand into sub-claims" are available moves
- Operations compose: a meta-operation can chain "find related" → "compare" → "summarize differences"
- The system can reason about its own capabilities because those capabilities are represented in the same framework as the knowledge they operate on

### 5.2 Frame types as traversal instructions

Each frame type carries implicit traversal semantics through its slot structure. A `claim` frame with an `evidence` slot that expects `supporting_evidence` frames is not just a container — it is a traversal instruction: "from here, you can follow the evidence relationship to find what grounds this claim." A `supporting_evidence` frame with a `source` slot that expects `source_attribution` frames continues the instruction: "from here, you can follow the source relationship to find where this evidence came from."

The graph is not traversed by generic graph algorithms applied uniformly. It is traversed by following the expectations encoded in the frame types themselves. A `claim` suggests different traversals than a `method` or a `definition`. The frame type *is* the traversal instruction.

This has a concrete consequence for agents: when an agent encounters a frame, it does not need external instructions about what to do next. The frame's schema tells it:
- What slots are expected (and which are unfilled — potential next actions)
- What operations apply to this frame type (from the executable operation registry)
- What frame types those operations will produce (enabling lookahead)

The workflow becomes: encounter frame → inspect type → discover applicable operations → choose → execute → produce new frames → repeat. This is agentic without being prescriptive: the system suggests, the agent (or human) decides, the system executes.

### 5.3 Self-extending registry

Frame type definitions and operation definitions are themselves stored as frames in the graph, not in application code. This creates a self-extending system:

- The LLM can propose new frame types at extraction time when content doesn't fit existing schemas
- New operation types can be registered by composing existing operations
- Definitions are hot-reloadable — adding a schema immediately makes it available to the extraction pipeline
- The system's vocabulary for knowledge *and for actions on knowledge* grows with the knowledge it processes

This is the self-bootstrapping property: the system that extracts and organizes knowledge can extend its own vocabulary for extraction and organization. Frame schemas define knowledge structure; executable operation schemas define what can be done with that knowledge; both live on the graph and both evolve.

*Figure 5: Homoiconicity. (a) A frame type definition stored as a frame in the graph it describes. (b) An executable operation defined as a frame, with `applies_to` linking it to the frame types it can act on. (c) An agent discovering applicable operations by inspecting a frame's type and querying the operation registry.*

---

## 6. Evaluation

The contribution is structural: recursive frame composition enables capabilities that flat representations cannot support. We evaluate three such capabilities.

### 6.1 Provenance traversal depth

**Setup:** Ingest a test corpus. For each retrieved result, attempt to trace the provenance chain back to source material.

**Measure:** Maximum traversal depth (hops from retrieved frame to source document span).

| System | Expected depth |
|---|---|
| Vanilla RAG | 0 (chunk is terminal) |
| GraphRAG (entities) | 1 (entity → co-occurring entity) |
| Frame graph | 3-5 (claim → evidence → source_attribution → source_span → document) |

**What this tests:** Can a reviewing principal inspect *why* the system retrieved this result? Provenance depth is a prerequisite for trustworthy retrieval.

### 6.2 Multi-scale retrieval

**Setup:** Same corpus, same queries at two granularity levels: "What does this corpus say about X?" (document-level) and "What specific evidence supports X?" (sentence-level).

**Measure:** Whether both granularities are answerable from the same index. Response relevance at each scale (human evaluation).

**What this tests:** Recursive composition gives multi-scale retrieval without maintaining separate indexes. Flat representations require re-chunking or separate summarization pipelines for different granularities.

### 6.3 Explanation subgraphs

**Setup:** Given a system output ("The corpus suggests X"), request an explanation: "Show me why." The system produces a subgraph: the claim, its supporting frames, their sources, and any contradicting frames.

**Measure:** Subgraph completeness (does it include all relevant supporting/contradicting evidence?), coherence (do the relationships form a valid argument structure?), and compactness (how much irrelevant material is included?).

**What this tests:** The graph is *legible*, not just queryable. A human reviewer can inspect the reasoning structure, not just the output. This is the observability argument — and the bridge to downstream substrate dynamics work.

### 6.4 Baselines and test corpus

**Baselines:** Vanilla RAG (LangChain-style chunking + vector search), Microsoft GraphRAG (entity extraction + community summarization), LightRAG (lightweight graph-augmented retrieval).

**Test corpus:** [TBD — options: academic papers in a specific domain, technical documentation, the author's own published writing corpus. The last option is meta but demonstrates real-world usage on a corpus the author knows intimately.]

**Open questions for collaborators:**
- What additional structural metrics should we measure?
- Are there existing benchmarks that test provenance or multi-scale retrieval specifically? (Most RAG benchmarks test answer accuracy, not structural properties.)
- What corpus characteristics would make the evaluation most convincing? (Highly structured academic text vs messy real-world documents vs mixed?)
- Should we include an ablation: frame graph without recursive composition (flat typed frames) vs with recursion? This would isolate the contribution of nesting.

---

## 7. What This Enables Downstream (and What It Doesn't Address)

**Enables:**
- Provenance chains (claim → evidence → source) for trustworthy retrieval
- Multi-scale retrieval from a single representation
- Mode-aware retrieval (different query stances activate different traversal patterns)
- Recursive retrieval (retrieve → assess → go deeper/broader)
- Explanation subgraphs for human review

**Does not address:**
- How the graph evolves under sustained multi-agent use (substrate dynamics)
- Attention, decay, and coupling mechanics over the graph
- Convergence detection and divergence interventions
- Membranes between graph regions

These are the subject of companion work on substrate dynamics, which treats the frame graph described here as its base layer.

---

## 8. Related Work

- Fillmore (1976) — Frame semantics
- Minsky (1975) — Frames for knowledge representation
- Lewis et al. (2020) — RAG: Retrieval-Augmented Generation
- Edge et al. (2024) — GraphRAG: entity graphs + community summarization
- Guo et al. (2024) — LightRAG: lightweight graph-augmented retrieval
- Sarthi et al. (2024) — RAPTOR: recursive abstractive processing for tree-organized retrieval
- Gutierrez et al. (2024) — HippoRAG: neurobiologically inspired long-term memory for LLMs
- Goldberg (2006) — Construction Grammar (frame-adjacent linguistic theory)
- RDF/OWL — semantic web knowledge representation (and why this work differs: emergent vs. ontology-first)
- Cole (2024) — Activity flow models: modelling activation propagation over empirical connections (neuroscience analogue)

---

## Figures Summary

| # | Content | Purpose |
|---|---|---|
| 1 | The flattening problem: chunks vs entities vs frames | Motivate the contribution |
| 2 | Frame anatomy: concrete instance with typed slots | Define the primitive |
| 3 | Recursive composition: multi-scale tree with cross-links | Key architectural move |
| 4 | Extraction pipeline: document through five stages | Technical core |
| 5 | Self-bootstrapping: frame type as frame | Meta-capability |
| 6 | Comparison table: RAG vs GraphRAG vs frame-semantic graph | Position the work |

---

## Open Questions (for Atlas discussion)

1. **Evaluation metrics**: What structural properties beyond provenance depth, multi-scale retrieval, and explanation subgraphs should we measure? Are there existing benchmarks we should use?
2. **Ablation design**: Flat typed frames (no recursion) vs recursive composition — is this the right ablation to isolate the nesting contribution?
3. **Corpus selection**: Academic papers, technical documentation, or mixed real-world documents? What makes the evaluation most convincing?
4. **Scope of self-bootstrapping claims**: The registry is dynamic in the implementation. How much space does this deserve in the paper — a full section or a subsection?
5. **Positioning vs RAPTOR**: RAPTOR also builds recursive tree structures. The difference is that RAPTOR recursively summarizes (lossy compression) while frame graphs recursively compose (preserving typed relationships). Is this distinction clear enough?
