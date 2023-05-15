// @ts-nocheck
import * as PIXI from "pixi.js";
import Player from "./characters/Player";
import Zombie from "./characters/Zombie";
import Spawner from "./actions/Spawner";
import Weather from "./actions/Weather";
import { zombies, textStyle, subTextStyle } from "./globals";
import GameState from "./game-state";

let canvasSize = 370;
const canvas = document.getElementById("zombieHorde") as HTMLCanvasElement;
const app = new PIXI.Application({
  view: canvas,
  width: canvasSize,
  height: canvasSize,
  backgroundColor: 0x312a2b,
  resolution: 2,
});
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

//music
const music = new Audio("./assets/HordeZee.mp3");
music.volume = 0.3;
music.addEventListener("timeupdate", function () {
  if (this.currentTime > this.duration - 0.2) this.currentTime = 0;
});

//zombie sounds
const zombieSound = new Audio("./assets/horde.mp3");
zombieSound.volume = 0.5;
zombieSound.addEventListener("timeupdate", function () {
  if (this.currentTime > this.duration - 0.2) this.currentTime = 0;
});

//Start game
initGame();

async function initGame() {
  app.gameState = GameState.PRE_INTRO;

  try {
    console.log("Loading...");
    await loadAssets();
    console.log("Loaded");

    app.weather = new Weather({ app });
    let player = new Player({ app });
    let zombieSpawner = new Spawner({
      app,
      create: () => new Zombie({ app, player }),
    });

    let gamePreIntroScene = createScene("Zombie Horde", "Click to Continue");
    let gameStartScene = createScene("Zombie Horde", "Click to Start");
    let gameOverScene = createScene("Zombie Horde", "Game Over");

    app.ticker.add((delta) => {
      if (player.deadAttribute) app.gameState = GameState.GAME_OVER;
      gamePreIntroScene.visible = app.gameState === GameState.PRE_INTRO;
      gameStartScene.visible = app.gameState === GameState.START;
      gameOverScene.visible = app.gameState === GameState.GAME_OVER;

      switch (app.gameState) {
        case GameState.PRE_INTRO:
          player.scale = 4;
          break;
        case GameState.INTRO:
          player.scale -= 0.01;
          if (player.scale < 1) app.gameState = GameState.START;
          break;
        case GameState.RUNNING:
          player.update(delta);
          zombieSpawner.spawnsArray.forEach((zombie) => zombie.update(delta));
          bulletHitTest({
            bullets: player.shootingAttribute.bulletsAttribute,
            zombies: zombieSpawner.spawnsArray,
            bulletRadius: player.shootingAttribute.bulletRadiusAttribute,
            zombieRadius: 16,
          });
          break;
        default:
          break;
      }
    });
  } catch (error) {
    console.log(error.message);
    console.log("Load failed");
  }
}

function bulletHitTest({
  bullets,
  zombies,
  bulletRadius,
  zombieRadius,
}: {
  bullets: PIXI.Graphics[];
  zombies: Zombie[];
  bulletRadius: number;
  zombieRadius: number;
}) {
  bullets.forEach((bullet) => {
    zombies.forEach((zombie, index) => {
      let dx = zombie.position.x - bullet.position.x;
      let dy = zombie.position.y - bullet.position.y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < bulletRadius + zombieRadius) {
        zombies.splice(index, 1);
        zombie.kill();
      }
    });
  });
}

function createScene(sceneText: string, sceneSubText: string) {
  const sceneContainer = new PIXI.Container();

  const text = new PIXI.Text(sceneText, new PIXI.TextStyle(textStyle));
  text.x = app.screen.width / 2;
  text.y = 0;
  text.anchor.set(0.5, 0);

  const subText = new PIXI.Text(sceneSubText, new PIXI.TextStyle(subTextStyle));
  subText.x = app.screen.width / 2;
  subText.y = 50;
  subText.anchor.set(0.5, 0);

  sceneContainer.zIndex = 1;
  sceneContainer.addChild(text);
  sceneContainer.addChild(subText);
  app.stage.addChild(sceneContainer);
  return sceneContainer;
}

async function loadAssets() {
  return new Promise(
    (resolve: (value: unknown) => void, reject: (reason?: any) => void) => {
      zombies.forEach((zom) => PIXI.Loader.shared.add(`assets/${zom}.json`));
      PIXI.Loader.shared.add("assets/hero_male.json");
      PIXI.Loader.shared.add("bullet", "assets/bullet.png");
      PIXI.Loader.shared.add("rain", "assets/rain.png");
      PIXI.Loader.shared.onComplete.add(resolve);
      PIXI.Loader.shared.onError.add(reject);
      PIXI.Loader.shared.load();
    }
  );
}

function clickHandler() {
  switch (app.gameState) {
    case GameState.PRE_INTRO:
      app.gameState = GameState.INTRO;
      music.play();
      app.weather.enableSound();
      break;
    case GameState.START:
      app.gameState = GameState.RUNNING;
      zombieSound.play();
      break;
    default:
      break;
  }
}

document.addEventListener("click", clickHandler);
