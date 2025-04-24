export class FPSCameraControl {
    constructor(options = {}) {
      this._map = null;
      this.enabled = false;
  
      this.cameraLatLng = null;
      this.pitch = 0;
      this.bearing = 0;
      this.altitude = options.altitude || 1.8;
  
      this.speed = options.speed || 0.0003;
      this.mouseSensitivity = options.mouseSensitivity || 0.1;
  
      this._keys = new Set();
    //   this._loop = this._loop.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onKeyDown = (e) => this._keys.add(e.key.toLowerCase());
      this._onKeyUp = (e) => this._keys.delete(e.key.toLowerCase());
    }
  
    onAdd(map) {
      this._map = map;
      this.cameraLatLng = map.getCenter();
      this.bearing = map.getBearing();
      this.pitch = map.getPitch();
  
      // UI
      const container = document.createElement('div');
      container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
  
      const button = document.createElement('button');
      button.textContent = 'FPS';
      button.onclick = () => this.toggle();
  
      container.appendChild(button);
      this._container = container;
      return container;
    }
  
    onRemove() {
      this.disable();
      if (this._container?.parentNode) {
        this._container.parentNode.removeChild(this._container);
      }
      this._map = null;
    }
  
    toggle() {
      this.enabled ? this.disable() : this.enable();
    }
  
    enable() {
      if (this.enabled) return;
      this.enabled = true;
  
      this._map.dragPan.disable();
      this._map.getCanvas().requestPointerLock();
  
      document.addEventListener('mousemove', this._onMouseMove);
      document.addEventListener('keydown', this._onKeyDown);
      document.addEventListener('keyup', this._onKeyUp);
  
      this._startLoop();
    }
  
    disable() {
      if (!this.enabled) return;
      this.enabled = false;
  
      this._map.dragPan.enable();
      document.exitPointerLock?.();
  
      document.removeEventListener('mousemove', this._onMouseMove);
      document.removeEventListener('keydown', this._onKeyDown);
      document.removeEventListener('keyup', this._onKeyUp);
  
      cancelAnimationFrame(this._animation);
    }
  
    _onMouseMove(e) {
      if (!this.enabled) return;
  
      this.bearing += e.movementX * this.mouseSensitivity;
      this.pitch -= e.movementY * this.mouseSensitivity;
      this.pitch = Math.max(0, Math.min(85, this.pitch));
    }

    _startLoop() {
        const tick = () => {
          this._moveCamera();
          this._updateMapView();
          this._animation = requestAnimationFrame(tick);
        };
        this._animation = requestAnimationFrame(tick);
      }
      
    _moveCamera() {
      if (!this.enabled || this._keys.size === 0) return;
  
      const rad = (this.bearing * Math.PI) / 180;
      const dx = Math.sin(rad);
      const dy = Math.cos(rad);
  
      const delta = { lat: 0, lng: 0 };
  
      if (this._keys.has('w')) {
        delta.lat += dy * this.speed;
        delta.lng += dx * this.speed;
      }
      if (this._keys.has('s')) {
        delta.lat -= dy * this.speed;
        delta.lng -= dx * this.speed;
      }
      if (this._keys.has('a')) {
        delta.lat += dx * this.speed;
        delta.lng -= dy * this.speed;
      }
      if (this._keys.has('d')) {
        delta.lat -= dx * this.speed;
        delta.lng += dy * this.speed;
      }
  
      this.cameraLatLng = {
        lat: this.cameraLatLng.lat + delta.lat,
        lng: this.cameraLatLng.lng + delta.lng,
      };
    }
  
    _updateMapView() {
      const map = this._map;
      map.setPitch(this.pitch);
      map.setBearing(this.bearing);
  
      // Reset the center to the current camera location
      map.setCenter(this.cameraLatLng);
    }
  }
  