"use strict";

import * as Phaser from "phaser";

import Player from "./player";
import { setGrid } from "./pathfinding";

import EasyStar from "easystarjs";

export class TestScene extends Phaser.Scene {
  finder: any;
  map: any;
  berries: any;
  player: any;
  camera: any;
  music: any;
  initMusic: any;

  constructor() {
    super("");
  }

  preload() {
    // load in the image
    this.load.image("tileset", "resources/tileset-extruded.png");
    this.load.tilemapTiledJSON("map", "resources/map.json");
    this.load.atlas("atlas", "resources/atlas.png", "resources/atlas.json");
    this.load.audio("theme_song", ["resources/theme.mp3"]);
  }

  create() {
    var music = this.sound.add("theme_song", {
      mute: false,
      volume: 0.25,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0
    });

    this.initMusic = () => {
      this.music = music.play();
    };

    const map = this.make.tilemap({
      key: "map",
      tileWidth: 8,
      tileHeight: 8
    });

    this.map = map;
    this.finder = new EasyStar.js();
    const tileset = map.addTilesetImage("tileset", "tileset", 8, 8, 2, 4);
    // const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
    const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
    worldLayer.setCollisionByProperty({ collide: true });
    // const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

    // add an image to the scene
    const cursor = this.physics.add
      .sprite(8, 8, "atlas", "cursor-default")
      .setSize(8, 8);

    this.player = new Player(this);
    this.physics.add.collider(this.player.sprite, worldLayer);
    setGrid(this.finder, map);
    const camera = this.cameras.main;
    this.camera = camera;
    camera.startFollow(this.player.sprite);
    camera.roundPixels = true;
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.input.on(
      "pointermove",
      function(pointer) {
        let x = this.camera.scrollX + pointer.x - 4;
        let y = this.camera.scrollY + pointer.y - 4;
        var toX = 8 * Math.round(x / 8);
        var toY = 8 * Math.round(y / 8);
        cursor.x = toX + 4;
        cursor.y = toY + 4;
      },
      this
    );

    const berriesPoint: any = this.map.findObject(
      "Objects",
      obj => obj.name === "Berries"
    );

    this.berries = this.physics.add
      .sprite(berriesPoint.x, berriesPoint.y, "atlas", "berries-full")
      .setSize(8, 8);

    this.anims.create({
      key: "berries-full",
      frames: this.anims.generateFrameNames("atlas", {
        prefix: "berries-full.",
        start: 0,
        end: 3,
        zeroPad: 3
      }),
      frameRate: 1,
      repeat: -1
    });

    this.anims.create({
      key: "berries-empty",
      frames: this.anims.generateFrameNames("atlas", {
        prefix: "berries-empty.",
        start: 0,
        end: 3,
        zeroPad: 3
      }),
      frameRate: 1,
      repeat: -1
    });

    this.berries.anims.play(`berries-full`, true);

    this.berries.resourceType = "berries";
    this.berries.resourceCount = 5;

    this.berries.setInteractive();

    this.input.on("gameobjectdown", (pointer, gameObject) => {
      if (this.physics.overlap(this.player.sprite, gameObject)) {
        // console.log(gameObject);
        this.player.harvesting = true;
        this.player.sprite.anims.play(`misa-harvest`, true);

        if (gameObject.resourceType === "berries") {
          this.player.inventory["Berries"] =
            this.player.inventory["Berries"] || 0;
          if (this.berries.resourceCount > 0) {
            this.berries.resourceCount--;
            this.player.inventory["Berries"]++;
          } else {
            // this.berries.anims.anims.stop();
            this.berries.anims.play(`berries-empty`, true);
            this.player.sprite.anims.stop();
            this.player.harvesting = false;
          }
          console.log("player inventory", this.player.inventory);
        }
      }
    });
  }

  update(time, delta) {
    // if (!this.tweens.isTweening(this.player.sprite)) {
    //   this.player.sprite.anims.stop();
    // }
  }
}
