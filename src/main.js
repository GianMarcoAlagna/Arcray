import {sketch}  from "./core/main.js"
//* NEED TO ADAPT THIS FOR THE MAIN.JS ENGINE CODE
document.addEventListener("DOMContentLoaded", function () {
  main();
});

function main() {
  const container = document.createElement("div");
  const mySketch = document.createElement("div");

  container.classList.add("container");
  mySketch.classList.add("mySketch");

  container.appendChild(mySketch);
  document.body.appendChild(container);
  const sketchFunc = sketch;
  new p5(sketchFunc, mySketch);
}
