export const setGrid = (finder, map) => {
  var grid = [];
  for (var y = 0; y < map.height; y++) {
    var col = [];
    for (var x = 0; x < map.width; x++) {
      // In each cell we store the ID of the tile, which corresponds
      // to its index in the tileset of the map ("ID" field in Tiled)
      col.push(map.getTileAt(x, y).index);
    }
    grid.push(col);
  }

  finder.setGrid(grid);

  var tileset = map.tilesets[0];
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
    if (properties[i].cost) finder.setTileCost(i + 1, properties[i].cost); // If there is a cost attached to the tile, let's register it
  }
  finder.setAcceptableTiles(acceptableTiles);
};

const pointsToDirection = (x1, y1, x2, y2) => {
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
};

export const moveSprite = (scene, sprite, path) => {
  var tweens = [];

  if (!path.length) {
    return;
  }

  let walkingDirection = pointsToDirection(
    path[0].x,
    path[0].y,
    path[1].x,
    path[1].y
  );
  sprite.anims.play(`misa-${walkingDirection}-walk`, true);

  for (var i = 0; i < path.length - 1; i++) {
    var ex = path[i + 1].x;
    var ey = path[i + 1].y;

    walkingDirection = pointsToDirection(
      path[i + 0].x,
      path[i + 0].y,
      path[i + 1].x,
      path[i + 1].y
    );
    tweens.push({
      targets: sprite,
      onComplete: () => {
        sprite.anims.play(`misa-${walkingDirection}-walk`, true);
      },
      x: { value: ex * scene.map.tileWidth, duration: 200 },
      y: { value: ey * scene.map.tileHeight, duration: 200 }
    });
  }

  tweens.push({
    targets: sprite,
    onComplete: () => {
      sprite.anims.stop();
    },
    x: { value: path[path.length - 1].x * scene.map.tileWidth, duration: 0 },
    y: { value: path[path.length - 1].y * scene.map.tileHeight, duration: 0 }
  });

  scene.tweens.timeline({
    tweens: tweens
  });
};
