// fps_component.js
export class FPSControlButton {
    constructor(fpsHandler) {
      this.fpsHandler = fpsHandler;
  
      this.button = document.createElement('button');
      this.button.id = 'fps-button';
      this.button.innerText = 'Enter FPS Look';
  
      this._applyStyles();
  
      document.body.appendChild(this.button);
  
      this.button.addEventListener('click', () => this._onClick());

      this._maybeAutoStartFPS();
    }
  
    _onClick() {
      this.fpsHandler.toggle();
      this.updateLabel();
    }
  
    updateLabel() {
      this.button.innerText = this.fpsHandler.active ? 'Exit FPS Look' : 'Enter FPS Look';
    }
  
    _applyStyles() {
      Object.assign(this.button.style, {
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        userSelect: 'none'
      });
  
      this.button.addEventListener('mouseenter', () => {
        this.button.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      });
  
      this.button.addEventListener('mouseleave', () => {
        this.button.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      });
    }



    _maybeAutoStartFPS() {
      const params = new URLSearchParams(window.location.search);
      const fpsParam = params.get('fps');
  
      // if (fpsParam === 'true') {
        // Ask user for click to start pointer lock
      this._showFPSOverlay();
      // }
    }
  
    _showFPSOverlay() {
      const overlay = document.createElement('div');
      overlay.id = 'fps-start-overlay';
      Object.assign(overlay.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        fontSize: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        cursor: 'pointer',
        userSelect: 'none'
      });
      overlay.innerText = 'Click to Enter FPS Mode';
  
      document.body.appendChild(overlay);
  
      overlay.addEventListener('click', () => {
        // User clicked => start FPS mode
        this.fpsHandler.enable();
        this.updateLabel();
        overlay.remove(); // Remove overlay
      });
    }

  }
  