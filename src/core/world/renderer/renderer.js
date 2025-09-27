export default class RenderManager {
  constructor(world) {
    this.world = world;
    // entities NEEDS to be defined by this point;
    this.entities = world.entities;
  }

  renderEntities() {
    for (const entity in this.entities) {
      const entityList = this.entities[entity];
      entityList.forEach((e) => e.render());
    }
  }
}
