export default class EntityManager {
  constructor(world, entities) {
    this.world = world;
    this.entities = entities || { lasers: [], enemies: [], players: [] };
    this.players = this.entities.players;
    this.enemies = this.entities.enemies;
    this.lasers = this.entities.lasers;
  }

  createEntity(entity, data) {
    const { x, y } = data;
    const objData = {
      x,
      y,
      world: this.world,
    };

    let newEntity;
    switch (entity) {
      case "Player":
        newEntity = new Player(objData);
        this.players.push(newEntity);
        break;
      case "Enemy":
        newEntity = new Enemy(objData);
        this.enemies.push(newEntity);
        break;
      case "Projectile":
        newEntity = new Projectile(objData);
        this.lasers.push(newEntity);
        break;
      default:
        break;
    }

    return newEntity;
  }
}

export class Entity {
  // drawData could be extended into mesh/texture data;
  // maybe have a seperate manager for those;
  constructor({ x, y, drawData, world }) {
    this.vector = { x, y, angle: 0 };
    this.world = world;
    this.drawFunction = () => {};

    this.targetAngle = 0;
    this.size = 1;

    this.isAiming = false;
    this.movementKeysTurnRadius = Math.PI / 45;
    this.baseTurnRadius = Math.PI / 45;
    this.maxTurnRadius = Math.PI / 45;
  }

  // need to move render out somewhere else to make it more globally managed
  render() {
    this.drawFunction(this.vector);
  }

  getX() {
    return this.vector.x;
  }

  getY() {
    return this.vector.y;
  }
}
