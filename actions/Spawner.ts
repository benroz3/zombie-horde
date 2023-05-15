// @ts-nocheck
import GameState from "../game-state";

export default class Spawner {
  private create: any;
  private maxSpawns: number;
  private spawns: any[];
  private app: PIXI.Application;

  constructor({ app, create }: { app: PIXI.Application; create: any }) {
    this.maxSpawns = 30;
    this.create = create;
    this.spawns = [];
    this.app = app;

    const spawnInterval = 1000; //1 sec
    setInterval(() => this.spawn(), spawnInterval);
  }

  get spawnsArray() {
    return this.spawns;
  }

  spawn() {
    if (this.app.gameState !== GameState.RUNNING) return;
    if (this.spawns.length >= this.maxSpawns) return;

    let enemy = this.create();
    this.spawns.push(enemy);
  }
}
