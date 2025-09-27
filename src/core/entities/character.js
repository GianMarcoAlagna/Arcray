export default class Character extends Entity {
  constructor({ x, y, world }) {
    super({ x, y, world });
    this.acceleration = { x: 0, y: 0 };
    this.boost = { amount: 100, cooldown: 0 };
    this.health = 100;
  }
}
