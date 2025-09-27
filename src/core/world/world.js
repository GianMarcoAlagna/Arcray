export default class World {
  constructor(size = { width: 0, height: 0 }) {
    this.size = size;

    this.eventManager = new EventManager(this);
    this.entityManager = new EntityManager(this);
    this.entities = this.entityManager.entities;
    // ensure entities is defined before any of the managers
    // that manipulate entities

    this.collisionManager = new CollisionManager(this);
    this.inputManager = new InputManager(this);
    this.renderManager = new RenderManager(this);
    this.movementManager = new MovementManager(this);
    this.rotationManager = new RotationManager(this);

    this.localPlayer = null; // <— which player this instance controls
    this.dTime = 0;
  }

  tick(dTime) {
    this.dTime = dTime;

    // INPUT
    this.inputManager.update();

    // ROTATION + MOVEMENT
    this.rotationManager.update(dTime);
    this.movementManager.update(dTime);

    // COLLISION
    this.collisionManager.update();
    this.collisionManager.checkCollisions();

    // RENDER
    this.renderManager.renderEntities();
  }

  createPlayer(data = null, isLocal = false) {
    const player = this.entityManager.createEntity("Player", data);
    if (isLocal) {
      this.localPlayer = player;
    }
    return player;
  }

  createEnemy(data = null) {
    this.entityManager.createEntity("Enemy", data, this);
  }

  createProjectile(data = null) {
    this.entityManager.createEntity("Projectile", data, this);
  }

  // Create custom entity type, advanced;
  createEntity(data = null) {
    this.entityManager.createEntity(data.name, data, this);
  }
}
