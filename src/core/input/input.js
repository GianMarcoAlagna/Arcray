export default class InputManager {
  constructor(world) {
    this.world = world;
    // this.player     = world.localPlayer;
    // console.log(world)

    this.isFrozen = false;
    this.mouse = { x: 0, y: 0 };
    this.keysDown = new Set();

    this.keyMap = {
      KeyW: "moveForward",
      KeyS: "moveBackward",
      KeyA: "moveLeft",
      KeyD: "moveRight",
      Space: "fire",
      ShiftLeft: "sprint/boost",
    };

    window.addEventListener("keydown", (e) => this.onKeyDown(e));
    window.addEventListener("keyup", (e) => this.onKeyUp(e));
    window.addEventListener("mousemove", (e) => this.onMouseMove(e));
    window.addEventListener("mousedown", (e) => this.onMouseDown(e));
    window.addEventListener("mouseup", (e) => this.onMouseUp(e));
    window.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  onKeyDown(e) {
    this.keysDown.add(e.code);
  }

  onKeyUp(e) {
    this.keysDown.delete(e.code);
  }

  onMouseMove(e) {
    // record mouse relative to canvas center
    const rect = e.target.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left - rect.width / 2;
    this.mouse.y = e.clientY - rect.top - rect.height / 2;
  }

  onMouseDown(e) {
    if (e.button === 2) {
      // right click
      this.world.eventManager.fireEvent("input:aim", this.mouse);
      this.world.localPlayer.isAiming = true;
    }
    if (e.button === 0) {
      this.world.eventManager.fireEvent("input:fire", this.world.dTime);
    }
  }

  onMouseUp(e) {
    if (e.button === 2) {
      this.world.localPlayer.isAiming = false;
    }
  }

  update() {
    // fire events for each currently pressed key
    const player = this.world.localPlayer;

    for (const code of this.keysDown) {
      const action = this.keyMap[code];
      if (action) {
        this.world.eventManager.fireEvent(`input:${action}`, this.world.dTime);
      }
    }

    if (player.isAiming) {
      // Rotate toward mouse only
      // player.targetAngle = Math.atan2(this.mouse.y - player.vector.y, this.mouse.x - player.vector.x);
      player.targetAngle = Math.atan2(this.mouse.y, this.mouse.x);
      player.speed = 0; // no auto-move unless WASD also pressed
    } else {
      // WASD keys → assign targetAngle + speed
      if (this.keysDown.has("KeyW")) {
        player.targetAngle = -Math.PI / 2;
        player.speed = 2;
      } else if (this.keysDown.has("KeyS")) {
        player.targetAngle = Math.PI / 2;
        player.speed = 2;
      } else if (this.keysDown.has("KeyA")) {
        player.targetAngle = Math.PI;
        player.speed = 2;
      } else if (this.keysDown.has("KeyD")) {
        player.targetAngle = 0;
        player.speed = 2;
      } else {
        player.speed = 0;
      }
    }
  }
}
