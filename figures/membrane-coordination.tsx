"use client";

import { useEffect, useRef } from "react";

// Coordination through drift. Agents are frames too, so the same rule applies to
// them: fire together, wire together. When a set of agents co-acts, coupling
// builds between them and a spring draws them together; activation dissipates
// through each agent's child frames; a membrane closes around the group — a team
// no one imposed. When the burst ends, decay dissolves the coupling and the team
// drifts back apart, until a different set co-acts. Black/white, currentColor.
const NA = 9; // agents
const GRID = 30;
const LEVELS = [0.3, 0.62];
const FLOOR = 0.06;
const HOME_K = 0.005;
const PULL = 0.05;
const REST = 0.1;
const COUP_THRESH = 0.12;
const REPEL_D = 0.07;

export function MembraneCoordination() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let t = 0;
    let w = 0;
    let h = 0;
    let frame = 0;
    let color = "#888";

    type Kid = { dx: number; dy: number };
    type Agent = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; a: number; warm: number; kids: Kid[] };
    const agents: Agent[] = Array.from({ length: NA }, (_, i) => {
      const ang = (i / NA) * Math.PI * 2 + 0.3;
      const x = 0.5 + Math.cos(ang) * 0.34;
      const y = 0.5 + Math.sin(ang) * 0.34;
      const kids = Array.from({ length: 3 }, () => {
        const ka = Math.random() * Math.PI * 2;
        const kr = 0.035 + Math.random() * 0.03;
        return { dx: Math.cos(ka) * kr, dy: Math.sin(ka) * kr };
      });
      return { hx: x, hy: y, x, y, vx: 0, vy: 0, a: FLOOR, warm: 0, kids };
    });

    const coup: number[][] = Array.from({ length: NA }, () => new Array(NA).fill(0));

    let team: number[] = [];
    let burstUntil = 0;
    let nextTeam = 0.6;
    const pickTeam = () => {
      const idx = [...Array(NA).keys()];
      for (let i = idx.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }
      return idx.slice(0, 3 + ((Math.random() * 2) | 0)); // 3 or 4 agents
    };

    const fieldArr = new Float32Array((GRID + 1) * (GRID + 1));

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

    // Marching squares over the coupling-warmth field (adapted from the hero).
    const contour = (lv: number) => {
      const sx = w / GRID;
      const sy = h / GRID;
      const at = (gx: number, gy: number) => fieldArr[gy * (GRID + 1) + gx];
      const cross = (x0: number, y0: number, x1: number, y1: number, v0: number, v1: number): [number, number] => {
        const k = (lv - v0) / (v1 - v0);
        return [(x0 + (x1 - x0) * k) * sx, (y0 + (y1 - y0) * k) * sy];
      };
      for (let gy = 0; gy < GRID; gy++) {
        for (let gx = 0; gx < GRID; gx++) {
          const a = at(gx, gy);
          const b = at(gx + 1, gy);
          const c = at(gx + 1, gy + 1);
          const d = at(gx, gy + 1);
          let ci = 0;
          if (a > lv) ci |= 1;
          if (b > lv) ci |= 2;
          if (c > lv) ci |= 4;
          if (d > lv) ci |= 8;
          if (ci === 0 || ci === 15) continue;
          const T = () => cross(gx, gy, gx + 1, gy, a, b);
          const R = () => cross(gx + 1, gy, gx + 1, gy + 1, b, c);
          const B = () => cross(gx, gy + 1, gx + 1, gy + 1, d, c);
          const L = () => cross(gx, gy, gx, gy + 1, a, d);
          const seg = (p: [number, number], q: [number, number]) => {
            ctx.moveTo(p[0], p[1]);
            ctx.lineTo(q[0], q[1]);
          };
          switch (ci) {
            case 1: case 14: seg(L(), T()); break;
            case 2: case 13: seg(T(), R()); break;
            case 3: case 12: seg(L(), R()); break;
            case 4: case 11: seg(R(), B()); break;
            case 6: case 9: seg(T(), B()); break;
            case 7: case 8: seg(L(), B()); break;
            case 5: seg(L(), T()); seg(R(), B()); break;
            case 10: seg(T(), R()); seg(L(), B()); break;
          }
        }
      }
    };

    const draw = () => {
      t += 0.01;
      if (frame++ % 40 === 0) color = getComputedStyle(canvas).color;
      ctx.clearRect(0, 0, w, h);

      // Team scheduler: a fresh set of agents co-acts each cycle.
      if (t >= nextTeam) {
        team = pickTeam();
        burstUntil = t + 1.7;
        nextTeam = t + 3.6;
      }
      const firing = t < burstUntil;

      // Activation: the firing team is held high; everything else decays to floor.
      for (let i = 0; i < NA; i++) {
        const a = agents[i];
        if (firing && team.includes(i)) a.a = 1;
        else a.a = FLOOR + (a.a - FLOOR) * 0.95;
      }

      // Coupling: Hebbian on co-activation, decay otherwise.
      for (let i = 0; i < NA; i++) {
        for (let j = i + 1; j < NA; j++) {
          const co = (agents[i].a - FLOOR) * (agents[j].a - FLOOR);
          coup[i][j] = Math.min(1, coup[i][j] * 0.97 + 0.06 * co);
        }
      }

      // Incident coupling per agent (drives membrane + presence).
      for (const a of agents) a.warm = 0;
      for (let i = 0; i < NA; i++) {
        for (let j = i + 1; j < NA; j++) {
          agents[i].warm += coup[i][j];
          agents[j].warm += coup[i][j];
        }
      }

      // Forces: home anchor + coupling spring toward a rest length + repulsion.
      for (const a of agents) {
        a.vx += HOME_K * (a.hx - a.x);
        a.vy += HOME_K * (a.hy - a.y);
      }
      for (let i = 0; i < NA; i++) {
        for (let j = i + 1; j < NA; j++) {
          if (coup[i][j] < COUP_THRESH) continue;
          const a = agents[i];
          const b = agents[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1e-6;
          const f = (PULL * coup[i][j] * (d - REST)) / d;
          a.vx += f * dx;
          a.vy += f * dy;
          b.vx -= f * dx;
          b.vy -= f * dy;
        }
      }
      for (let i = 0; i < NA; i++) {
        for (let j = i + 1; j < NA; j++) {
          const a = agents[i];
          const b = agents[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 1e-6 || d2 > REPEL_D * REPEL_D) continue;
          const d = Math.sqrt(d2);
          const rep = 0.005 * (1 - d / REPEL_D);
          a.vx -= (rep * dx) / d;
          a.vy -= (rep * dy) / d;
          b.vx += (rep * dx) / d;
          b.vy += (rep * dy) / d;
        }
      }
      for (const a of agents) {
        a.vx *= 0.86;
        a.vy *= 0.86;
        a.x += a.vx;
        a.y += a.vy;
      }

      const sx = (x: number) => x * w;
      const sy = (y: number) => y * h;

      // Membrane: paint the coupling-warmth field, contour the team.
      fieldArr.fill(0);
      const sg = 0.05 * GRID;
      const rad = Math.ceil(3 * sg);
      const inv = 1 / (2 * sg * sg);
      for (const a of agents) {
        const wgt = Math.min(1, a.warm) * 0.95;
        if (wgt < 0.04) continue;
        const sf = a.x * GRID;
        const tf = a.y * GRID;
        const gx0 = Math.max(0, Math.floor(sf - rad));
        const gx1 = Math.min(GRID, Math.ceil(sf + rad));
        const gy0 = Math.max(0, Math.floor(tf - rad));
        const gy1 = Math.min(GRID, Math.ceil(tf + rad));
        for (let gy = gy0; gy <= gy1; gy++) {
          for (let gx = gx0; gx <= gx1; gx++) {
            const ddx = gx - sf;
            const ddy = gy - tf;
            fieldArr[gy * (GRID + 1) + gx] += wgt * Math.exp(-(ddx * ddx + ddy * ddy) * inv);
          }
        }
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      LEVELS.forEach((lv, li) => {
        ctx.globalAlpha = 0.18 + li * 0.1;
        ctx.beginPath();
        contour(lv);
        ctx.stroke();
      });

      // Coupling edges between agents.
      for (let i = 0; i < NA; i++) {
        for (let j = i + 1; j < NA; j++) {
          const c = coup[i][j];
          if (c < 0.05) continue;
          const fire = Math.max(agents[i].a, agents[j].a) - FLOOR;
          ctx.globalAlpha = Math.min(0.85, 0.7 * c + 0.3 * fire);
          ctx.beginPath();
          ctx.moveTo(sx(agents[i].x), sy(agents[i].y));
          ctx.lineTo(sx(agents[j].x), sy(agents[j].y));
          ctx.stroke();
        }
      }

      // Child frames: activation dissipates into them.
      ctx.fillStyle = color;
      for (const a of agents) {
        for (const k of a.kids) {
          const kx = sx(a.x + k.dx);
          const ky = sy(a.y + k.dy);
          ctx.globalAlpha = 0.18 * a.a;
          ctx.beginPath();
          ctx.moveTo(sx(a.x), sy(a.y));
          ctx.lineTo(kx, ky);
          ctx.stroke();
          ctx.globalAlpha = 0.12 + 0.7 * (a.a * a.a);
          ctx.beginPath();
          ctx.arc(kx, ky, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Agents on top.
      for (const a of agents) {
        const warm = Math.min(1, a.warm);
        ctx.globalAlpha = 0.28 + 0.72 * Math.max(a.a * a.a, 0.5 * warm);
        ctx.beginPath();
        ctx.arc(sx(a.x), sy(a.y), 2 + 2.2 * a.a + 0.6 * warm, 0, Math.PI * 2);
        ctx.fill();
      }
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
