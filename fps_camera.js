// fps_camera.js
export class FPSCamera {
  constructor(initialPosition = { lat: 48.8584, lng: 2.2945, alt: 1.8 }) {
    this.position = initialPosition;
    this.bearing = 0;
    this.pitch = 80;
    this.sensitivity = 0.1;
  }

  rotate(deltaX, deltaY) {
    this.bearing += deltaX * this.sensitivity;
    this.pitch -= deltaY * this.sensitivity;
    this.pitch = Math.max(70, Math.min(80, this.pitch));
    this.bearing = (this.bearing + 360) % 360;
  }

  move(forwardMeters = 0, strafeMeters = 0) {
    const rad = this.bearing * Math.PI / 180;
    const dx = Math.sin(rad);
    const dy = Math.cos(rad);

    // Very important: degrees latitude ~= 111_320 meters
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLng = metersPerDegreeLat * Math.cos(this.position.lat * Math.PI / 180);

    // Convert meters to degrees
    const deltaLat = (dy * forwardMeters + dx * strafeMeters) / metersPerDegreeLat;
    const deltaLng = (dx * forwardMeters - dy * strafeMeters) / metersPerDegreeLng;

    this.position.lat += deltaLat;
    this.position.lng += deltaLng;
  }

  predictMove(forwardMeters = 0, strafeMeters = 0) {
    const rad = this.bearing * Math.PI / 180;
    const dx = Math.sin(rad);
    const dy = Math.cos(rad);
  
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLng = metersPerDegreeLat * Math.cos(this.position.lat * Math.PI / 180);
  
    const deltaLat = (dy * forwardMeters + dx * strafeMeters) / metersPerDegreeLat;
    const deltaLng = (dx * forwardMeters - dy * strafeMeters) / metersPerDegreeLng;
  
    return {
      lat: this.position.lat + deltaLat,
      lng: this.position.lng + deltaLng,
      alt: this.position.alt
    };
  }
  
  getCameraOptions(map) {
    return {
      ...map.calculateCameraOptionsFromCameraLngLatAltRotation(
        this.position,
        this.position.alt,
        this.bearing,
        this.pitch,
        this.roll || 0
      ),
      altitude: this.position.alt
    };
  }
}
