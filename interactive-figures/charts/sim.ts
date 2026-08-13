import {
  forceSimulation,
  forceCenter,
  forceManyBody,
  forceCollide,
  forceX,
  forceY,
  forceLink,
} from "d3-force";
import type { Node, Link, Sim } from "./types";

export function createSim(width: number, height: number): {
  sim: Sim;
  nodes: Node[];
  links: Link[];
} {
  const nodes: Node[] = [];
  const links: Link[] = [];

  const sim = forceSimulation<Node, Link>(nodes)
    .force("center", forceCenter(width / 2, height / 2).strength(0))
    .force("charge", forceManyBody<Node>().strength(0))
    .force("collide", forceCollide<Node>().radius((d) => d.r + 1).strength(0.5))
    .force("x", forceX<Node>(width / 2).strength(0))
    .force("y", forceY<Node>(height / 2).strength(0))
    .force("link", forceLink<Node, Link>(links).id((d) => d.id).strength(0).distance(60))
    .alphaDecay(0.005)
    .alphaMin(0.001)
    .alphaTarget(0.05)
    .velocityDecay(0.3);

  return { sim, nodes, links };
}

export function reheat(sim: Sim, alpha = 0.6) {
  sim.alpha(alpha).restart();
}
