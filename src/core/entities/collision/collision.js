export default class CollisionManager {
  constructor(world) {
    this.world = world;
    this.cellSize = 50;
    this.cells = {};
  }

  checkCollisions() {
    for (const cell in this.cells) {
      let objs = this.cells[cell];

      if (objs.length > 1) {
        for (let i = 0; i < objs.length; i++) {
          for (let j = i + 1; j < objs.length; j++) {
            let a = objs[i],
              b = objs[j];
            if (dist(a.x, a.y, b.x, b.y) < a.r + b.r) {
              this.world.events.fireEvent("collision", a, b);
            }
          }
        }
      }
    }
  }

  findCell(x = 0, y = 0) {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
  }

  cellExists(cell) {
    return !!this.cells[cell];
  }

  createCell(cell, val = []) {
    if (!this.cellExists(cell)) this.cells[cell] = val;
  }

  // this needs to be called for each entity that exists;
  updateCollisionCells(obj) {
    // find the range of cells where obj could possibly be;
    let minCol = Math.floor((obj.vector.x - obj.size) / this.cellSize);
    let maxCol = Math.floor((obj.vector.x + obj.size) / this.cellSize);
    let minRow = Math.floor((obj.vector.y - obj.size) / this.cellSize);
    let maxRow = Math.floor((obj.vector.y + obj.size) / this.cellSize);

    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        let cell = `${col},${row}`;
        if (!this.cellExists(cell)) this.createCell(cell);
        this.cells[cell].push(obj);
      }
    }
  }

  clearCells() {
    this.cells = {};
    return this.cells;
  }

  update() {
    this.clearCells();
    Object.values(this.world.entities).forEach((list) => {
      list.forEach((obj) => this.updateCollisionCells(obj));
    });
    return this.cells;
  }
}

export class CollisionObject {
  constructor(obj) {
    this.obj = obj;
  }
}
