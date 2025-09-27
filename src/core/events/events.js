export default class EventManager {
  constructor(world) {
    this.world = world;
    this.events = {};
  }

  on(event, callback, ...args) {
    if (!event || !callback) {
      console.log("You must pass both and event and a callback");
      return;
    }

    const cb = (...eArgs) => callback(...args, ...eArgs);
    return this.createEvent(event, cb);
  }

  eventExists(event) {
    return !!this.events[event];
  }

  createListener(event) {
    this.events[event] = new EventListener(event);
  }

  createEvent(event, callback) {
    if (!this.eventExists(event)) this.createListener(event);
    return this.events[event].callbacks.push(callback);
  }

  fireEvent(event, ...args) {
    if (this.eventExists(event)) {
      const listener = this.events[event];
      return listener.callbacks.map((cb) => cb(...args));
    }
  }
}

export class EventListener {
  constructor(name = "") {
    if (!name.length) return null;
    this.name = name;
    this.callbacks = [];
  }
}
