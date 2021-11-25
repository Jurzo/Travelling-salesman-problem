import { useEffect, useRef, useState } from "react";
import { AntColony } from "../tsp/Ant";
import { getPathDynamic } from "../tsp/Dynamic";
import { generateMatrix, generateNodes, getMatrixPaths, getMatrixWeights, nodesToLines } from "../tsp/Util";
import { Renderer } from "../util/Renderer";

const SCALE = 20;

export class Visualizer {
  private nodes: [number, number][];
  private mat: number[][];
  private matPaths: [number,number][];
  private colony: AntColony;
  private renderer: Renderer;
  private running: boolean;

  constructor(renderer: Renderer, amount: number) {
    this.nodes = generateNodes(amount, SCALE);
    this.mat = generateMatrix(this.nodes);
    this.matPaths = getMatrixPaths(this.mat);
    this.colony = new AntColony(40, this.mat);
    this.renderer = renderer;
    this.running = false;
  }

  toggle(state: boolean): void {
    this.running = state;
    state && this.loop();
  }

  loop = (): void => {
      this.colony.initTour();
      while (true) {
        if (this.colony.travel()) break;
      }
      this.colony.finishTour();
      const { tour, cost } = this.colony.getBestAnt();
      const trail = getMatrixWeights(this.colony.getTrail(),  this.matPaths);
      this.renderer.genRouteVAO(nodesToLines(this.nodes, SCALE), this.colony.getBestTour());
      this.renderer.setWeights(trail.weights);
      this.renderer.genTrailVAO(nodesToLines(this.nodes, SCALE), trail.indices);
      this.renderer.draw();
      this.running && requestAnimationFrame(this.loop.bind( this ));
    }
}

export default Visualizer;