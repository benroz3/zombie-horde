// @ts-nocheck
import * as PIXI from "pixi.js";
import Shooting from "../actions/Shooting";

export default class Player {
  private app: PIXI.Application;
  private player: PIXI.AnimatedSprite;
  private shooting: Shooting;
  private lastMouseButton: number;
  private healthBar: PIXI.Graphics;
  private maxHealth: number;
  private health: number;
  private dead: boolean;
  private idle: PIXI.AnimatedSprite;
  private shoot: PIXI.AnimatedSprite;

  constructor({ app }: { app: PIXI.Application }) {
    let sheet =
      PIXI.Loader.shared.resources["assets/hero_male.json"].spritesheet;
    this.app = app;
    this.player = new PIXI.AnimatedSprite(sheet?.animations["idle"]);
    this.idle = new PIXI.AnimatedSprite(sheet?.animations["idle"]);
    this.shoot = new PIXI.AnimatedSprite(sheet?.animations["shoot"]);
    this.shooting = new Shooting({ app, player: this });
    this.healthBar = new PIXI.Graphics();
    this.lastMouseButton = 0;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.dead = false;

    const margin = 16;
    const barHeight = 8;

    this.player.animationSpeed = 0.1;
    this.player.play();
    this.player.anchor.set(0.5, 0.3);
    this.player.position.set(app.screen.width / 2, app.screen.height / 2);

    this.healthBar.beginFill(0xff0000);
    this.healthBar.initialWidth = app.screen.width - 2 * margin;
    this.healthBar.drawRect(
      margin,
      app.screen.height - barHeight - margin / 2,
      this.healthBar.initialWidth,
      barHeight
    );
    this.healthBar.endFill();
    this.healthBar.zIndex = 1;
    this.app.stage.sortableChildren = true;
    this.app.stage.addChild(this.healthBar);

    app.stage.addChild(this.player);
  }

  set scale(scale: number) {
    this.player.scale.set(scale);
  }

  get scale() {
    return this.player.scale.x;
  }

  get width() {
    return this.player.width;
  }

  get position() {
    return this.player.position;
  }

  get shootingAttribute() {
    return this.shooting;
  }

  get deadAttribute() {
    return this.dead;
  }

  attack() {
    this.health -= 1;
    this.healthBar.width =
      (this.health / this.maxHealth) * this.healthBar.initialWidth;

    if (this.health <= 0) this.dead = true;
  }

  update(delta: number) {
    if (this.dead) return;

    const mouse = this.app.renderer.plugins.interaction.mouse;
    const cursorPosition = mouse.global;
    let angle =
      Math.atan2(
        cursorPosition.y - this.player.position.y,
        cursorPosition.x - this.player.position.x
      ) +
      Math.PI / 2;
    this.rotation = angle;
    this.player.scale.x = cursorPosition.x < this.player.position.x ? -1 : 1;

    if (mouse.buttons !== this.lastMouseButton) {
      this.player.textures =
        mouse.buttons === 0 ? this.idle.textures : this.shoot.textures;
      this.player.play();
      this.shooting.shoot = mouse.buttons !== 0;
      this.lastMouseButton = mouse.buttons;
    }
    this.shooting.update(delta);
  }
}
