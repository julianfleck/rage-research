import type { Simulation, SimulationNodeDatum, SimulationLinkDatum } from "d3-force";

export interface Node extends SimulationNodeDatum {
  id: string;
  r: number;
  shade: number;
  kind?: string;
  alpha?: number;
  accent?: boolean;
  trail?: Array<[number, number]>;
  trailMax?: number;
  rgb?: [number, number, number];
}

export interface Link extends SimulationLinkDatum<Node> {
  weight?: number;
  alpha?: number;
}

export type Sim = Simulation<Node, Link>;

export type ThemeName = "dark" | "light";

export interface Scene {
  id: string;
  title: string;
  apply(ctx: SceneContext): void;
  tick?(ctx: SceneContext): void;
  draw?(canvasCtx: CanvasRenderingContext2D, ctx: SceneContext): void;
  cleanup?(): void;
  /** Return true to consume the click (prevent the global slide-advance). */
  onClick?(ev: MouseEvent): boolean;
}

export interface SceneContext {
  sim: Sim;
  nodes: Node[];
  links: Link[];
  width: number;
  height: number;
  setTitle(text: string): void;
  /** Current theme, so scene-level draws can pick light/dark colours. */
  theme: ThemeName;
}

export interface ImageSlide {
  type: "image";
  src: string;
  id?: string;
}

export interface SimulationSlide {
  type: "simulation";
  sceneId: string;
}

export type Slide = ImageSlide | SimulationSlide;
