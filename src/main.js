//* NEED TO ADAPT THIS FOR THE MAIN.JS ENGINE CODE
document.addEventListener("DOMContentLoaded", function () {
  main();
});

function main() {
  const container = document.createElement("div");
  const sketch = document.createElement("div");

  container.classList.add("container");
  sketch.classList.add("sketch");

  const sketchFunc = function (p) {
    p.setup = function () {
      const width = container.offsetWidth || 400;
      const height = container.offsetHeight || 400;
      p.createCanvas(width, height);
    };

    p.draw = function () {
      p.background(12);
    };
  };

  new p5(sketchFunc, sketch);
  container.appendChild(sketch);
  document.body.appendChild(container);
}
