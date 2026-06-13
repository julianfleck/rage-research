import { forceManyBody, forceCenter, forceX, forceY, forceCollide, forceLink } from "d3-force";
import type { Node, Link, Sim } from "../types";

export function ensureNodes(nodes: Node[], target: number, factory: (i: number) => Node) {
  while (nodes.length < target) nodes.push(factory(nodes.length));
  if (nodes.length > target) nodes.length = target;
}

export function clearLinks(links: Link[]) {
  links.length = 0;
}

export function applyStandardForces(sim: Sim, opts: {
  cx: number; cy: number;
  charge?: number;
  centerStrength?: number;
  xStrength?: number;
  yStrength?: number;
  collideStrength?: number;
  linkStrength?: number;
  linkDistance?: number;
}) {
  const { cx, cy, charge = 0, centerStrength = 0, xStrength = 0, yStrength = 0, collideStrength = 0.5, linkStrength = 0, linkDistance = 60 } = opts;
  sim.force("center", forceCenter(cx, cy).strength(centerStrength));
  sim.force("charge", forceManyBody<Node>().strength(charge));
  sim.force("x", forceX<Node>(cx).strength(xStrength));
  sim.force("y", forceY<Node>(cy).strength(yStrength));
  sim.force("collide", forceCollide<Node>().radius((d) => d.r + 1).strength(collideStrength));
  const link = sim.force("link") as ReturnType<typeof forceLink<Node, Link>> | null;
  if (link) link.strength(linkStrength).distance(linkDistance);
  sim.force("radial", null);
  sim.force("attractor", null);
}

export function clearTrails(nodes: Node[]) {
  for (const n of nodes) {
    n.trailMax = 0;
    if (n.trail) n.trail.length = 0;
  }
}

/**
 * Draws a small "message bubble" — a circle with a tapered tail trailing
 * behind in the direction of travel. Used as the universal result/message
 * indicator across spiral and loop scenes.
 *
 * @param angle  Direction of travel (radians). The tail points opposite.
 */
export function drawMessage(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  angle: number,
  alpha = 1,
) {
  const tailLen = radius * 2.4;
  const tailHalf = radius * 0.55;
  // Tail base (behind the circle).
  const bx = x - Math.cos(angle) * (radius + tailLen);
  const by = y - Math.sin(angle) * (radius + tailLen);
  // Perpendicular for tail width.
  const px = -Math.sin(angle) * tailHalf;
  const py = Math.cos(angle) * tailHalf;
  // Two points where tail meets circle edge.
  const jx = x - Math.cos(angle) * radius * 0.6;
  const jy = y - Math.sin(angle) * radius * 0.6;

  c.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
  c.beginPath();
  // Tail triangle.
  c.moveTo(bx, by);
  c.lineTo(jx + px, jy + py);
  c.lineTo(jx - px, jy - py);
  c.closePath();
  c.fill();
  // Circle head.
  c.beginPath();
  c.arc(x, y, radius, 0, Math.PI * 2);
  c.fill();
}
