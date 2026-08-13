"use client";

import { useEffect, useRef } from "react";

// Frame slot structure. A frame is a typed box with named slots; a slot's value
// is another frame, so slots are the edges of the graph and frames nest. The
// figure draws a root frame whose slots connect out to child frames, one of
// which has slots of its own — and a pulse travels root → slot → child → slot →
// grandchild, lighting one composition path at a time. Black/white, currentColor.
type Box = { x: number; y: number; w: number; h: number; slots: number[] };

// Each box: position + the y-fractions of its slots (on its right edge).
const BOXES: Box[] = [
  { x: 0.05, y: 0.36, w: 0.26, h: 0.28, slots: [0.32, 0.5, 0.68] }, // root
  { x: 0.46, y: 0.1, w: 0.2, h: 0.18, slots: [] }, // child A
  { x: 0.46, y: 0.41, w: 0.2, h: 0.18, slots: [0.5] }, // child B (nests)
  { x: 0.46, y: 0.72, w: 0.2, h: 0.18, slots: [] }, // child C
  { x: 0.78, y: 0.42, w: 0.18, h: 0.16, slots: [] }, // grandchild
];
// Links: [boxIndex, slotIndex, targetBoxIndex].
const LINKS: [number, number, number][] = [
  [0, 0, 1],
  [0, 1, 2],
  [0, 2, 3],
  [2, 0, 4],
];
// Composition paths a pulse can travel (chains of link indices).
const PATHS = [[0], [1, 3], [2]];

export function FrameSlots() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let w = 0;
    let h = 0;
    let frame = 0;
    let color = "#888";

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const slotPt = (b: Box, s: number): [number, number] => [(b.x + b.w) * w, (b.y + b.h * b.slots[s]) * h];
    const leftPt = (b: Box): [number, number] => [b.x * w, (b.y + b.h / 2) * h];

    const draw = () => {
      if (frame++ % 40 === 0) color = getComputedStyle(canvas).color;
      ctx.clearRect(0, 0, w, h);
      const t = frame * 0.01;

      // Which composition path is lit, and how far the pulse has travelled it.
      const PERIOD = 2.4;
      const pIdx = Math.floor(t / PERIOD) % PATHS.length;
      const local = (t % PERIOD) / PERIOD;
      const path = PATHS[pIdx];
      const litLinks = new Set(path);

      // Links (slot → child). Active path brighter; a dot rides the chain.
      ctx.strokeStyle = color;
      LINKS.forEach((lk, i) => {
        const [bi, si, ti] = lk;
        const a = slotPt(BOXES[bi], si);
        const b = leftPt(BOXES[ti]);
        ctx.globalAlpha = litLinks.has(i) ? 0.7 : 0.18;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      });
      // Pulse dot travelling the active chain.
      {
        const seg = Math.min(path.length - 1, Math.floor(local * path.length));
        const segLocal = local * path.length - seg;
        const [bi, si, ti] = LINKS[path[seg]];
        const a = slotPt(BOXES[bi], si);
        const b = leftPt(BOXES[ti]);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(a[0] + (b[0] - a[0]) * segLocal, a[1] + (b[1] - a[1]) * segLocal, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Frame boxes + their slot stubs.
      const litBoxes = new Set<number>([0]);
      for (const li of path) litBoxes.add(LINKS[li][2]);
      ctx.strokeStyle = color;
      BOXES.forEach((b, i) => {
        ctx.globalAlpha = litBoxes.has(i) ? 0.85 : 0.4;
        ctx.lineWidth = 1.25;
        ctx.strokeRect(b.x * w, b.y * h, b.w * w, b.h * h);
        // type tab — a short bar near the top edge, marking the box as typed
        ctx.globalAlpha = litBoxes.has(i) ? 0.5 : 0.25;
        ctx.beginPath();
        ctx.moveTo(b.x * w + 4, b.y * h + 5);
        ctx.lineTo((b.x + b.w) * w - 4, b.y * h + 5);
        ctx.stroke();
        // slot stubs on the right edge
        for (let s = 0; s < b.slots.length; s++) {
          const [px, py] = slotPt(b, s);
          ctx.globalAlpha = litBoxes.has(i) ? 0.7 : 0.35;
          ctx.beginPath();
          ctx.moveTo(px - 5, py);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className="block h-full w-full" aria-hidden />;
}
