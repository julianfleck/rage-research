---
title: Metrics
description: Energy, emergent patterns, feedback loops, and health metrics of the substrate -> potential instrumentation
date: 2026-02-04
series: References
status: draft
version: 1
show: true
author: Julian Fleck
tags: [substrate, instrumentation]
---
## 1. Energy Dynamics

The RAGE substrate operates like a thermodynamic system. Energy flows, dissipates, and concentrates according to simple local rules that produce complex global behavior.

### Attention as Energy Injection

When attention lands on a frame, energy enters the system:

```
                    ATTENTION
                        ↓
                       ⚡ +1.0
                        ↓
    ┌─────────────────────────────────────┐
    │           SUBSTRATE                 │
    │                                     │
    │      ○───○       ●←─ injection      │
    │     /     \     /                   │
    │    ○       ○───○                    │
    │                                     │
    └─────────────────────────────────────┘
```

- Each attention event injects a fixed quantum of energy
- The frame's activation level increases immediately
- This is the ONLY way energy enters the substrate

### Propagation Through Couplings

Energy spreads from activated frames to their neighbors/children:

```
    Before              During              After
    
      ●                   ●                   ◐
     1.0                 1.0                 0.6
      │                   │                   │
      │ s=0.8            ╔╧╗                  │
      │                  ║↓║ propagate        │
      │                  ╚╤╝                  │
      │                   │                   │
      ○                   ◐                   ◐
     0.0                 0.4                 0.4

    s = coupling strength (0-1)
    energy_transferred = source_activation × strength × damping_factor
```

**Valence affects propagation:**

| Valence | Effect | Interpretation |
|---------|--------|----------------|
| Positive (+) | Energy transfers constructively | "Related concepts" |
| Negative (−) | Energy cancels/inhibits | "Contradictions" |
| Zero | No transfer | "Unrelated" |

```
    Positive Valence          Negative Valence
    
        ●                          ●
       1.0                        1.0
        │                          │
        │ (+0.8)                   │ (−0.8)
        ↓                          ↓
        ◐                          ◌
       0.4                       −0.4 → clamped to 0.0
    
    Energy adds               Energy subtracts (inhibition)
```

### Decay

Without reinforcement, activation fades:

```
    t=0     t=1     t=2     t=3     t=4
    
     ●       ◐       ○       ○       ○
    1.0     0.7     0.49    0.34    0.24
    
    activation(t+1) = activation(t) × decay_rate
    typical decay_rate = 0.7
```

Decay serves critical functions:
- **Forgetting** — old activations clear naturally
- **Noise reduction** — weak signals die out
- **Resource reclamation** — energy returns to ambient

### Energy Conservation vs Dissipation

The substrate is **dissipative**, not conservative:

```
    Energy In                    Energy Out
    ═══════════                  ═══════════
    Attention events    →        Decay (primary)
                                 Inhibition (negative valence)
                                 Damping at boundaries
    
    Total energy trends toward zero without continuous injection
```

This is intentional. A conservative system would accumulate noise forever. Dissipation ensures the substrate "cools" to a clean state.

---

## 2. Emergent Patterns

### Healthy Patterns

#### Spreading Activation (Exploration)

Energy diffuses outward, visiting many related frames:

```
    t=0          t=1          t=2          t=3
    
        ●            ◐            ○            ○
       /│\          /│\          /│\          /│\
      ○ ○ ○        ◐ ◐ ◐        ◐ ◐ ◐        ○ ○ ○
     /     \      /     \      /     \      /     \
    ○       ○    ○       ○    ◐       ◐    ◐       ◐
    
    Energy spreads like ripples in a pond
    ● = hot  ◐ = warm  ○ = cold
```

**Signature:** Low activation in any single frame, broad distribution, high entropy.

#### Shifting Focus

Attention moves deliberately across different territories:

```
    t=0              t=1              t=2
    
    ┌─────┐          ┌─────┐          ┌─────┐
    │ ●●● │  →→→     │ ○○○ │          │ ○○○ │
    │ ●●  │          │ ○○  │          │ ○○  │
    └─────┘          └─────┘          └─────┘
      Territory A      Territory A      Territory A
    
    ┌─────┐          ┌─────┐          ┌─────┐
    │ ○○○ │          │ ●●● │  →→→     │ ○○○ │
    │ ○○  │          │ ●●  │          │ ○○  │
    └─────┘          └─────┘          └─────┘
      Territory B      Territory B      Territory B
    
    ┌─────┐          ┌─────┐          ┌─────┐
    │ ○○○ │          │ ○○○ │          │ ●●● │
    │ ○○  │          │ ○○  │          │ ●●  │
    └─────┘          └─────┘          └─────┘
      Territory C      Territory C      Territory C
```

**Signature:** Hot regions migrate, no cluster dominates persistently.

#### Bridge Discovery

A dormant connection suddenly carries energy between distant clusters:

```
    Before                              After
    
    ┌─────┐         ┌─────┐            ┌─────┐         ┌─────┐
    │ ●●● │         │ ○○○ │            │ ●●● │─────────│ ◐◐◐ │
    │ ●●  │         │ ○○  │            │ ●●  │  BRIDGE │ ◐◐  │
    └─────┘         └─────┘            └─────┘  ACTIVE └─────┘
      HOT            COLD                HOT            WARMING
    
    A frame in the hot cluster has a weak coupling to the cold cluster.
    When activation is high enough, it crosses the bridge.
    
    → "Oh, X is related to Y!" moment
```

**Signature:** Sudden activation spike in a previously cold cluster, traceable to a single coupling.

#### Consolidation

Related frames synchronize into a coherent pattern:

```
    Before (noisy)              After (consolidated)
    
        ◐                           ●
       /│\                         /│\
      ● ○ ◐                       ● ● ●
     /     \                     /     \
    ○       ●                   ●       ●
    
    Activations: [0.3, 0.9, 0.1, 0.5, 0.2, 0.8]
                         ↓
                 [0.7, 0.8, 0.7, 0.8, 0.7, 0.8]
    
    Variance decreases within cluster
```

**Signature:** Decreasing activation variance within a territory, stable mean activation.

---

### Pathological Patterns

#### Repetition (Single-Frame Pulsing)

One frame receives attention repeatedly, blocking exploration:

```
    t=0     t=1     t=2     t=3     t=4
    
     ●       ◐       ●       ◐       ●
    1.0     0.7     1.0     0.7     1.0
     │       │       │       │       │
     ○       ○       ○       ○       ○    ← neighbors never activate
     │       │       │       │       │
     ○       ○       ○       ○       ○
    
    Same frame pulsing: attention → decay → attention → decay
    
    ⚠️  SYMPTOM: One frame with high attention count, 
                 neighbors perpetually cold
```

#### Circular Reasoning (Hot Cycle)

Energy circulates in a closed loop:

```
              ●
             ╱ ╲
           0.8  0.8
           ↓     ↑
          ◐       ◐
           ╲     ╱
            0.8
              ↓
              ◐
    
    A → B → C → A → B → C → ...
    
    Energy never leaves the cycle
    Rest of substrate goes dark
    
    ⚠️  SYMPTOM: 3-5 frames with sustained high activation,
                 strong mutual couplings, rest near zero
```

#### Fixation (Cluster Monopoly)

One territory accumulates all energy:

```
    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
    │  ●●●●●●●●●  │     │  ○○○○○○○○○  │     │  ○○○○○○○○○  │
    │  ●●●●●●●●●  │     │  ○○○○○○○○○  │     │  ○○○○○○○○○  │
    │  ●●●●●●●●●  │     │  ○○○○○○○○○  │     │  ○○○○○○○○○  │
    └─────────────┘     └─────────────┘     └─────────────┘
         HOT                DARK                 DARK
    
    Energy distribution: [85%, 8%, 7%]
    
    ⚠️  SYMPTOM: Gini coefficient approaching 1.0,
                 one cluster >50% of total energy
```

#### Runaway Oscillation

Positive feedback loop without damping:

```
    t=0   t=1   t=2   t=3   t=4   t=5   t=6
    
    1.0   1.2   1.4   1.8   2.3   3.0   4.2  ← unbounded growth!
     ●─────●─────●─────●─────●─────●─────●
    
    Two frames with positive coupling > 1/decay_rate
    They amplify each other faster than decay removes energy
    
    ⚠️  SYMPTOM: Total substrate energy increasing over time,
                 specific frame pair with extreme activations
```

#### Semantic Heat Death

Everything weakly coupled to everything — no structure remains:

```
    Before (structured)              After (heat death)
    
    ┌───┐     ┌───┐                 ┌───────────────────┐
    │ ● │     │ ● │                 │ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ │
    │ ● │     │ ● │                 │ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ │
    └─┬─┘     └─┬─┘                 │ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ │
      │  bridge  │                  │ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ │
      └────┬─────┘                  └───────────────────┘
           │                        
    Distinct clusters               Uniform soup
    Clear boundaries                No boundaries
    Strong intra-coupling           Weak coupling everywhere
    
    ⚠️  SYMPTOM: High coupling density (>0.3),
                 uniform activation distribution,
                 no detectable clusters
```

---

## 3. Feedback Loops

### Positive Feedback: The Retrieval Spiral

```
    ┌──────────────────────────────────────────┐
    │                                          │
    │  ┌──────────┐    ┌───────────────────┐   │
    │  │ Attention │───→│ Higher Activation │   │
    │  └──────────┘    └─────────┬─────────┘   │
    │        ↑                   │             │
    │        │                   ↓             │
    │  ┌─────┴──────┐    ┌───────────────────┐ │
    │  │ More Likely │←───│ Ranks Higher in   │ │
    │  │ to Retrieve │    │ Retrieval         │ │
    │  └────────────┘    └───────────────────┘ │
    │                                          │
    └──────────────────────────────────────────┘
    
    DANGER: The rich get richer. Popular frames dominate.
```

### Negative Feedback: Overcrowding Interference

```
    Many hot frames in one region
              ↓
    Retrieval becomes noisy (many candidates)
              ↓
    User frustration / poor results
              ↓
    Attention shifts elsewhere
              ↓
    Region cools down
    
    This is HEALTHY — it prevents permanent monopolies
```

### Coupling Valence: Constructive vs Destructive Interference

```
    CONSTRUCTIVE (positive valence)
    
        ●─────(+)─────●
       1.0           1.0
             ↓
        ◐─────(+)─────◐
       1.3           1.3     ← both gain energy
    
    
    DESTRUCTIVE (negative valence)
    
        ●─────(−)─────●
       1.0           1.0
             ↓
        ○─────(−)─────○
       0.2           0.2     ← mutual inhibition
```

Contradictions suppress each other. This is how the substrate handles inconsistency — competing frames fight for activation, and one wins (or both die).

### Entrainment

Strongly coupled frames synchronize:

```
    t=0          t=1          t=2          t=3
    
    ●───●        ●───●        ●───●        ●───●
   1.0 0.5      0.8 0.8      0.7 0.7      0.6 0.6
    
   Activations converge toward their weighted average
   Strongly coupled frames "pull" each other along
```

---

## 4. Health Metrics

### Distribution Metrics

#### Activation Entropy

Measures how spread out the energy is:

```
    LOW ENTROPY (fixation)          HIGH ENTROPY (chaos)
    
    ●○○○○○○○○○                      ◐◐◐◐◐◐◐◐◐◐
    
    One frame dominates             Energy uniformly spread
    H ≈ 0.0                         H ≈ log(N)
    
    HEALTHY RANGE: 0.4 × log(N) to 0.8 × log(N)
```

| Entropy | Interpretation | Action |
|---------|---------------|--------|
| < 0.3 × log(N) | Fixation | Inject energy into cold regions |
| 0.4-0.8 × log(N) | Healthy | None |
| > 0.9 × log(N) | No focus | Prune weak couplings |

#### Gini Coefficient

The [[gini-coefficient|Gini coefficient]] measures inequality (0 = equal, 1 = monopoly):

```
    Gini = 0.0              Gini = 0.5              Gini = 0.9
    
    ████████████            ████████████            ████████████
    ████████████            ████████                █
    ████████████            ████                    
    ████████████            ██                      
    
    Perfect equality        Moderate inequality     Near monopoly
```

**Target:** Gini between 0.3 and 0.6

#### Territory Balance

Energy distribution across clusters:

```
    balance = 1 - std(territory_energies) / mean(territory_energies)
    
    BALANCED (0.8+)                  IMBALANCED (0.3)
    
    ┌────┐ ┌────┐ ┌────┐            ┌────┐ ┌────┐ ┌────┐
    │ 32%│ │ 35%│ │ 33%│            │ 70%│ │ 20%│ │ 10%│
    └────┘ └────┘ └────┘            └────┘ └────┘ └────┘
```

#### Frame-type diversity (Hill numbers)

How many frame types are active, and how evenly. Measured as Hill numbers at three orders — richness ($q = 0$), Shannon ($q = 1$), and inverse Simpson ($q = 2$) — each an *effective count* of types. The gap between ${}^{0}D$ and ${}^{2}D$ shows whether a long tail of rare framings survives or is being drowned out by a few dominant ones. See [[hill-diversity]] for the walkthrough.

**Target:** open — we want the tail to persist, so ${}^{0}D$ holding well above ${}^{2}D$ rather than the two collapsing together.

---

### Temporal Metrics

#### Oscillation Detection

Check for sustained periodic patterns:

```
    Healthy (decaying)              Pathological (sustained)
    
    ▲                               ▲
    │ ●                             │ ●   ●   ●   ●   ●
    │  ●                            │  ● ● ● ● ● ● ● ●
    │   ●                           │   ●   ●   ●   ●
    │    ●●                         │
    │      ●●●                      │
    └────────────→ time             └────────────────────→ time
    
    Autocorrelation dies            Autocorrelation persists
```

**Method:** Compute autocorrelation of frame activations over time. If correlation > 0.5 at lag > 3, flag as oscillation.

#### Energy Flow Direction

Is energy concentrating or spreading?

```
    flow_direction = Δentropy / Δtime
    
    SPREADING (healthy)             CONCENTRATING (warning)
    
    flow > 0                        flow < 0
    
       ●                               ◐◐◐
      ↙↓↘                               ↓
     ◐ ◐ ◐                              ●
```

#### Decay Rate Tracking

Is the substrate forgetting appropriately?

```
    effective_decay = (energy_t1 - energy_injected) / energy_t0
    
    Expected: ~0.7 per tick
    
    TOO FAST (< 0.5):  Information lost too quickly
    TOO SLOW (> 0.85): Noise accumulating
```

---

### Structural Metrics

#### Coupling Graph Density

```
    density = actual_couplings / possible_couplings
    
    SPARSE (0.05)                    DENSE (0.4)
    
    ○   ○   ○   ○                    ○───○───○───○
        │                            │╲ │╳│ ╱│
    ○   ○───○   ○                    ○─╳─○─╳─○
            │                        │╱ │╳│ ╲│
    ○   ○   ○───○                    ○───○───○───○
    
    Clear structure                  Losing differentiation
```

**Target:** density < 0.15

#### Cluster Coherence

```
    coherence = mean(intra_cluster_coupling) / mean(inter_cluster_coupling)
    
    HIGH COHERENCE (10+)            LOW COHERENCE (1.5)
    
    ┌─●══●─┐     ┌─●══●─┐          ┌─●──●─┐─────┌─●──●─┐
    │ ║  ║ │     │ ║  ║ │          │ │  │ │     │ │  │ │
    │ ●══● │     │ ●══● │          │ ●──● │     │ ●──● │
    └──────┘     └──────┘          └──────┘     └──────┘
       weak between                   similar strength
```

**Target:** coherence > 5

#### Bridge Strength

Healthy substrates have strong bridges between clusters:

```
    bridge_strength = mean(top_k_inter_cluster_couplings)
    
    TOO WEAK (< 0.1): Isolated silos, no cross-pollination
    HEALTHY (0.2-0.5): Ideas can flow between domains
    TOO STRONG (> 0.7): Clusters merging, losing distinctness
```

---

## 5. Intervention Strategies

### Damping Hot Spots

When a frame or cycle is stuck hot:

```
    BEFORE                          AFTER
    
    ●═══●═══●                       ◐───◐───◐
    (hot cycle)                     (damped)
    
    Actions:
    1. Multiply stuck frames' activation by 0.3
    2. Temporarily reduce coupling strengths in cycle
    3. Inject competing attention elsewhere
```

### Forced Exploration

When regions go dark:

```
    BEFORE                          AFTER
    
    ┌─●●●─┐  ┌─○○○─┐               ┌─●●●─┐  ┌─◐◐◐─┐
    │ ●●  │  │ ○○  │               │ ●●  │  │ ◐◐  │
    └─────┘  └─────┘               └─────┘  └─────┘
      HOT      DARK                  HOT      WARMING
    
    Actions:
    1. Identify coldest cluster
    2. Inject attention into its highest-potential frame
    3. Repeat until balance restored
```

### Coupling Pruning

When density gets too high:

```
    Prune criteria:
    - Coupling strength < 0.1 (noise)
    - Coupling contradicts cluster structure
    - Coupling between semantically distant frames with no attention flow
    
    Keep:
    - Strong intra-cluster couplings
    - Active bridges (carried energy recently)
    - Inhibitory couplings (they provide structure)
```

### Territory Rebalancing

When clusters drift in size:

```
    BEFORE                          AFTER
    
    ┌───────────────┐  ┌───┐       ┌─────────┐  ┌───────┐
    │  50 frames    │  │ 5 │       │ 35      │  │  20   │
    │               │  │   │       │ frames  │  │ frames│
    └───────────────┘  └───┘       └─────────┘  └───────┘
    
    Actions:
    1. Identify frames at cluster boundaries
    2. Re-cluster based on current coupling strengths
    3. Promote outliers to new territories
```

---

## 6. Visual Signatures

### Legend

```
    SYMBOLS                         COLORS (for UI)
    
    ● = hot (activation > 0.7)      🔴 RED    = heating (Δ > +0.1)
    ◐ = warm (0.3 - 0.7)            🔵 BLUE   = cooling (Δ < -0.1)  
    ○ = cold (< 0.3)                ⚪ WHITE  = stable
    
    ═══ = strong coupling (> 0.6)   SIZE = absolute activation
    ─── = medium coupling (0.3-0.6)
    ··· = weak coupling (< 0.3)
```

### Healthy Substrate

```
              ◐                    🔵
             /│\                  
            ◐ ● ◐        →       🔴 warmer, 🔵 cooler, balanced
           /  │  \
          ○   ◐   ○
    
    Territory A          Territory B          Territory C
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │  ◐ ◐    │        │    ◐ ●   │        │  ○  ◐   │
    │    ◐    │───────│    ◐     │────────│     ○   │
    │  ◐   ○  │ bridge │  ●   ◐  │ bridge │  ◐   ○  │
    └──────────┘        └──────────┘        └──────────┘
    
    ✓ Energy distributed across territories
    ✓ Clear cluster boundaries
    ✓ Active bridges
    ✓ Mix of hot/warm/cold (healthy turnover)
```

### Pathological: Repetition

```
                    ↓ attention (repeated)
                    
                    ●   ←── same frame, pulsing
                   /│\
                  ○ ○ ○  ←── neighbors never warm
                 /  │  \
                ○   ○   ○
    
    ⚠️  Single hot spot
    ⚠️  No energy spread
    ⚠️  Attention counter on one frame >> others
```

### Pathological: Hot Cycle

```
              ●═══════●
              ║       ║
              ║   ●   ║  ←── triangle of doom
              ║  ╱ ╲  ║
              ●══════●
    
    All other frames: ○○○○○○○○○○○○
    
    ⚠️  Small group with mutual strong coupling
    ⚠️  Rest of substrate dark
    ⚠️  Energy circulating, not dissipating
```

### Pathological: Fixation

```
    Territory A          Territory B          Territory C
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │  ● ● ●  │        │    ○ ○   │        │  ○  ○   │
    │  ● ● ●  │   ·    │    ○     │   ·    │     ○   │
    │  ● ● ●  │ (weak) │  ○   ○   │ (weak) │  ○   ○  │
    └──────────┘        └──────────┘        └──────────┘
        90%                  6%                  4%
    
    ⚠️  One cluster HOT
    ⚠️  Others DARK
    ⚠️  Bridges weak/inactive
```

### Pathological: Heat Death

```
    ┌────────────────────────────────────────────────┐
    │  ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐   │
    │  ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐   │
    │  ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐   │
    │  ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐ ◐   │
    └────────────────────────────────────────────────┘
                (everything connected to everything)
    
    ⚠️  No clusters visible
    ⚠️  Uniform activation
    ⚠️  Coupling density > 0.3
    ⚠️  Maximum entropy (chaos)
```

---

## Quick Reference: Health Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUBSTRATE HEALTH DASHBOARD                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DISTRIBUTION                    TEMPORAL                        │
│  ─────────────                   ────────                        │
│  Entropy:     ████████░░  0.65   Oscillation: ✓ None detected   │
│  Gini:        ████░░░░░░  0.42   Flow:        → Spreading       │
│  Territory:   ███████░░░  0.71   Decay:       ✓ 0.72 (nominal)  │
│                                                                  │
│  STRUCTURAL                      STATUS                          │
│  ──────────                      ──────                          │
│  Density:     ██░░░░░░░░  0.08   │                              │
│  Coherence:   ███████░░░  7.2    │  ✅ HEALTHY                   │
│  Bridges:     █████░░░░░  0.35   │                              │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  ALERTS                                                          │
│  ────────                                                        │
│  (none)                                                          │
│                                                                  │
│  RECENT PATTERNS                                                 │
│  ───────────────                                                 │
│  • Spreading activation in Territory B (healthy)                 │
│  • Bridge discovered: T-A ↔ T-C via frame #247                  │
│  • Consolidation event in Territory A (4 frames synchronized)   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary

The RAGE substrate is **cognitive instrumentation**. Instead of:

- Parsing outputs for reasoning errors
- Running test suites on conclusions
- Hoping the model "makes sense"

You **watch the substrate**:

| You See | You Know | You Do |
|---------|----------|--------|
| Single hot spot pulsing | Repetitive thinking | Damp + explore |
| Hot triangle | Circular reasoning | Break the cycle |
| One cluster monopoly | Fixation | Force territory balance |
| Everything lukewarm | Lost structure | Prune couplings |
| Energy growing unbounded | Runaway feedback | Emergency damping |

**The pattern IS the diagnosis. The substrate IS the debugger.**

---

*Document version: 1.0*  
*Last updated: 2026-02-04*

<Related tags="metric" title="Metric notes" />
