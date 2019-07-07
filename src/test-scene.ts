"use strict";

import * as Phaser from "phaser";

import ai from "./ai-test";

import EasyStar from "easystarjs";

let player;
let cursors;

let flag1 = false;

export class TestScene extends Phaser.Scene {
  finder: any;
  map: any;
  player: any;
  camera: any;

  constructor() {
    super("");
  }

  getTileID(x, y) {
    var tile = this.map.getTileAt(x, y);
    return tile.index;
  }

  pointsToDirection(x1, y1, x2, y2) {
    let ret;
    if (x1 != x2) {
      if (x1 - x2 < 0) {
        ret = "right";
      } else {
        ret = "left";
      }
    }

    if (y1 != y2) {
      if (y1 - y2 < 0) {
        ret = "front";
      } else {
        ret = "back";
      }
    }

    return ret;
  }

  moveCharacter = function(path) {
    // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
    var tweens = [];
    for (var i = 0; i < path.length - 1; i++) {
      var ex = path[i + 1].x;
      var ey = path[i + 1].y;

      let walkingDirection = this.pointsToDirection(
        path[i + 0].x,
        path[i + 0].y,
        path[i + 1].x,
        path[i + 1].y
      );
      tweens.push({
        targets: this.player,
        onComplete: () => {
          if (player.walkingDirection !== walkingDirection) {
            player.anims.play(`misa-${walkingDirection}-walk`, true);
          }
        },
        x: { value: ex * this.map.tileWidth, duration: 200 },
        y: { value: ey * this.map.tileHeight, duration: 200 }
      });
    }

    this.tweens.timeline({
      tweens: tweens
    });
  };

  findPath(fromX, fromY, toX, toY) {
    this.finder.findPath(fromX, fromY, toX, toY, path => {
      if (path === null) {
        console.warn("Path was not found.");
      } else {
        this.moveCharacter(path);
      }
    });
    this.finder.calculate();
  }

  preload() {
    // load in the image
    this.load.image("cursor", "resources/cursor.png");
    this.load.image("tileset", "resources/tileset-extruded.png");
    this.load.tilemapTiledJSON("map", "resources/map.json");
    this.load.atlas("atlas", "resources/atlas.png", "resources/atlas.json");
  }

  create() {
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
    // const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

    // add an image to the scene
    const cursor = this.add.image(26, 4, "cursor");
    this.input.on(
      "pointermove",
      function(pointer) {
        cursor.x = this.camera.scrollX + pointer.x;
        cursor.y = this.camera.scrollY + pointer.y;
      },
      this
    );

    worldLayer.setCollisionByProperty({ collide: true });

    const spawnPoint: any = map.findObject(
      "Objects",
      obj => obj.name === "Spawn Point"
    );

    player = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
      .setSize(8, 8);
    // .setOffset(0, 24);

    this.player = player;

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this.physics.add.collider(player, worldLayer);

    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.
    const anims = this.anims;
    anims.create({
      key: "misa-left-walk",
      frames: anims.generateFrameNames("atlas", {
        prefix: "misa-left-walk.",
        start: 0,
        end: 3,
        zeroPad: 3
      }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "misa-right-walk",
      frames: anims.generateFrameNames("atlas", {
        prefix: "misa-right-walk.",
        start: 0,
        end: 3,
        zeroPad: 3
      }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "misa-front-walk",
      frames: anims.generateFrameNames("atlas", {
        prefix: "misa-front-walk.",
        start: 0,
        end: 3,
        zeroPad: 3
      }),
      frameRate: 10,
      repeat: -1
    });
    anims.create({
      key: "misa-back-walk",
      frames: anims.generateFrameNames("atlas", {
        prefix: "misa-back-walk.",
        start: 0,
        end: 3,
        zeroPad: 3
      }),
      frameRate: 10,
      repeat: -1
    });

    const camera = this.cameras.main;
    this.camera = camera;
    camera.startFollow(player);
    camera.roundPixels = true;
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    cursors = this.input.keyboard.createCursorKeys();

    var grid = [];
    for (var y = 0; y < this.map.height; y++) {
      var col = [];
      for (var x = 0; x < this.map.width; x++) {
        // In each cell we store the ID of the tile, which corresponds
        // to its index in the tileset of the map ("ID" field in Tiled)
        col.push(this.getTileID(x, y));
      }
      grid.push(col);
    }
    this.finder.setGrid(grid);

    var properties = tileset.tileProperties;
    var acceptableTiles = [];

    for (var i = tileset.firstgid - 1; i < tileset.total; i++) {
      // firstgid and total are fields from Tiled that indicate the range of IDs that the tiles can take in that tileset
      if (!properties.hasOwnProperty(i)) {
        // If there is no property indicated at all, it means it's a walkable tile
        acceptableTiles.push(i + 1);
        continue;
      }
      if (!properties[i].collide) acceptableTiles.push(i + 1);
      if (properties[i].cost)
        this.finder.setTileCost(i + 1, properties[i].cost); // If there is a cost attached to the tile, let's register it
    }
    this.finder.setAcceptableTiles(acceptableTiles);

    this.input.on(
      "pointerdown",
      function(pointer) {
        var x = this.camera.scrollX + pointer.x;
        var y = this.camera.scrollY + pointer.y;
        var toX = Math.floor(x / 8);
        var toY = Math.floor(y / 8);
        var fromX = Math.floor(this.player.x / 8);
        var fromY = Math.floor(this.player.y / 8);
        this.findPath(fromX, fromY, toX, toY);
      },
      this
    );
  }

  update(time, delta) {
    if (!this.tweens.isTweening(this.player)) {
      player.anims.stop();
    }
  }
}
