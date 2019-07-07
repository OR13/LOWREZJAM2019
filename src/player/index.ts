import { moveSprite } from "../pathfinding";

export default class Player {
  sprite: any;

  inventory: any;
  constructor(scene) {
    this.inventory = {};
    const spawnPoint: any = scene.map.findObject(
      "Objects",
      obj => obj.name === "Spawn Point"
    );

    this.sprite = scene.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
      .setSize(8, 8);

    scene.input.on(
      "pointerdown",
      function(pointer) {
        if (!scene.music) {
          scene.initMusic();
        }

        if (!this.harvesting) {
          var x = scene.camera.scrollX + pointer.x;
          var y = scene.camera.scrollY + pointer.y;
          var toX = Math.floor(x / 8);
          var toY = Math.floor(y / 8);
          var fromX = Math.floor(this.sprite.x / 8);
          var fromY = Math.floor(this.sprite.y / 8);
          scene.finder.findPath(fromX, fromY, toX, toY, path => {
            if (path === null) {
              console.warn("Path was not found.");
            } else {
              moveSprite(scene, this.sprite, path);
            }
          });
          scene.finder.calculate();
        }
      },
      this
    );

    const { anims } = scene;

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

    anims.create({
      key: "misa-harvest",
      frames: anims.generateFrameNames("atlas", {
        prefix: "misa-harvest.",
        start: 0,
        end: 3,
        zeroPad: 3
      }),
      frameRate: 7,
      repeat: -1
    });
  }
}
