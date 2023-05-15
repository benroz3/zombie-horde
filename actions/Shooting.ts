// @ts-nocheck
import * as PIXI from "pixi.js";
import Victor from "victor";
import Player from "../characters/Player";

export default class Shooting {
  private app: PIXI.Application;
  private player: PIXI.AnimatedSprite;
  private bullets: PIXI.Graphics[];
  private bulletSpeed: number;
  private bulletRadius: number;
  private maxBullets: number;
  private interval: NodeJS.Timer;
  private audio: HTMLAudioElement;

  constructor({
    app,
    player,
  }: {
    app: PIXI.Application;
    player: PIXI.AnimatedSprite;
  }) {
    this.app = app;
    this.player = player;
    this.bullets = [];
    this.bulletSpeed = 4;
    this.bulletRadius = 8;
    this.maxBullets = 3;
    this.audio = new Audio("../assets/shoot.mp3");
    
    this.audio.volume = 0.4;

  }

  get bulletRadiusAttribute() {
    return this.bulletRadius;
  }

  get bulletsAttribute() {
    return this.bullets;
  }

  fire() {
    this.audio.currentTime = 0;
    this.audio.play();
    if (this.bullets.length >= this.maxBullets) {
      let excessBullet: PIXI.Graphics | undefined = this.bullets.shift();
      if (excessBullet) this.app.stage.removeChild(excessBullet);
    }

    this.bullets.forEach((bullet) => this.app.stage.removeChild(bullet));
    this.bullets = this.bullets.filter(
      (bullet) =>
        Math.abs(bullet.position.x) < this.app.screen.width &&
        Math.abs(bullet.position.y) < this.app.screen.height
    );
    this.bullets.forEach((bullet) => this.app.stage.addChild(bullet));

    const bullet = new PIXI.Sprite(
      PIXI.Loader.shared.resources["bullet"].texture
    );
    bullet.anchor.set(0.5);
    bullet.scale.set(0.2);
    bullet.position.set(this.player.position.x, this.player.position.y);
    bullet.rotation = this.player.rotation;
    let angle = this.player.rotation - Math.PI / 2;

    bullet.velocity = new Victor(
      Math.cos(angle),
      Math.sin(angle)
    ).multiplyScalar(this.bulletSpeed);
    this.bullets.push(bullet);
    this.app.stage.addChild(bullet);
  }

  set shoot(shooting: Shooting) {
    if (shooting) {
      this.fire();
      this.interval = setInterval(() => this.fire(), 500);
    } else {
      clearInterval(this.interval);
    }
  }

  update(delta: number) {
    this.bullets.forEach((bullet) =>
      bullet.position.set(
        bullet.position.x + bullet.velocity.x * delta,
        bullet.position.y + bullet.velocity.y * delta
      )
    );
  }
}
