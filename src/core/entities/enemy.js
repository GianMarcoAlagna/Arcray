export default class Enemy extends Character {
  constructor({ x, y, world }) {
    super({ x, y, world });
  }

  update() {}

  targetPlayer(player) {
    // Smoothly rotate toward player
    this.world.rotationManager.rotateToward(
      Math.atan2(
        this.world.localPlayer.getY() - this.getY(),
        this.world.localPlayer.getX() - this.getX()
      ),
      dTime
    );
  }
}
