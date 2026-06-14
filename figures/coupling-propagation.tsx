"use client";

import { SubstrateHeroCoact } from "./substrate-hero-coact";

// Coupling, with the membrane left out: only the propagation patterns and the
// binding that builds from them. Stronger pull and a faster Hebbian build rate
// than the hero, so each shared firing visibly draws co-active frames closer —
// coupling accumulating into structure, turn by turn.
export function CouplingPropagation() {
  return <SubstrateHeroCoact showMembrane={false} pull={0.09} restLen={0.05} coupLearn={0.045} />;
}
