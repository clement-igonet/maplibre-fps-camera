// fps_handler.js
import { FPSCamera } from './fps_camera.js';

export class FPSHandler {
  constructor(map, position) {
    this.map = map;
    this.camera = new FPSCamera(position);

    this.active = false;
    this.keys = new Set();
    this._loop = this._loop.bind(this);
  }

  enable() {
    if (this.active) return;
    this.active = true;

    this.map.getCanvas().requestPointerLock()
    .catch((err) => {
      console.warn('Pointer lock request failed:', err);
      this.disable(); // Optional: auto-disable FPS mode if lock failed
    });
    
    this.map.dragPan.disable();

    document.addEventListener('mousedown', this._onMouseDown);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    // document.addEventListener('keydown', this._onEscape);

    this._loop();
  }

  _onEscape = (e) => {
    if (e.key === 'Escape') {
      this.disable();
      console.log('Exited FPS mode.');
    }
  };

  _onMouseDown = (e) => {
    if (!this.active) return;
    this.map.getCanvas().requestPointerLock();
    // console.info('getCameraOptions: ', JSON.stringify(this.camera.getCameraOptions(this.map), null, 2));
  };

  // _onMouseMove = (e) => {
  //   if (!this.active) return;
  //   this.camera.rotate(e.movementX, e.movementY);
  // };

  _onMouseMove = (e) => {
    if (!this.active) return;
  
    const maxPitch = 80;
    const minPitch = 70;
    const pitchDelta = -e.movementY * this.camera.sensitivity; // Mouse Y movement
  
    // console.info('this.camera.pitch: ', this.camera.pitch)
    const wasAtLimit =
      (this.camera.pitch === maxPitch && pitchDelta > 0) ||
      (this.camera.pitch === minPitch && pitchDelta < 0);
  
    this.camera.rotate(e.movementX, e.movementY);
  
    if (wasAtLimit) {
      let speedFactor = pitchDelta; // keep sign!
  
      // Clamp the speed factor to avoid crazy fast movement
      speedFactor = Math.max(-10, Math.min(10, speedFactor));
  
      this._moveBasedOnMouse(speedFactor);
    }
  };
  
  _moveBasedOnMouse(speedFactor) {
    const baseSpeedMetersPerSecond = 20;
    const frameTimeSeconds = 1 / 60;
  
    const distance = baseSpeedMetersPerSecond * speedFactor * frameTimeSeconds;
  
    this.camera.move(distance, 0);
  }

  _onKeyDown = (e) => {
    const key = e.key;
    if (key.startsWith('Arrow')) {
      this.keys.add(key);
    }
  };

  _onKeyUp = (e) => {
    this.keys.delete(e.key);
  };

  _detectCollision(predictedPosition) {
    const features = this.map.queryRenderedFeatures(
      this.map.project([predictedPosition.lng, predictedPosition.lat]),
      {
        layers: ['room-extrusion']
      }
    );
  
    let loop = 0
    const cameraHeight = predictedPosition.alt || this.camera.position.alt; // your walking height
    for (const feature of features) {
      if (loop < 1) {
        console.info('cameraHeight: ', cameraHeight)
      }
      loop++
      const props = feature.properties;
      const minHeight = parseFloat(props['base_height'] || 0);
      const maxHeight = parseFloat(props['height'] || 0);
    
      console.info('minHeight: ', minHeight)
      console.info('maxHeight: ', maxHeight)
      if (cameraHeight >= minHeight && cameraHeight <= maxHeight) {
        return true; // collision detected
      }
    }
  
    return false; // no collision
  }



  _loop() {
    if (!this.active) return;

    let forward = 0;
    let strafe = 0;

    if (this.keys.has('ArrowUp')) forward = 1;
    if (this.keys.has('ArrowDown')) forward = -1;
    if (this.keys.has('ArrowLeft')) strafe = 1; // <-- was "-" before, now "+"
    if (this.keys.has('ArrowRight')) strafe = -1; // <-- was "+" before, now "-"

    const moveSpeedMetersPerSecond = 20; // Move 2 meters per second
    const frameTimeSeconds = 1 / 60;     // Assume 60fps for simplicity

    const distance = moveSpeedMetersPerSecond * frameTimeSeconds;

    if (forward !== 0 || strafe !== 0) {
      // Predict future position
      // const predictedPosition = this.camera.predictMove(forward * distance, strafe * distance);
  
      // Check if predicted position would collide
      // const collision = this._detectCollision(predictedPosition);
  
      this.camera.move(forward * distance, strafe * distance);
      // if (!collision) {
      //   // Safe to move
      //   this.camera.move(forward * distance, strafe * distance);
      // } else {
      //   // Block movement
      //   console.log('Collision detected, movement blocked.');
      // }
    }

    const camOpts = this.camera.getCameraOptions(this.map);
    this.map.jumpTo(camOpts);

    requestAnimationFrame(this._loop);
  }

  disable() {
    this.active = false;
    // document.exitPointerLock?.();
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    this.map.dragPan.enable();

    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
  }
  toggle() {
    if (this.active) {
      this.disable();
    } else {
      this.enable();
    }
  }
}
