# rage-research

Working notes and source material on **substrate dynamics** — how a shared,
machine-readable knowledge store behaves once a population of humans and agents
continuously reads from and writes back into it.

This repository is the single source of truth for the content: the articles,
notes, papers, and references, together with the figure/chart source that
illustrates them. It is consumed by two places:

- the **attractor.space** renderer, which assembles and publishes this content as
  a website (it includes this repo as a git submodule at `content/rage`);

## Layout

| Path | What |
|---|---|
| `articles/` | Long-form pieces (e.g. *Observing Dynamics over Self-Governing Graphs*) |
| `notes/` | Lab notes — the running, deliberately-partial record |
| `papers/` | More formal write-ups |
| `references/` | Reference material (metrics, terms, about) |
| `glossary/` | Term definitions |
| `figures/` | Chart/figure source, co-located with the content it illustrates |

`research/` and `internal/` hold working material that is **not** shared — they
are gitignored.

## A note on the figures

The figure source under `figures/` is **renderer-targeted**: the components are
written against the attractor.space app (they import its UI primitives and
theme), so they will not build standalone in a bare clone of this repo. They live
here to keep each figure beside the writing it belongs to; they are compiled by
the renderer, where this repo is checked out inside the app tree.

## License

Content is licensed **CC BY-NC 4.0** — see [`LICENSE`](./LICENSE).
