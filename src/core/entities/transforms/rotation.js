export default class RotationManager {
  constructor(world) {
    this.world = world;
  }

  update(dTime) {
    Object.values(this.world.entities).forEach((list) => {
      list.forEach((entity) => {
        if (entity.targetAngle !== undefined) {
          const maxTurnRadius = entity.maxTurnRadius || 0;

          let current = entity.vector.angle;
          let delta = entity.targetAngle - current;

          // normalize to [-PI, PI]
          delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;

          // clamp rotation
          const turn = Math.max(
            -maxTurnRadius * dTime,
            Math.min(maxTurnRadius * dTime, delta)
          );
          entity.vector.angle = current + turn;
        }
      });
    });
  }
}
