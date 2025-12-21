import * as p5 from "./p5.min.js";

function clampVector(vec, maxLength) {
  const length = Math.hypot(vec.x, vec.y);
  if (length > maxLength) {
    const scale = maxLength / length; // shrink proportionally
    return { x: vec.x * scale, y: vec.y * scale };
  }
  return { x: vec.x, y: vec.y }; // unchanged if within limit
}

class World {
  constructor (size = { width: 0, height: 0 }) {
    this.size         = size;
    this.systems      = new Map();
    this.localPlayer  = null;
    this.entitySystem = new EntitySystem();
    this.entities     = this.entitySystem.entities;
    this.dTime        = 0;
  }
  
  tick(dTime = 0) {
    this.dTime = dTime;
    this.systems.forEach(system => system.update(dTime));
  }
  
  registerSystem(sys) {
    sys.world = this;
    this.systems.set(sys.name, sys);
    return sys;
  }
}

class System {
  constructor (name) {
    this.name = name;
  }
  
  update ({dTime = 0}) {}
}

// ******************** MANAGERS ***********************
class RenderSystem extends System {
  constructor () {
    super("render")
  }
  
  update () {
    const entities = this.world.entitySystem.getEntities(e => e.hasComponent("render"));
    entities.forEach(entity => {
      
      entity.getComponent("render").drawFn(entity);
      // console.log(entity)
    });
  }
}

class CollisionSystem extends System {
  constructor () {
    super("collision");
    this.cellSize = 50;
    this.cells = {};
  }
  
  checkCollisions () {
    for (const cell in this.cells) {
      const entities = this.cells[cell];
      if (entities.length > 1) {
        for (let i = 0; i < entities.length; i++) {
          for (let j = i + 1; j < entities.length; j++) {
            let a = entities[i], b = entities[j];
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
  
  cellExists (cell) {
    return !!this.cells[cell];
  }
  
  createCell (cell, val = []) {
    if (!this.cellExists(cell)) this.cells[cell] = val;
  }
  
  // this needs to be called for each entity that exists;
  updateCollisionCells (obj) {
    // find the range of cells where obj could possibly be;
    let minCol = Math.floor((obj.position.x - obj.size) / this.cellSize);
    let maxCol = Math.floor((obj.position.x + obj.size) / this.cellSize);
    let minRow = Math.floor((obj.position.y - obj.size) / this.cellSize);
    let maxRow = Math.floor((obj.position.y + obj.size) / this.cellSize);
    
    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        let cell = `${col},${row}`;
        if (!this.cellExists(cell)) this.createCell(cell);
        this.cells[cell].push(obj);
      }
    }
  }
  
  clearCells () {
    this.cells = {};
    return this.cells;
  }
  
  update () {
    this.clearCells();
    const entities = this.world.entitySystem.getEntities(e => e.hasComponent("collision"));
    entities.forEach(entity => {
      this.updateCollisionCells(entity)
    });
    return this.cells;
  } 
}

class CollisionObject {
  constructor (entity) {
    this.entity = entity;
  }
}

class EventSystem {
  constructor () {
    this.events = {};
  }
  
  on (event, callback, ...args) {
    if (!event || !callback) {
      console.log("You must pass both and event and a callback");
      return;
    }
    
    const cb = (...eArgs) => callback(...args, ...eArgs);
    return this.createEvent(event, cb);
  }
  
  eventExists (event) {
    return !!this.events[event];
  }
  
  createListener (event) {
    this.events[event] = new EventListener(event);
  }
  
  createEvent (event, callback) {
    if (!this.eventExists(event)) this.createListener(event);
    return this.events[event].callbacks.push(callback);
  }
  
  fireEvent (event, ...args) {
    if (this.eventExists(event)) {
      const listener = this.events[event];
      return listener.callbacks.map(cb => cb(...args));
    }
  }
}

class EventListener {
  constructor (name = "") {
    if (!name.length) return null;
    this.name = name;
    this.callbacks = [];
  }
}

class EntitySystem {
  constructor () {
    this.entities = new Map();
    this.nextId = 0;
  }
  
  createEntity(entity) {
    const id = this.nextId++;
    entity.id = id;
    this.entities.set(id, entity);
    return entity;
  }

  getEntities(filterFn) {
    return Array.from(this.entities.values()).filter(filterFn);
  }
}

class RotationSystem extends System {
  constructor () {
    super("rotation");
  }

  update (dTime) {
    const entities = this.world.entitySystem.getEntities(e => e.hasComponent("rotation"));
    entities.forEach(entity => {
      const target = entity.getComponent("rotation");
      if (target) {
        let current = entity.rotation;
        let delta = target.targetAngle - current;

        // normalize to [-PI, PI]
        delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;
          
        const turnRadius = target.maxTurn || Math.PI / 60;
        // clamp rotation
        const turn = Math.max(-turnRadius * dTime, Math.min(turnRadius * dTime, delta));
        entity.rotation += turn;
      }
    });
  }
}

class MovementSystem extends System {
  constructor () {
    super("movement");
  }

  update (dTime) {
    const entities = this.world.entitySystem.getEntities(e => e.hasComponent("movement"));
    entities.forEach(entity => {
      const move = entity.getComponent("movement");
      if (!move) return;
        
      const velocity = move.velocity;
      // normalize the input vector with it's magnitude;
      const input = entity.getComponent("input");
      const inputMagnitude = input ? Math.hypot(input.inputVector.x, input.inputVector.y) : 0;
        
      // check if the entity wants to move;
      if (inputMagnitude > 0) {
        const normalized = { 
          x: input.inputVector.x / inputMagnitude,
          y: input.inputVector.y / inputMagnitude
        };
          
        velocity.x += normalized.x * move.acceleration;
        velocity.y += normalized.y * move.acceleration;
          
        const clamped = clampVector(velocity, move.maxSpeed);
        velocity.x = clamped.x;
        velocity.y = clamped.y;
      } else {
        velocity.x *= (1 - move.deceleration);
        velocity.y *= (1 - move.deceleration);
      }
        
        // apply movement with respect to delta frame time
      entity.position.x += velocity.x;
      entity.position.y += velocity.y;
    });
  }
}

class VehicleMovementSystem extends System {
  constructor() {
    super("vehicle")
  }
  
  update(dTime) {
    const entities = this.world.entitySystem.getEntities(e => e.hasComponent("vehicle"));
    entities.forEach(entity => {
      const vehicle = entity.getComponent("vehicle");
      const move = entity.getComponent("movement");
      if (!vehicle || !move) return;

      // forward/backward throttle affects speed along rotation;
      const effectiveSpeed = vehicle.throttle * move.maxSpeed;
      entity.velocity.x = Math.cos(entity.rotation) * effectiveSpeed;
      entity.velocity.y = Math.sin(entity.rotation) * effectiveSpeed;

      // apply movement with respect to frametime
      entity.position.x += entity.velocity.x * dTime;
      entity.position.y += entity.velocity.y * dTime;
    });
  }
}

class InputSystem extends System {
  constructor() {
    super("input");
    this.keysDown = new Set();
    this.mouse    = { x: 0, y: 0 };
    this.keyMap   = {
      "KeyW": "up",
      "KeyS": "down",
      "KeyA": "left",
      "KeyD": "right",
    };

    // listen for keyboard / mouse events
    window.addEventListener("keydown", e => this.keysDown.add(e.code));
    window.addEventListener("keyup", e => this.keysDown.delete(e.code));
    window.addEventListener("mousemove", e => this.onMouseMove(e));
    window.addEventListener("mousedown", e => this.onMouseDown(e));
    window.addEventListener("mouseup", e => this.onMouseUp(e));
    window.addEventListener("contextmenu", e => e.preventDefault());
  }

  onMouseMove(e) {
    const rect = (this.world.canvas || e.target).getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  onMouseDown(e) {
    if (e.button === 2) {
      const entities = this.world.entitySystem.getEntities(e => e.hasComponent("input"));
      entities.forEach(entity => {
        const input = entity.getComponent("input");
        if (input) input.isAiming = true;
      });
    }
  }

  onMouseUp(e) {
    if (e.button === 2) {
      const entities = this.world.entitySystem.getEntities(e => e.hasComponent("input"));
      entities.forEach(entity => {
        const input = entity.getComponent("input");
        if (input) input.isAiming = false;
      });
    }
  }

  update() {
    const entities = this.world.entitySystem.getEntities(e => e.hasComponent("input"));
    entities.forEach(entity => {
      const input = entity.getComponent("input");
      if (!input) return;

      // reset input vector
      input.inputVector.x = 0;
      input.inputVector.y = 0;

      // WASD -> input vector
      if (this.keysDown.has("KeyW")) input.inputVector.y -= 1;
      if (this.keysDown.has("KeyS")) input.inputVector.y += 1;
      if (this.keysDown.has("KeyA")) input.inputVector.x -= 1;
      if (this.keysDown.has("KeyD")) input.inputVector.x += 1;

      // aiming: set targetAngle for rotation system
      if (input.isAiming) {
        const rotation = entity.getComponent('rotation');
        const dx = this.mouse.x - entity.position.x;
        const dy = this.mouse.y - entity.position.y;
        
        rotation.targetAngle = Math.atan2(dy, dx);
      }
    });
  }
}

// ******************* COMPONENTS *********************
// health component (works for characters, vehicles, props, etc.)
class HealthComponent {
  constructor({ maxHealth = 100, startingHealth = 100 }) {
    this.health = startingHealth;
    this.maxHealth = maxHealth;
  }
}

// vehicle component (specialized movement)
class VehicleComponent {
  constructor({ throttle = 0, maxTurn = Math.PI / 60 }) {
    this.throttle = throttle; // -1 reverse, 0 idle, 1 forward
    this.maxTurn = maxTurn;
  }
}

// movement component for AI / player / vehicles
class MovementComponent {
  constructor({ maxSpeed = 2, acceleration = 0.1, deceleration = 0.05 }) {
    this.maxSpeed     = maxSpeed;
    this.acceleration = acceleration;
    this.deceleration = deceleration;
    this.velocity     = { x: 0, y: 0 };
  }
}

// rotation component for entities that will attempt to control rotation
class RotationComponent {
  constructor({ angle = 0, maxTurn = Math.PI / 12 }) {
    this.targetAngle = 0; // desired facing angle
    this.maxTurn     = maxTurn; // maximum turning radius
  }
}

// input component for any entities that desire control over their velocity
class InputComponent {
  constructor () {
    this.inputVector = { x: 0, y: 0 };  // WASD / movement input
    this.isAiming = false;              // right mouse button
  }
}

// render component for any entity that should be rendered
class RenderComponent {
  constructor (drawFn) {
    this.drawFn = drawFn;
  }
}

// ******************** ENTITIES **********************

class Entity {
  constructor ({ x, y, name, isLocal = false, world, components = {} }) {
    this.name         = name;
    this.position     = { x, y };
    this.rotation     = 0; // radians
    
    this.size         = 1;
    this.isLocal      = isLocal;
    this.components   = components;
  }
  
  getX () {
    return this.position.x;
  }
  
  getY () {
    return this.position.y;
  }
  
  addComponent(name, func) {
    this.components[name] = func;
    return this.getComponent(name);
  }
  
  getComponent(name) {
    return this.components[name];
  }
  
  hasComponent(name) {
    return name in this.components;
  }
}

class Character extends Entity {
  constructor ({ x, y, world }) {
    super({ x, y, world });
    this.addComponent(new HealthComponent("health", { maxHealth: 100 }));
    this.addComponent(new RotationComponent("rotation", { angle: 0, maxTurn: 0 }));
    this.addComponent(new MovementComponent("movement", { maxSpeed: 2, acceleration: 0.1, deceleration: 0.05 }));
  }
}

// **********************************
//              INIT
const world        = new World();
const entitySys    = world.entitySystem;
const rotationSys  = world.registerSystem(new RotationSystem());
const movementSys  = world.registerSystem(new MovementSystem());
const collisionSys = world.registerSystem(new CollisionSystem());
const inputSystem  = world.registerSystem(new InputSystem());
const renderSystem = world.registerSystem(new RenderSystem());
//***********************************

function setup() {
  const w      = 1920;
  const h      = 1080;
  const cnv    = createCanvas(w, h);
  world.canvas = cnv.elt; // save DOM element for Input manager
  
  const player = new Entity({
    name: "player",
    x: w / 2,
    y: h / 2,
    isLocal: true
  })
  player.addComponent("health", new HealthComponent({}));
  player.addComponent("rotation", new RotationComponent({}));
  player.addComponent("movement", new MovementComponent({}));
  player.addComponent("input", new InputComponent({}));
  
  const dF = (entity) => {
    push();
    translate(entity.getX(), entity.getY());
    rotate(entity.rotation);

    // draw a simple player character
    fill(100, 200, 255);
    noStroke();
    triangle(-10, -10, -10, 10, 15, 0);

    pop();
  };
  
  player.addComponent("render", new RenderComponent(dF));
  entitySys.createEntity(player);
  
}

function draw() {
  background(220);
  
  const dTime = deltaTime / 16.67; // normalize relative to ~60fps
  world.tick(dTime);
}

export const sketch = (p) => {
  // Bind all functions
  Object.getOwnPropertyNames(p.constructor.prototype).forEach(name => {
    if (typeof p[name] === 'function') {
      window[name] = p[name].bind(p);
    }
  });

  // Expose dynamic properties via getters
  Object.defineProperties(window, {
    deltaTime: { get: () => p.deltaTime },
    mouseX:    { get: () => p.mouseX },
    mouseY:    { get: () => p.mouseY },
    frameCount:{ get: () => p.frameCount },
  });

  // Optional: constants
  window.PI = p.PI;
  window.TWO_PI = p.TWO_PI;

  p.setup = setup;
  p.draw = draw;
};

