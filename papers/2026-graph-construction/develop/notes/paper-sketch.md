# Paper Sketch: Frame-Semantic Graph Construction for Knowledge Substrates

*Working outline — not a draft. Capturing structure and key arguments.*

---

## Working Title Options

- "Frames All the Way Down: Recursive Knowledge Graphs Beyond Entity Extraction"
- "From Chunks to Substrates: Frame-Semantic Graph Construction for Persistent Knowledge"
- "Knowledge Substrates: Frame-Semantic Graphs as Infrastructure for Machine Cognition"

---

## Core Argument

Standard RAG retrieves chunks. GraphRAG adds entity co-occurrence. Both flatten meaning — chunks lose structure, entities lose the relationships between concepts that give them argumentative weight. 

This paper introduces a frame-semantic approach to knowledge graph construction where:
1. Every knowledge unit is a **typed frame instance** with named slots (not an entity node with co-occurrence edges)
2. Frames **compose recursively** — a paragraph is a frame; a section of paragraphs is a frame; a document of sections is a frame
3. Relationships are **semantically typed** (SUPPORTS, ARGUES_FOR, ILLUSTRATES — not just RELATES_TO)
4. Structure **emerges from content** rather than being imposed by schema
5. The same idea is findable as a sentence, a section, or a whole document (**multi-scale representation**)

The result is a graph that preserves conceptual topology — how ideas nest, support, contradict, and change character across scales.

---

## Proposed Structure

### 1. The Retrieval Ceiling

What RAG and GraphRAG get right, and where they stop.

- RAG: solved the "knowledge cutoff" problem. Chunks + embeddings + vector search. But chunks are structureless — you get text fragments without knowing what role they play (is this a claim? evidence? a counterargument?)
- GraphRAG (Microsoft, 2024): adds entity extraction + community detection + summarization. Better for global queries. But entities flatten meaning — "Einstein" is a node, not the complex web of claims, evidence, and relationships attached to Einstein across different documents
- The gap: neither preserves **argumentative structure**. Neither lets you traverse from a claim through its evidence to the source data and back. Neither represents the same concept at multiple granularities simultaneously.

*Figure 1: The flattening problem — same document represented as chunks, as entity graph, as frame graph. Show what's lost at each level.*

### 2. Frames as Knowledge Primitives

Introduce frame semantics as the foundational unit.

- Fillmore's frame semantics (1976) — linguistic structures with expected slots and fillers
- Minsky's frames (1975) — knowledge representation with default values and inheritance
- Why frames failed before (GOFAI era): hand-coded, brittle, couldn't scale
- Why they work now: LLMs can instantiate frames from natural language at extraction time. The schemas define expectations; the LLM fills slots from content. Not hand-coded — emergent from the extraction process.

**Frame anatomy:**
- `schema_id`: what kind of knowledge unit (claim, evidence, observation, method, ...)
- `slots`: named relationships (text, source, evidence, implications, examples)
- `slot types`: expected fillers (other frames, literals, URIs)
- `confidence`: extraction confidence score
- `source_span`: character-level provenance back to source text

*Figure 2: A frame instance — show a concrete example of a "claim" frame with its slots filled, pointing to "supporting_evidence" frames, which point to "source_attribution" frames. Show the typed relationships.*

### 3. Recursive Composition

The key architectural move: frames nest.

- A paragraph contains claims, evidence, observations → each is a frame
- A section contains paragraphs → the section is a frame whose slots reference its children
- A document contains sections → same pattern
- A corpus contains documents → same pattern

This gives multi-scale representation for free. The same idea can be found at sentence granularity (for precise retrieval) or at document granularity (for overview). Navigation between scales preserves the route — you can zoom in from a document summary to the specific claim that supports it, or zoom out from a detail to see the broader argument it participates in.

*Figure 3: Recursive composition — a document as a tree of frames at different scales, with cross-links between frames at the same level (SUPPORTS, CONTRADICTS) and parent-child links vertically.*

### 4. The Extraction Pipeline

How documents become frame graphs. (This is the technical core.)

**Stage 1: Document ingestion**
- Content hashing (SHA-256) for deduplication
- Metadata extraction (frontmatter + LLM enrichment)

**Stage 2: Hierarchical parsing**
- Detect document structure (markdown headings, sections)
- Build section hierarchy (H1 → H2+ grouping)
- Preserve character-level source spans

**Stage 3: Frame extraction**
- Per-section LLM extraction using schema descriptions as structured output guide
- 52 frame types across 9 categories (document, content, meta-structure, reasoning, academic, narrative, personal, entity)
- Context injection from surrounding sections, document metadata, pre-extracted entities
- Retry with degradation (shrink context → shrink content)

**Stage 4: Relationship assignment**
- Semantic relationship selection based on frame type pairs
- 19 semantic relationship types (SUPPORTS, CITES, ILLUSTRATES, IMPLIES, ARGUES_FOR, ...)
- 8 structural relationship types (HAS_CHILD, REFERENCES, INSTANCE_OF, ...)
- Config-driven: child type → {default verb, parent-type overrides}

**Stage 5: Embedding and indexing**
- Dual embeddings: raw content + summary (different scales of the same frame)
- Frame-type-aware prefixes ("Supporting Evidence: " + text)
- Vector indexes in graph database for semantic search

*Figure 4: The pipeline — document → sections → frames → relationships → indexed graph. Show a concrete document going through each stage.*

### 5. The Self-Bootstrapping Registry

Frame types aren't hardcoded forever. The registry is dynamic.

- Frame schemas live in the graph, not in application code
- New frame types can be proposed by LLM during extraction ("this content doesn't fit existing schemas")
- Hot-reload: add a schema definition, extraction immediately uses it
- The system that extracts knowledge can extend its own vocabulary for knowledge

This is the Lisp homoiconicity parallel — operations are data. "Summarize," "Compare," "Find Related" are themselves frame instances, making the system's capabilities inspectable and composable.

*Figure 5: Self-bootstrapping — a frame type definition is itself a frame in the graph. Show the meta-level.*

### 6. What This Enables (and What It Doesn't)

**Enables:**
- Traversal from claim → evidence → source (provenance chains)
- Multi-scale retrieval (find the concept at the right granularity)
- Mode-aware retrieval (different cognitive stances activate different paths)
- Recursive retrieval (query → initial results → assess → go deeper/broader/sideways)
- Agentic suggestion of next operations (because operations are frames)

**Doesn't address (yet):**
- What happens to the graph under sustained multi-agent use
- How the graph evolves over time (attention, decay, coupling dynamics)
- How to detect and resist convergence when agents write back into the graph
- Membranes between regions of the graph

These are substrate dynamics questions — the subject of a companion piece. This paper establishes the graph that those dynamics operate over.

*This section positions the RAGE/attractor.space work without trying to cover it.*

### 7. Evaluation

Not retrieval accuracy benchmarks — the contribution is structural, so evaluate structural capabilities.

**7.1 Provenance traversal depth**
Given a retrieved claim, how far can a reviewer trace it? Measure traversal hops to source. Frame graph: claim → evidence → source_attribution → source_span. Entity GraphRAG: entity → co-occurring entity (1 hop). Flat RAG: chunk (0 hops).

**7.2 Multi-scale retrieval**
Same query, different granularity requests. Document-level answer and sentence-level evidence from the same graph without re-indexing. Flat systems need separate indexes per scale.

**7.3 Selective traversal for review (explanation subgraphs)**
"Show me why the system believes X." Produce subgraph: claim + supporting frames + sources + contradictions. Measure completeness and coherence. This is the observability argument.

**Baselines:** Vanilla RAG (chunks), Microsoft GraphRAG (entities), possibly LightRAG. Own corpus as test data (the writing repo is meta and compelling). Qualitative case studies over marginal accuracy deltas.

### 8. Related Work

- Fillmore (1976) — Frame semantics
- Minsky (1975) — Frames for knowledge representation
- Microsoft GraphRAG (2024) — Entity-based graph augmented retrieval
- LightRAG, HippoRAG, RAPTOR — recent graph-based retrieval approaches
- Construction Grammar (Goldberg) — grammatical constructions as frame-like units
- RDF/OWL — semantic web frame-adjacent representations (and why this isn't that)

---

## Figures Needed

1. The flattening problem (chunks vs entities vs frames)
2. Frame anatomy (concrete instance with slots)
3. Recursive composition (multi-scale frame tree with cross-links)
4. Extraction pipeline (document → graph, stage by stage)
5. Self-bootstrapping (frame type as frame)
6. Comparison table: RAG vs GraphRAG vs Frame-Semantic Graph

---

## Open Questions

- **Target**: arXiv preprint. Likely cs.IR (Information Retrieval), cs.AI, or cs.CL (Computation and Language). Could dual-list.
- **Evaluation**: What metrics? Frame extraction quality (precision/recall on typed frames vs entity-only)? Retrieval quality vs baselines (rage-benchmarks repo had RAGE vs vanilla RAG)? Ablation showing what recursive composition adds over flat frames? Need at least one quantitative evaluation section for arXiv credibility.
- **Naming**: Keep architecture-generic in the paper ("frame-semantic graph construction") with Recurse mentioned only as the implementation. Research credibility over product placement.
- **Scope**: Proxy pattern is out of scope — product feature, not research contribution. Self-bootstrapping registry is in scope — it's a genuine architectural contribution (schema evolution).
- **Co-authors**: Solo paper or with Atlas collaborators?
- **Length**: ~8-12 pages (NeurIPS/AAAI format) or longer technical report? arXiv is flexible but a focused 10-pager with strong figures will get more reads than a 25-page exhaustive report.

---

## Relationship to Other Pieces

- **Divergence Engines** → diagnosed the convergence problem; this paper describes what the convergence acts *on* (the graph)
- **HWMTWT** → the theoretical foundation (fractal cognition, SPIRAL); this paper is the implementation
- **Knowledge Substrate article** (v1-v3) → earlier drafts covering similar ground but mixed with dynamics; this paper isolates the graph construction
- **attractor.space lab notes** → the companion piece on dynamics (what happens to this graph under use)
- **Schmidt application** → the research programme that uses this graph as testbed
