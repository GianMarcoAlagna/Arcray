// **********************************
//              INIT
const worldManager = new World();
//***********************************

function setup() {
  createCanvas(400, 400);
  const w = 400;
  const h = 400;

  // create local player
  const player = worldManager.createPlayer(
    { x: w / 2, y: h / 2 },
    true // mark this as the local player
  );

  // assign a debug draw function to the player
  player.drawFunction = (v) => {
    push();
    translate(v.x, v.y);
    rotate(v.angle);

    // draw a simple "ship" (triangle) facing right
    fill(100, 200, 255);
    noStroke();
    triangle(-10, -10, -10, 10, 15, 0);

    pop();
  };
}

function draw() {
  background(220);

  const dTime = deltaTime / 16.67; // normalize relative to ~60fps
  worldManager.tick(dTime);
}
