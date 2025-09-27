export default class MovementManager {
  constructor(world) {
    this.world = world;
  }

  update(dTime) {
    Object.values(this.world.entities).forEach((list) => {
      list.forEach((entity) => {
        if (entity.speed > 0) {
          // Compute vector from angle + speed
          const vx = Math.cos(entity.vector.angle) * entity.speed;
          const vy = Math.sin(entity.vector.angle) * entity.speed;

          // Apply movement with respect to delta frame time
          entity.vector.x += vx * dTime;
          entity.vector.y += vy * dTime;
        }
      });
    });
  }
}
