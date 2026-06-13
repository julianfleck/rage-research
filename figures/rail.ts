// Coordinates the single margin/rail figure slot: only one figure is visible at
// a time. Each figure registers a claim with a priority (hover beats passive
// scroll) and a "want" (its desired opacity). The winner is the highest
// priority, then the strongest want, then the most recent claim.

type Claim = { priority: number; want: number; seq: number };

const claims = new Map<string, Claim>();
const listeners = new Set<() => void>();
let seq = 0;

function emit() {
  for (const l of listeners) l();
}

export function setRailClaim(id: string, claim: { priority: number; want: number } | null) {
  const prev = claims.get(id);
  if (!claim || claim.want <= 0.001) {
    if (prev) {
      claims.delete(id);
      emit();
    }
    return;
  }
  // Keep the sequence stable unless the priority changes, so recency tie-breaks
  // by first claim rather than churning every scroll frame.
  const nextSeq = prev && prev.priority === claim.priority ? prev.seq : ++seq;
  claims.set(id, { priority: claim.priority, want: claim.want, seq: nextSeq });
  emit();
}

export function railWinner(): string | null {
  let best: string | null = null;
  let bp = -1;
  let bw = -1;
  let bs = -1;
  for (const [id, c] of claims) {
    if (c.priority > bp || (c.priority === bp && (c.want > bw || (c.want === bw && c.seq > bs)))) {
      best = id;
      bp = c.priority;
      bw = c.want;
      bs = c.seq;
    }
  }
  return best;
}

export function subscribeRail(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
