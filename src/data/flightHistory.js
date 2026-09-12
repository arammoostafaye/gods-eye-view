/**
 * Flight History Playback - Personal Edition Feature G
 * Fetches and plays back historical flight tracks from OpenSky
 * 
 * Uses /api/opensky-track?icao24=xxx to get track
 * Provides timeline scrubbing and playback controls
 */

export class FlightHistoryPlayer {
  constructor(viewer) {
    this.viewer = viewer;
    this.isPlaying = false;
    this.currentTrack = null;
    this.currentIndex = 0;
    this.playbackSpeed = 1; // 1x, 2x, 5x, 10x
    this.playbackInterval = null;
    this.onUpdateCallback = null;
    this.trailEntity = null;
    this.positionHistory = [];
    
    this.createUI();
  }

  createUI() {
    const container = document.createElement('div');
    container.id = 'flight-history-player';
    container.innerHTML = `
      <style>
        #flight-history-player {
          position: fixed;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          background: rgba(10,10,15,0.95);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(0,212,255,0.3);
          border-radius: 16px;
          padding: 16px 20px;
          min-width: 400px;
          max-width: 600px;
          font-family: 'JetBrains Mono', monospace;
          color: #fff;
          display: none;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        #flight-history-player.active {
          display: block;
        }
        #flight-history-player h4 {
          margin: 0 0 12px 0;
          font-size: 13px;
          color: #00d4ff;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        #flight-history-player .close-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          color: #fff;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        #flight-history-player .controls {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        #flight-history-player .play-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #00d4ff;
          border: none;
          color: #000;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #flight-history-player .play-btn:hover {
          background: #00b8e6;
          transform: scale(1.05);
        }
        #flight-history-player .timeline {
          flex: 1;
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          position: relative;
          cursor: pointer;
        }
        #flight-history-player .timeline-progress {
          height: 100%;
          background: linear-gradient(90deg, #00d4ff, #00ff88);
          border-radius: 3px;
          width: 0%;
          transition: width 0.1s linear;
        }
        #flight-history-player .timeline-handle {
          position: absolute;
          top: 50%;
          width: 14px;
          height: 14px;
          background: #fff;
          border: 2px solid #00d4ff;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          left: 0%;
          cursor: grab;
          box-shadow: 0 2px 8px rgba(0,212,255,0.5);
        }
        #flight-history-player .info {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #888;
          margin-bottom: 8px;
        }
        #flight-history-player .speed-controls {
          display: flex;
          gap: 6px;
        }
        #flight-history-player .speed-btn {
          padding: 4px 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 6px;
          color: #aaa;
          font-size: 11px;
          cursor: pointer;
        }
        #flight-history-player .speed-btn.active {
          background: rgba(0,212,255,0.2);
          border-color: #00d4ff;
          color: #fff;
        }
        #flight-history-player .stats {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
          font-size: 11px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        #flight-history-player .stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        #flight-history-player .stat-label {
          color: #666;
          font-size: 10px;
          text-transform: uppercase;
        }
        #flight-history-player .stat-value {
          color: #fff;
          font-weight: 600;
        }
      </style>
      <h4>
        <span>✈️ Flight History Playback</span>
        <button class="close-btn" onclick="document.getElementById('flight-history-player').classList.remove('active')">✕</button>
      </h4>
      <div class="info">
        <span id="history-flight-id">No flight selected</span>
        <span id="history-time">--:--:--</span>
      </div>
      <div class="controls">
        <button class="play-btn" id="history-play-btn">▶</button>
        <div class="timeline" id="history-timeline">
          <div class="timeline-progress" id="history-progress"></div>
          <div class="timeline-handle" id="history-handle"></div>
        </div>
      </div>
      <div class="controls">
        <div class="speed-controls">
          <button class="speed-btn active" data-speed="1">1x</button>
          <button class="speed-btn" data-speed="2">2x</button>
          <button class="speed-btn" data-speed="5">5x</button>
          <button class="speed-btn" data-speed="10">10x</button>
          <button class="speed-btn" data-speed="20">20x</button>
        </div>
        <span style="margin-left:auto; font-size:10px; color:#666;" id="history-count">0 points</span>
      </div>
      <div class="stats">
        <div class="stat">
          <span class="stat-label">Altitude</span>
          <span class="stat-value" id="history-alt">--- ft</span>
        </div>
        <div class="stat">
          <span class="stat-label">Speed</span>
          <span class="stat-value" id="history-speed">--- kts</span>
        </div>
        <div class="stat">
          <span class="stat-label">Heading</span>
          <span class="stat-value" id="history-heading">---°</span>
        </div>
      </div>
    `;
    
    document.body.appendChild(container);
    
    // Event listeners
    const playBtn = container.querySelector('#history-play-btn');
    playBtn.onclick = () => this.togglePlayback();
    
    const timeline = container.querySelector('#history-timeline');
    timeline.onclick = (e) => this.seekFromClick(e);
    
    container.querySelectorAll('.speed-btn').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.playbackSpeed = parseInt(btn.dataset.speed);
      };
    });
    
    // Drag handle
    const handle = container.querySelector('#history-handle');
    let isDragging = false;
    
    handle.addEventListener('mousedown', () => isDragging = true);
    document.addEventListener('mouseup', () => isDragging = false);
    document.addEventListener('mousemove', (e) => {
      if (!isDragging || !this.currentTrack) return;
      const rect = timeline.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const ratio = x / rect.width;
      this.currentIndex = Math.floor(ratio * (this.currentTrack.length - 1));
      this.updateDisplay();
    });
    
    this.container = container;
    this.playBtn = playBtn;
  }

  async loadFlightHistory(icao24) {
    try {
      this.container.querySelector('#history-flight-id').textContent = `Loading ${icao24}...`;
      this.container.classList.add('active');
      
      const response = await fetch(`/api/opensky-track?icao24=${encodeURIComponent(icao24)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const path = data.path || [];
      
      if (path.length < 2) {
        this.container.querySelector('#history-flight-id').textContent = `No history for ${icao24}`;
        return false;
      }
      
      // Parse: [time, lat, lon, baro_alt, track, on_ground]
      this.currentTrack = path.map(p => ({
        time: p[0],
        lat: p[1],
        lon: p[2],
        alt: p[3],
        track: p[4],
        onGround: p[5],
        timeStr: new Date(p[0] * 1000).toISOString().substr(11,8)
      })).filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lon));
      
      this.currentIndex = 0;
      this.positionHistory = [];
      
      // Create trail entity
      if (this.trailEntity) {
        this.viewer.entities.remove(this.trailEntity);
      }
      
      this.trailEntity = this.viewer.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(() => this.positionHistory, false),
          width: 3,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.2,
            color: Cesium.Color.fromCssColorString('#00d4ff')
          }),
          clampToGround: false
        }
      });
      
      this.container.querySelector('#history-flight-id').textContent = `${icao24} - ${this.currentTrack.length} points`;
      this.container.querySelector('#history-count').textContent = `${this.currentTrack.length} points`;
      
      this.updateDisplay();
      return true;
      
    } catch (e) {
      console.warn('Flight history load failed:', e);
      this.container.querySelector('#history-flight-id').textContent = `Failed: ${e.message}`;
      return false;
    }
  }

  updateDisplay() {
    if (!this.currentTrack || !this.currentTrack[this.currentIndex]) return;
    
    const point = this.currentTrack[this.currentIndex];
    const progress = this.currentTrack.length > 1 ? (this.currentIndex / (this.currentTrack.length - 1)) * 100 : 0;
    
    this.container.querySelector('#history-progress').style.width = `${progress}%`;
    this.container.querySelector('#history-handle').style.left = `${progress}%`;
    this.container.querySelector('#history-time').textContent = point.timeStr;
    this.container.querySelector('#history-alt').textContent = point.alt ? `${Math.round(point.alt * 3.28084).toLocaleString()} ft` : '---';
    this.container.querySelector('#history-speed').textContent = point.speed ? `${Math.round(point.speed)} kts` : '---';
    this.container.querySelector('#history-heading').textContent = point.track ? `${Math.round(point.track)}°` : '---°';
    
    // Update trail
    this.positionHistory = this.currentTrack.slice(0, this.currentIndex + 1).map(p => 
      Cesium.Cartesian3.fromDegrees(p.lon, p.lat, p.alt || 1000)
    );
    
    // Fly to current position if playing
    if (this.isPlaying && point) {
      // Optional: follow the plane
      // this.viewer.camera.flyTo with small duration
    }
    
    if (this.onUpdateCallback) {
      this.onUpdateCallback(point, this.currentIndex);
    }
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (!this.currentTrack) return;
    
    this.isPlaying = true;
    this.playBtn.textContent = '⏸';
    
    const intervalMs = Math.max(50, 500 / this.playbackSpeed);
    
    this.playbackInterval = setInterval(() => {
      this.currentIndex++;
      if (this.currentIndex >= this.currentTrack.length) {
        this.currentIndex = 0; // Loop
        // Or pause at end:
        // this.pause();
        // return;
      }
      this.updateDisplay();
    }, intervalMs);
  }

  pause() {
    this.isPlaying = false;
    this.playBtn.textContent = '▶';
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
  }

  seekFromClick(e) {
    if (!this.currentTrack) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    this.currentIndex = Math.floor(ratio * (this.currentTrack.length - 1));
    this.updateDisplay();
  }

  setFlight(icao24) {
    this.pause();
    return this.loadFlightHistory(icao24);
  }

  destroy() {
    this.pause();
    if (this.trailEntity) {
      this.viewer.entities.remove(this.trailEntity);
    }
    if (this.container) {
      this.container.remove();
    }
  }
}

export function createFlightHistoryPlayer(viewer) {
  return new FlightHistoryPlayer(viewer);
}
