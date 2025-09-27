export default class RotationManager {
  constructor(world, maxTurnRate = Math.PI / 60) {
    this.world = world;
    this.maxTurnRate = maxTurnRate;
  }

  update(dTime) {
    Object.values(this.world.entities).forEach((list) => {
      list.forEach((entity) => {
        if (entity.isAiming) {
          // snap to mouse if character is aiming;
          entity.vector.angle = entity.targetAngle;
        } else if (entity.targetAngle !== undefined) {
          let current = entity.vector.angle;
          let delta = entity.targetAngle - current;

          // normalize to [-PI, PI]
          delta = ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;

          // clamp rotation
          const turn = Math.max(
            -this.maxTurnRate * dTime,
            Math.min(this.maxTurnRate * dTime, delta)
          );
          entity.vector.angle = current + turn;
        }
      });
    });
  }
}
