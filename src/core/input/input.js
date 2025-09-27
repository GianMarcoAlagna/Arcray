export default class InputManager {
  constructor(world) {
    this.world = world;
    // this.player  = world.localPlayer;

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

    // TODO: implement ability to define if movement keys affect orientation or not
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
    const rect = (this.world.canvas || e.target).getBoundingClientRect();

    // use top-left coordinate system
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
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
      // Set a more snappy turn radius for aiming
      player.maxTurnRadius = Math.PI / 10;
      const dy = this.mouse.y - player.vector.y;
      const dx = this.mouse.x - player.vector.x;

      player.targetAngle = Math.atan2(dy, dx);
      player.speed = 0;
    } else {
      // Ensure correct turn radius if not aiming
      player.maxTurnRadius = player.baseTurnRadius;

      // WASD keys -> assign targetAngle + speed
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
        player.targetAngle = player.vector.angle; // <-- Ensures that "leftover" angle after-
        // player releases a movement key, is cleaned up
        player.speed = 0;
      }
    }
  }
}
