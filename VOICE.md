# Lab notes — voice

Rules for the attractor.space lab notes. They override the general styleguide
where they conflict. The aim: simple, honest, no fluff.

## Say the thing

- Write the plain sentence first. If it's clear, stop.
- Short sentences. One idea each. Cut clauses that don't add information.
- Prefer verbs to nominalizations: "the graph drifts", not "the drift the graph
  undergoes".
- Concrete over abstract. Name the actual mechanism (a write changes what the
  next agent retrieves), not a gesture at it.

## No fluff

- No metaphor that pretends to be precision. "The phases a self-governing graph
  moves through" says nothing you couldn't say with "exploration, lock-in,
  drift." If the metaphor isn't doing real work, delete it.
- No grandeur. Don't reach for "legible to the people who depend on it",
  "epistemic infrastructure", "the questions are more general" unless the
  sentence genuinely needs the scope.
- No AI scaffolding: "delve", "unpack", "navigate the landscape", "it's not just
  X — it's Y", "why this matters", "at its core", "a few dense neighborhoods".
- Never write **"load-bearing"** (as in "load-bearing assumption / primitive").
  It's a Claude tell-tale. There is always a plainer word — "central", "the
  sentence the argument rests on", "what this depends on".
- Don't *call* the writing honest. "Honesty about…", "to be honest", "honestly",
  "this one stays honest" — self-labelling as honest is a Claude tell, and a
  section that needs announcing as honest usually wants to be internal anyway.
  Show it (mark claim types); don't badge it.
- Don't pad endings with a reflective flourish. End when the point ends.

## Be honest

- Mark claim types. "In building X I saw…" / "if A then B because…" / "one
  possibility…". Don't state speculation as fact.
- Say what you don't know. "This is probably wrong" beats a confident hedge.
- These are working notes, not papers. Loose ends are fine; faking certainty is
  not.
- If you don't know what a term means or how the system actually works, ask or
  say so in the note — never invent mechanism to fill the gap. A note that states
  something false with confidence is worse than one that marks the open question.
  (Real miss: "membranes gather into clusters" was invented and wrong — a
  membrane is a dynamic co-activation boundary, not a structural tier. When you
  don't know, check `references/terms.md` or ask.)

## Don't pretend it's built

- This is a space for thinking through mechanisms, not documentation of a
  finished system. Don't write design-thinking in the present tense as if it
  already works.
- "The substrate offers three scales" reads as implemented. We're deciding what
  to build, so say it that way: "we'll need to compute it at three scales,
  because…". Describe the requirement and the reason, not a feature.
- Use the tense honestly: present for what exists, future/conditional for what
  we intend or are weighing ("we will need", "this would let us", "one option
  is"). When unsure whether something is built, assume it isn't.

## Public vs internal

These notes have two audiences; keep them apart.

- **Public — vision and patterns.** What the substrate is and the concepts that
  make it up (a [[membranes|membrane]], [[coupling]], an [[oscillators|oscillator]],
  [[coordination-phase]]), the shape of each idea and why it matters. Provisional,
  but written for a reader outside the project. Concept notes are public by default.
- **Internal — implementation and deliberation.** What's actually built and in
  which repo, what's wired and what isn't, code paths and file/function names, the
  gap between a concept and the code, design arguments about what to build next,
  and anything about status, money, or partners.

The line that usually works: a concept is public; *how we currently implement it*
is internal. "We model a frame as an oscillator, and phase lets us read
synchronization" is public. "The current build uses a Hopf oscillator because
Kuramoto can't go dormant, and `step()` reads coupling strength as its C matrix"
is internal — same idea, lower altitude.

Two ways to keep something internal:

- **A whole note:** `internal: true` in the frontmatter. It still renders (with
  `show: true`) but is marked internal — the home for the implementation notes
  ([[oscillators/implementation]], [[codebase]], [[codebase-improvements]],
  [[membranes/implementation]]).
- **One section of a public note:** a heading `# Internal: <headline>`. The
  renderer hides everything under it. Use this for a single internal aside in a
  mostly-public note rather than leaving it in the open.

Test: would this read to an outsider as a statement of the idea, or does it expose
what's half-built, which file does what, or what it costs? Patterns and vision
stay; mechanism, status, and money go internal. When a concept note starts naming
repos and functions, lift it back to the pattern or move it behind a `# Internal:`
heading.

## Referring to code

- Refer to code by its **repository**, not a machine-local path. Write the repo as
  `owner/repo` (`julianfleck/rage-substrate`), and a file inside it as a
  repo-relative path (`rage_substrate/attention/hopf.py`). Never paste an absolute
  local path (`~/Code/...`, `/Users/...`) into a note — it means nothing to a
  reader and dates instantly.
- This holds for collaborator repos too. Name them the same neutral way
  (`owner/repo`); don't single them out or describe them by where they sit on
  someone's disk.

## Formatting

- Write each paragraph as one line. Don't hard-wrap with manual newlines
  mid-paragraph — let the editor soft-wrap. Manual line breaks make editing and
  diffs worse, and they fight Obsidian.

## Test

Read it aloud. If a sentence sounds like a press release or a model trying to
sound smart, rewrite it plainer. If you can cut a word without losing meaning,
cut it.
