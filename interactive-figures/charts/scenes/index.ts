import type { Scene } from "../types";

// The old imperative chart scenes (20-substrate, 10-belief-attractors) were
// retired and rebuilt in the new canvas registry as `frame-graph` and
// `belief-attractors`. This engine is kept importable but carries no scenes.
export const scenes: Scene[] = [];
