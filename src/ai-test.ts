import * as synaptic from "synaptic";

let iteration = 0;
let perceptron = new synaptic.Architect.Perceptron(2, 10, 10, 3);
let context;
let game_canvas_data = null;

let canvas: any = document.getElementById("ai-canvas");
context = canvas.getContext("2d");

const map_resolution_px = 64;

var getData = function(imageObj) {
  context.drawImage(imageObj, 0, 0);
  var imageData = context.getImageData(
    0,
    0,
    map_resolution_px,
    map_resolution_px
  );
  return imageData.data;
};

var iterate = function() {
  for (var x = 0; x < map_resolution_px; x += 1) {
    for (var y = 0; y < map_resolution_px; y += 1) {
      var dynamicRate = 0.01 / (3 + 0.00005 * iteration);
      let px = pixel(game_canvas_data, x, y);
      perceptron.activate([x / map_resolution_px, y / map_resolution_px]);
      perceptron.propagate(dynamicRate, pixel(game_canvas_data, x, y));
    }
  }
  preview();
};

var pixel = function(data, x, y) {
  var red = data[(map_resolution_px * y + x) * 4];
  var green = data[(map_resolution_px * y + x) * 4 + 1];
  var blue = data[(map_resolution_px * y + x) * 4 + 2];

  return [red / 255, green / 255, blue / 255];
};

var preview = function() {
  // console.log(++iteration);
  var imageData = context.getImageData(
    0,
    0,
    map_resolution_px,
    map_resolution_px
  );
  for (var x = 0; x < map_resolution_px; x++) {
    for (var y = 0; y < map_resolution_px; y++) {
      var rgb = perceptron.activate([
        x / map_resolution_px,
        y / map_resolution_px
      ]);
      imageData.data[(map_resolution_px * y + x) * 4] = rgb[0] * 255;
      imageData.data[(map_resolution_px * y + x) * 4 + 1] = rgb[1] * 255;
      imageData.data[(map_resolution_px * y + x) * 4 + 2] = rgb[2] * 255;
    }
  }
  context.putImageData(imageData, 0, 0);
  requestAnimationFrame(iterate);
};

export default () => {
  setTimeout(() => {
    const source = document.getElementsByTagName("canvas")[0];
    game_canvas_data = getData(source);
    preview();
  }, 1 * 1000);
};
