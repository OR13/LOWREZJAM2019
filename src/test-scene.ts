"use strict";

import * as Phaser from "phaser";

import ai from "./ai-test";

export class TestScene extends Phaser.Scene {
  constructor() {
    super("");
  }

  preload() {
    // load in the image
    this.load.image("cursor", "resources/cursor.png");
    this.load.image("tiles", "resources/tiled/tiles.png");
    this.load.tilemapTiledJSON("map", "resources/tiled/map.json");
  }

  create() {
    const map = this.make.tilemap({
      key: "map",
      tileWidth: 8,
      tileHeight: 8
    });
    const tileset = map.addTilesetImage("tiles");
    const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
    const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
    const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

    // add an image to the scene
    const cursor = this.add.image(0, 0, "cursor");

    // move the image when you move the mouse
    this.input.on(
      "pointermove",
      function(pointer) {
        cursor.x = pointer.x;
        cursor.y = pointer.y;
      },
      this
    );

    // ai();
  }
}
