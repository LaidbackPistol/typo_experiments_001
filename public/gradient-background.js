/**
 * Animated Noise Gradient Background
 * Based on WebGL shader with configurable settings and preset system
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create gradient container and canvas
    createGradientElements();
    
    // Initialize WebGL and shaders
    initGradient();
    
    // Setup UI controls and presets
    setupGradientControls();
    
    // Load default preset
    applyGradientPreset('default');
  });
  
  // Create required DOM elements for gradient
  function createGradientElements() {
    // Create gradient container
    const gradientContainer = document.createElement('div');
    gradientContainer.id = 'gradient-container';
    gradientContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -10; /* Behind everything */
      overflow: hidden;
    `;
    
    // Create gradient canvas
    const gradientCanvas = document.createElement('canvas');
    gradientCanvas.id = 'gradient-canvas';
    gradientCanvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    `;
    
    // Create controls container (hidden by default)
    const gradientControls = document.createElement('div');
    gradientControls.id = 'gradient-controls';
    gradientControls.className = 'design-element'; // This class will be targeted by design mode
    gradientControls.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px; /* Position on right side instead of left */
      background-color: rgba(0, 0, 0, 0.7);
      border-radius: 8px;
      padding: 10px;
      color: white;
      width: 280px;
      z-index: 100;
      display: none; /* Hidden by default, shown in design mode */
      max-height: 80vh;
      overflow-y: auto;
    `;
    
    // Add toggle button for gradient controls
    const toggleButton = document.createElement('div');
    toggleButton.id = 'toggle-gradient-controls';
    toggleButton.className = 'design-element'; // Will be controlled by design mode
    toggleButton.textContent = 'G';
    toggleButton.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px; /* Position on right side */
      background: rgba(0, 0, 0, 0.7);
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 101;
      border: 1px solid #444;
      font-weight: bold;
      font-size: 18px;
      opacity: 0.5;
      transition: opacity 0.3s ease;
    `;
    
    toggleButton.addEventListener('mouseenter', function() {
      toggleButton.style.opacity = '1';
      toggleButton.style.background = 'rgba(50, 50, 50, 0.7)';
    });
    
    toggleButton.addEventListener('mouseleave', function() {
      toggleButton.style.opacity = '0.5';
      toggleButton.style.background = 'rgba(0, 0, 0, 0.7)';
    });
    
    toggleButton.addEventListener('click', function() {
      const panel = document.getElementById('gradient-controls');
      if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      }
    });
    
    // Append elements to the DOM
    gradientContainer.appendChild(gradientCanvas);
    document.body.appendChild(gradientContainer);
    document.body.appendChild(gradientControls);
    document.body.appendChild(toggleButton);
    
    // Create controls structure
    createGradientControlsUI();
  }

  // Create the UI controls for the gradient
  function createGradientControlsUI() {
    const controlsContainer = document.getElementById('gradient-controls');
    if (!controlsContainer) return;
    
    // Set up the control panels HTML
    controlsContainer.innerHTML = `
      <h3 style="margin-top: 0; text-align: center;">Gradient Background</h3>
      
      <!-- Color Palette Panel -->
      <div class="gradient-panel">
        <div class="gradient-panel-header active" data-target="gradient-colors-panel">
          <span>Color Palette</span>
          <span class="panel-arrow">▼</span>
        </div>
        <div class="gradient-panel-content active" id="gradient-colors-panel">
          <div class="color-input">
            <input type="color" id="gradient-color0" value="#F14D7B">
            <span>Color 1 (Pink/Magenta)</span>
          </div>
          <div class="color-input">
            <input type="color" id="gradient-color1" value="#FEC677">
            <span>Color 2 (Orange/Peach)</span>
          </div>
          <div class="color-input">
            <input type="color" id="gradient-color2" value="#FEF6EA">
            <span>Color 3 (Yellow/Gold)</span>
          </div>
          <div class="color-input">
            <input type="color" id="gradient-color3" value="#A5FEEE">
            <span>Color 4 (Cyan/Mint)</span>
          </div>
          <div class="color-input">
            <input type="color" id="gradient-color4" value="#556360">
            <span>Color 5 (Dark Gray)</span>
          </div>
          
          <button id="generate-gradient-colors" class="gradient-action-button">Generate Random Colors</button>
          
          <p style="text-align: center; margin-top: 10px; margin-bottom: 5px;">Preset Palettes</p>
          <div class="gradient-preset-container">
            <div class="gradient-palette-preset" style="--color1: #F14D7B; --color2: #FEC677; --color3: #FEF6EA; --color4: #A5FEEE;" data-palette="default"></div>
            <div class="gradient-palette-preset" style="--color1: #3A1C71; --color2: #D76D77; --color3: #FFAF7B; --color4: #AA4465;" data-palette="sunset"></div>
            <div class="gradient-palette-preset" style="--color1: #005AA7; --color2: #FFFDE4; --color3: #4FACFE; --color4: #00F2FE;" data-palette="ocean"></div>
            <div class="gradient-palette-preset" style="--color1: #667EEA; --color2: #764BA2; --color3: #6B8DD6; --color4: #8E37D7;" data-palette="purple"></div>
            <div class="gradient-palette-preset" style="--color1: #11998E; --color2: #38EF7D; --color3: #0ED2F7; --color4: #08AEEA;" data-palette="greenblue"></div>
            <div class="gradient-palette-preset" style="--color1: #FF416C; --color2: #FF4B2B; --color3: #F78CA0; --color4: #F9748F;" data-palette="reddish"></div>
          </div>
        </div>
      </div>
      
      <!-- Noise Settings Panel -->
      <div class="gradient-panel">
        <div class="gradient-panel-header" data-target="gradient-noise-panel">
          <span>Noise Settings</span>
          <span class="panel-arrow">▼</span>
        </div>
        <div class="gradient-panel-content" id="gradient-noise-panel">
          <div class="gradient-control-row">
            <div class="gradient-control-label">Seed</div>
            <div class="gradient-control-input">
              <input type="range" id="gradient-seed" min="0" max="1000" step="0.1" value="793.24">
            </div>
            <div class="gradient-control-value">
              <input type="number" id="gradient-seed-value" value="793.24" step="0.1">
            </div>
          </div>
          <div class="gradient-control-row">
            <div class="gradient-control-label">Period</div>
            <div class="gradient-control-input">
              <input type="range" id="gradient-period" min="0.1" max="10" step="0.1" value="0.7">
            </div>
            <div class="gradient-control-value">
              <input type="number" id="gradient-period-value" value="0.7" step="0.1">
            </div>
          </div>
          <div class="gradient-control-row">
            <div class="gradient-control-label">Roughness</div>
            <div class="gradient-control-input">
              <input type="range" id="gradient-roughness" min="0" max="1" step="0.01" value="0.56">
            </div>
            <div class="gradient-control-value">
              <input type="number" id="gradient-roughness-value" value="0.56" step="0.01">
            </div>
          </div>
          <div class="gradient-control-row">
            <div class="gradient-control-label">Amplitude</div>
            <div class="gradient-control-input">
              <input type="range" id="gradient-amplitude" min="0" max="1" step="0.01" value="0.75">
            </div>
            <div class="gradient-control-value">
              <input type="number" id="gradient-amplitude-value" value="0.75" step="0.01">
            </div>
          </div>
          <div class="gradient-control-row">
            <div class="gradient-control-label">Animation Speed</div>
            <div class="gradient-control-input">
              <input type="range" id="gradient-animation-speed" min="0" max="0.5" step="0.01" value="0.09">
            </div>
            <div class="gradient-control-value">
              <input type="number" id="gradient-animation-speed-value" value="0.09" step="0.01">
            </div>
          </div>
        </div>
      </div>
      
      <!-- Transform Panel -->
      <div class="gradient-panel">
        <div class="gradient-panel-header" data-target="gradient-transform-panel">
          <span>Transform Settings</span>
          <span class="panel-arrow">▼</span>
        </div>
        <div class="gradient-panel-content" id="gradient-transform-panel">
          <div class="gradient-control-row">
            <div class="gradient-control-label">Translate X</div>
            <div class="gradient-control-input">
              <input type="range" id="gradient-translate-x" min="-10" max="10" step="0.01" value="-8">
            </div>
            <div class="gradient-control-value">
              <input type="number" id="gradient-translate-x-value" value="-8" step="0.01">
            </div>
          </div>
          <div class="gradient-control-row">
            <div class="gradient-control-label">Translate Y</div>
            <div class="gradient-control-input">
              <input type="range" id="gradient-translate-y" min="-2" max="2" step="0.01" value="0">
            </div>
            <div class="gradient-control-value">
              <input type="number" id="gradient-translate-y-value" value="0" step="0.01">
            </div>
          </div>
          <div class="gradient-control-row">
            <div class="gradient-control-label">Scale X</div>
            <div class="gradient-control-input">
              <input type="range" id="gradient-scale-x" min="0.1" max="3" step="0.01" value="0.1">
            </div>
            <div class="gradient-control-value">
              <input type="number" id="gradient-scale-x-value" value="0.1" step="0.01">
            </div>
          </div>
          <div class="gradient-control-row">
            <div class="gradient-control-label">Scale Y</div>
            <div class="gradient-control-input">
              <input type="range" id="gradient-scale-y" min="0.1" max="3" step="0.01" value="3">
            </div>
            <div class="gradient-control-value">
              <input type="number" id="gradient-scale-y-value" value="3" step="0.01">
            </div>
          </div>
        </div>
      </div>
      
      <!-- Effects Panel -->
      <div class="gradient-panel">
        <div class="gradient-panel-header" data-target="gradient-effects-panel">
          <span>Effects</span>
          <span class="panel-arrow">▼</span>
        </div>
        <div class="gradient-panel-content" id="gradient-effects-panel">
          <div class="gradient-control-row">
            <div class="gradient-control-label">Paper Texture</div>
            <div class="gradient-control-input">
              <input type="range" id="gradient-paper-texture" min="0" max="0.2" step="0.01" value="0.06">
            </div>
            <div class="gradient-control-value">
              <input type="number" id="gradient-paper-texture-value" value="0.06" step="0.01">
            </div>
          </div>
          <div class="gradient-control-row">
            <div class="gradient-control-label">Mirror Mode</div>
            <div class="gradient-control-input" style="display: flex; justify-content: flex-end;">
              <select id="gradient-mirror-mode">
                <option value="0" selected>None</option>
                <option value="1">X-axis</option>
                <option value="2">Y-axis</option>
                <option value="3">Both</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Presets Panel -->
      <div class="gradient-panel">
        <div class="gradient-panel-header" data-target="gradient-presets-panel">
          <span>Gradient Presets</span>
          <span class="panel-arrow">▼</span>
        </div>
        <div class="gradient-panel-content" id="gradient-presets-panel">
          <!-- Built-in presets -->
          <div class="gradient-preset-category">
            <h4>Built-in Presets</h4>
            <div class="gradient-preset-list" id="gradient-builtin-preset-list">
              <!-- Will be populated dynamically -->
            </div>
          </div>
          
          <!-- User presets -->
          <div class="gradient-preset-category">
            <h4>Your Presets</h4>
            <div class="gradient-preset-list" id="gradient-user-preset-list">
              <!-- Will be populated dynamically -->
            </div>
          </div>
          
          <!-- Save preset form -->
          <h4>Save Current Settings</h4>
          <input type="text" id="gradient-preset-name" placeholder="Preset Name">
          <button id="gradient-save-preset" class="gradient-action-button">Save Preset</button>
        </div>
      </div>
    `;
    
    // Add CSS for gradient controls
    const style = document.createElement('style');
    style.textContent = `
      .gradient-panel {
        margin-bottom: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }
      
      .gradient-panel-header {
        background-color: rgba(50, 50, 50, 0.8);
        padding: 8px;
        border-radius: 4px 4px 0 0;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .gradient-panel-header:hover {
        background-color: rgba(70, 70, 70, 0.8);
      }
      
      .gradient-panel-content {
        padding: 10px;
        display: none;
        background-color: rgba(30, 30, 30, 0.6);
      }
      
      .gradient-panel-content.active {
        display: block;
      }
      
      .panel-arrow {
        transition: transform 0.3s;
      }
      
      .gradient-panel-header.active .panel-arrow {
        transform: rotate(180deg);
      }
      
      .gradient-control-row {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .gradient-control-label {
        width: 100px;
        font-size: 12px;
      }
      
      .gradient-control-input {
        flex: 1;
      }
      
      .gradient-control-value {
        width: 50px;
        text-align: right;
        font-size: 12px;
      }
      
      .gradient-control-input input[type="range"] {
        width: 100%;
      }
      
      .gradient-control-value input[type="number"] {
        width: 45px;
        background: rgba(30, 30, 30, 0.8);
        border: 1px solid #555;
        color: white;
        padding: 2px;
        border-radius: 3px;
      }
      
      .color-input {
        display: flex;
        align-items: center;
        margin-bottom: 5px;
      }
      
      .color-input input[type="color"] {
        height: 24px;
        width: 24px;
        background: none;
        border: none;
        padding: 0;
        margin-right: 8px;
      }
      
      .gradient-action-button {
        background-color: rgba(60, 100, 150, 0.8);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        margin-top: 8px;
        cursor: pointer;
        width: 100%;
        transition: background-color 0.2s;
      }
      
      .gradient-action-button:hover {
        background-color: rgba(80, 120, 170, 0.8);
      }
      
      .gradient-palette-preset {
        display: inline-block;
        width: 30px;
        height: 30px;
        margin: 4px;
        border-radius: 4px;
        cursor: pointer;
        border: 1px solid #555;
        background: linear-gradient(to bottom right, var(--color1), var(--color2), var(--color3), var(--color4));
      }
      
      .gradient-preset-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 8px;
      }
      
      .gradient-preset-list {
        max-height: 120px;
        overflow-y: auto;
        margin-bottom: 10px;
      }
      
      .gradient-preset-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px;
        border: 1px solid #333;
        border-radius: 4px;
        margin-bottom: 4px;
      }
      
      .gradient-preset-item:hover {
        background: rgba(60, 60, 60, 0.5);
      }
      
      .gradient-preset-actions {
        display: flex;
        gap: 5px;
      }
      
      .gradient-preset-actions button {
        background: rgba(40, 40, 40, 0.8);
        border: none;
        color: white;
        padding: 2px 5px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 11px;
      }
      
      .gradient-preset-actions button:hover {
        background: rgba(60, 60, 60, 0.8);
      }
      
      #gradient-preset-name {
        width: 100%;
        background: rgba(30, 30, 30, 0.8);
        border: 1px solid #555;
        color: white;
        padding: 5px;
        border-radius: 4px;
        margin-bottom: 8px;
      }

      .gradient-preset-copy {
        background-color: rgba(80, 80, 150, 0.8);
        color: white;
        border: none;
        border-radius: 3px;
        padding: 2px 5px;
        cursor: pointer;
        font-size: 11px;
        margin-left: 5px;
      }

      .gradient-preset-copy:hover {
        background-color: rgba(100, 100, 180, 0.8);
      }
      
      /* Make sure controls only show in design mode */
      body:not(.design-mode) .design-element {
        display: none !important;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // WebGL variables
  let gl, shaderProgram, programInfo, positionBuffer, textureCoordBuffer;
  let startTime;
  let gradientPresets = [];
  let userGradientPresets = [];
  
  // Initialize WebGL gradient
  function initGradient() {
    const canvas = document.getElementById('gradient-canvas');
    if (!canvas) return;
    
    // Get WebGL context
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    
    // Set canvas size
    resizeGradientCanvas();
    window.addEventListener('resize', resizeGradientCanvas);
    
    // Initialize shaders
    initShaders();
    
    // Create buffers
    createBuffers();
    
    // Start animation
    startTime = Date.now();
    requestAnimationFrame(renderGradient);
    
    // Load built-in presets
    loadBuiltInGradientPresets();
    
    // Load user presets from localStorage
    loadUserGradientPresets();
  }
  
  // Set canvas size
  function resizeGradientCanvas() {
    const canvas = document.getElementById('gradient-canvas');
    if (!canvas || !gl) return;
    
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  
  // Initialize WebGL shaders
  function initShaders() {
    // Vertex shader program
    const vsSource = `
      attribute vec4 aVertexPosition;
      attribute vec2 aTextureCoord;
      
      varying highp vec2 vTextureCoord;
      
      void main(void) {
        gl_Position = aVertexPosition;
        vTextureCoord = aTextureCoord;
      }
    `;
    
    // Fragment shader program
    const fsSource = `
      precision highp float;
      varying highp vec2 vTextureCoord;
      
      uniform float uTime;
      uniform vec2 uResolution;
      
      // Noise settings
      uniform float uSeed;
      uniform float uPeriod;
      uniform float uRoughness;
      uniform float uAmplitude;
      uniform float uAnimationSpeed;
      
      // Transform settings
      uniform vec2 uTranslate;
      uniform vec2 uScale;
      
      // Effect settings
      uniform float uPaperTexture;
      uniform int uMirrorMode; // 0 = none, 1 = x, 2 = y, 3 = both
      
      // Color palette uniforms
      uniform vec3 uColor0;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform vec3 uColor4;
      
      // Simplex 3D Noise function
      vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        // First corner
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; 
        vec3 x3 = x0 - D.yyy;
        
        // Permutations
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0));
               
        // Gradients
        float n_ = 1.0/7.0; // N=7
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        // Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }
      
      // Get color from gradient
      vec3 getColor(float value) {
        // Scale and bias
        value = clamp(value * 2.0, 0.0, 1.0);
        
        // Smoothstep between colors based on value
        if (value < 0.25) {
          return mix(uColor0, uColor1, smoothstep(0.0, 0.25, value));
        } else if (value < 0.5) {
          return mix(uColor1, uColor2, smoothstep(0.25, 0.5, value));
        } else if (value < 0.75) {
          return mix(uColor2, uColor3, smoothstep(0.5, 0.75, value));
        } else {
          return mix(uColor3, uColor4, smoothstep(0.75, 1.0, value));
        }
      }
      
      // Paper texture simulation
      float paperTexture(vec2 uv) {
        return snoise(vec3(uv * 1000.0, 0.0)) * uPaperTexture;
      }
      
      void main() {
        // Normalized coordinates
        vec2 uv = vTextureCoord;
        
        // Aspect ratio correction
        float aspect = uResolution.x / uResolution.y;
        if (aspect > 1.0) {
          uv.x *= aspect;
        } else {
          uv.y /= aspect;
        }
        
        // First scale the coordinates around the center
        // Center the coordinates to origin, scale, then recenter
        uv = (uv - 0.5) / uScale + 0.5;
        
        // Now apply mirroring centered at 0.5, 0.5
        if (uMirrorMode == 1 || uMirrorMode == 3) { // X or Both
          // Mirror around the vertical center line (x = 0.5)
          uv.x = abs(uv.x - 0.5) + 0.5;
        }
        if (uMirrorMode == 2 || uMirrorMode == 3) { // Y or Both
          // Mirror around the horizontal center line (y = 0.5)
          uv.y = abs(uv.y - 0.5) + 0.5;
        }
        
        // Apply translation after mirroring
        uv = uv + uTranslate - 0.5;
        
        // Generate noise with animation
        vec3 noisePos = vec3(
          uv.x + uTime * uAnimationSpeed,
          uv.y + uTime * (uAnimationSpeed * 0.5),
          uSeed / 1000.0
        );
        
        float noiseValue = (snoise(noisePos * uPeriod) + 1.0) * 0.5;
        
        // Add overtones for roughness
        float roughnessScale = 2.0;
        noiseValue += (snoise(noisePos * uPeriod * roughnessScale) + 1.0) * 0.5 * uRoughness * 0.5;
        
        // Apply amplitude
        noiseValue *= uAmplitude;
        
        // Map noise to colors
        vec3 color = getColor(noiseValue);
        
        // Add paper texture displacement
        float displacement = paperTexture(uv);
        color += displacement;
        
        // Final output
        gl_FragColor = vec4(color, 1.0);
      }
    `;
    
    // Initialize shader program
    shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    if (!shaderProgram) return;
    
    // Collect all the info needed to use the shader program
    programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
      },
      uniformLocations: {
        time: gl.getUniformLocation(shaderProgram, 'uTime'),
        resolution: gl.getUniformLocation(shaderProgram, 'uResolution'),
        
        // Noise uniforms
        seed: gl.getUniformLocation(shaderProgram, 'uSeed'),
        period: gl.getUniformLocation(shaderProgram, 'uPeriod'),
        roughness: gl.getUniformLocation(shaderProgram, 'uRoughness'),
        amplitude: gl.getUniformLocation(shaderProgram, 'uAmplitude'),
        animationSpeed: gl.getUniformLocation(shaderProgram, 'uAnimationSpeed'),
        
        // Transform uniforms
        translate: gl.getUniformLocation(shaderProgram, 'uTranslate'),
        scale: gl.getUniformLocation(shaderProgram, 'uScale'),
        
        // Effect uniforms
        paperTexture: gl.getUniformLocation(shaderProgram, 'uPaperTexture'),
        mirrorMode: gl.getUniformLocation(shaderProgram, 'uMirrorMode'),
        
        // Color uniforms
        color0: gl.getUniformLocation(shaderProgram, 'uColor0'),
        color1: gl.getUniformLocation(shaderProgram, 'uColor1'),
        color2: gl.getUniformLocation(shaderProgram, 'uColor2'),
        color3: gl.getUniformLocation(shaderProgram, 'uColor3'),
        color4: gl.getUniformLocation(shaderProgram, 'uColor4'),
      },
    };
  }
  
  // Initialize a shader program
  function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    
    // Check if shaders compiled successfully
    if (!vertexShader || !fragmentShader) {
      return null;
    }
    
    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }
    
    return shaderProgram;
  }
  
  // Creates a shader of the given type, uploads the source, compiles it
  function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
  
  // Create buffers for rendering
  function createBuffers() {
    // Positions for a quad covering the entire screen
    const positions = [
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0,
    ];
    
    const textureCoordinates = [
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      1.0, 1.0,
    ];
    
    // Create position buffer
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    // Create texture coordinate buffer
    textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
  }
  
  // Set up UI controls
  function setupGradientControls() {
    // Set up panel toggle behavior
    document.querySelectorAll('.gradient-panel-header').forEach(header => {
      header.addEventListener('click', () => {
        const targetId = header.getAttribute('data-target');
        const content = document.getElementById(targetId);
        
        if (content) {
          header.classList.toggle('active');
          content.classList.toggle('active');
        }
      });
    });
    
    // Set up range-input sync for all control pairs
    setupRangeInputSync();
    
    // Setup color input change events
    setupColorControls();
    
    // Setup save preset button
    document.getElementById('gradient-save-preset').addEventListener('click', saveGradientPreset);
  }
  
  // Set up synchronization between range inputs and number inputs
  function setupRangeInputSync() {
    const controlPairs = [
      ['gradient-seed', 'gradient-seed-value'],
      ['gradient-period', 'gradient-period-value'],
      ['gradient-roughness', 'gradient-roughness-value'],
      ['gradient-amplitude', 'gradient-amplitude-value'],
      ['gradient-animation-speed', 'gradient-animation-speed-value'],
      ['gradient-translate-x', 'gradient-translate-x-value'],
      ['gradient-translate-y', 'gradient-translate-y-value'],
      ['gradient-scale-x', 'gradient-scale-x-value'],
      ['gradient-scale-y', 'gradient-scale-y-value'],
      ['gradient-paper-texture', 'gradient-paper-texture-value']
    ];
    
    controlPairs.forEach(pair => {
      const rangeInput = document.getElementById(pair[0]);
      const numberInput = document.getElementById(pair[1]);
      
      if (!rangeInput || !numberInput) return;
      
      rangeInput.addEventListener('input', () => {
        numberInput.value = rangeInput.value;
      });
      
      numberInput.addEventListener('input', () => {
        rangeInput.value = numberInput.value;
      });
    });
  }
  
  // Set up color controls
  function setupColorControls() {
    // Color inputs
    document.getElementById('gradient-color0').addEventListener('input', updateGradientColors);
    document.getElementById('gradient-color1').addEventListener('input', updateGradientColors);
    document.getElementById('gradient-color2').addEventListener('input', updateGradientColors);
    document.getElementById('gradient-color3').addEventListener('input', updateGradientColors);
    document.getElementById('gradient-color4').addEventListener('input', updateGradientColors);
    
    // Random color generation
    document.getElementById('generate-gradient-colors').addEventListener('click', generateRandomGradientColors);
    
    // Color palette presets
    document.querySelectorAll('.gradient-palette-preset').forEach(preset => {
      preset.addEventListener('click', () => {
        const paletteName = preset.getAttribute('data-palette');
        applyGradientColorPalette(paletteName);
      });
    });
  }
  
  // Helper function to convert hex color to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : null;
  }
  
  // Update colors in the shader
  function updateGradientColors() {
    if (!gl || !programInfo) return;
    
    gl.useProgram(programInfo.program);
    
    // Get color values from inputs
    const color0Hex = document.getElementById('gradient-color0').value;
    const color1Hex = document.getElementById('gradient-color1').value;
    const color2Hex = document.getElementById('gradient-color2').value;
    const color3Hex = document.getElementById('gradient-color3').value;
    const color4Hex = document.getElementById('gradient-color4').value;
    
    // Convert to RGB
    const color0 = hexToRgb(color0Hex);
    const color1 = hexToRgb(color1Hex);
    const color2 = hexToRgb(color2Hex);
    const color3 = hexToRgb(color3Hex);
    const color4 = hexToRgb(color4Hex);
    
    // Update uniforms
    gl.uniform3f(programInfo.uniformLocations.color0, color0.r, color0.g, color0.b);
    gl.uniform3f(programInfo.uniformLocations.color1, color1.r, color1.g, color1.b);
    gl.uniform3f(programInfo.uniformLocations.color2, color2.r, color2.g, color2.b);
    gl.uniform3f(programInfo.uniformLocations.color3, color3.r, color3.g, color3.b);
    gl.uniform3f(programInfo.uniformLocations.color4, color4.r, color4.g, color4.b);
  }
  
  // Generate random colors
  function generateRandomGradientColors() {
    const randomHex = () => {
      return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    };
    
    document.getElementById('gradient-color0').value = randomHex();
    document.getElementById('gradient-color1').value = randomHex();
    document.getElementById('gradient-color2').value = randomHex();
    document.getElementById('gradient-color3').value = randomHex();
    document.getElementById('gradient-color4').value = randomHex();
    
    updateGradientColors();
  }
  
  // Apply a color palette
  function applyGradientColorPalette(paletteName) {
    // Define color palettes
    const colorPalettes = {
      default: {
        color0: '#F14D7B', // Pink/Magenta
        color1: '#FEC677', // Orange/Peach
        color2: '#FEF6EA', // Yellow/Gold
        color3: '#A5FEEE', // Cyan/Mint
        color4: '#556360'  // Dark Gray
      },
      sunset: {
        color0: '#3A1C71', // Deep purple
        color1: '#D76D77', // Pink
        color2: '#FFAF7B', // Peach
        color3: '#AA4465', // Magenta
        color4: '#462255'  // Dark purple
      },
      ocean: {
        color0: '#005AA7', // Deep blue
        color1: '#FFFDE4', // Light cream
        color2: '#4FACFE', // Sky blue
        color3: '#00F2FE', // Cyan
        color4: '#003F75'  // Navy
      },
      purple: {
        color0: '#667EEA', // Periwinkle
        color1: '#764BA2', // Purple
        color2: '#6B8DD6', // Blue-purple
        color3: '#8E37D7', // Violet
        color4: '#4B3993'  // Deep purple
      },
      greenblue: {
        color0: '#11998E', // Teal
        color1: '#38EF7D', // Lime
        color2: '#0ED2F7', // Aqua
        color3: '#08AEEA', // Light blue
        color4: '#0B5E59'  // Dark teal
      },
      reddish: {
        color0: '#FF416C', // Bright pink
        color1: '#FF4B2B', // Red-orange
        color2: '#F78CA0', // Pink
        color3: '#F9748F', // Salmon
        color4: '#B82E4C'  // Burgundy
      }
    };
    
    const palette = colorPalettes[paletteName];
    if (!palette) return;
    
    document.getElementById('gradient-color0').value = palette.color0;
    document.getElementById('gradient-color1').value = palette.color1;
    document.getElementById('gradient-color2').value = palette.color2;
    document.getElementById('gradient-color3').value = palette.color3;
    document.getElementById('gradient-color4').value = palette.color4;
    
    updateGradientColors();
  }
  
  // Render the gradient
  function renderGradient() {
    if (!gl || !programInfo) {
      requestAnimationFrame(renderGradient);
      return;
    }
    
    // Calculate time
    const currentTime = Date.now();
    const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
    
    // Clear the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Set the shader program
    gl.useProgram(programInfo.program);
    
    // Set up the position attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      2,        // 2 components per vertex
      gl.FLOAT, // Data type
      false,    // Don't normalize
      0,        // Stride
      0         // Offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    
    // Set up the texture coordinate attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer(
      programInfo.attribLocations.textureCoord,
      2,        // 2 components per coordinate
      gl.FLOAT, // Data type
      false,    // Don't normalize
      0,        // Stride
      0         // Offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
    
    // Set uniform values from UI controls
    updateShaderUniforms(elapsedTime);
    
    // Draw the quad
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    // Request another frame
    requestAnimationFrame(renderGradient);
  }
  
  // Update shader uniforms from UI values
  function updateShaderUniforms(elapsedTime) {
    // Time and resolution
    gl.uniform1f(programInfo.uniformLocations.time, elapsedTime);
    gl.uniform2f(programInfo.uniformLocations.resolution, gl.canvas.width, gl.canvas.height);
    
    // Get values from UI controls
    const seed = parseFloat(document.getElementById('gradient-seed').value);
    const period = parseFloat(document.getElementById('gradient-period').value);
    const roughness = parseFloat(document.getElementById('gradient-roughness').value);
    const amplitude = parseFloat(document.getElementById('gradient-amplitude').value);
    const animationSpeed = parseFloat(document.getElementById('gradient-animation-speed').value);
    
    const translateX = parseFloat(document.getElementById('gradient-translate-x').value);
    const translateY = parseFloat(document.getElementById('gradient-translate-y').value);
    const scaleX = parseFloat(document.getElementById('gradient-scale-x').value);
    const scaleY = parseFloat(document.getElementById('gradient-scale-y').value);
    
    const paperTextureIntensity = parseFloat(document.getElementById('gradient-paper-texture').value);
    
    let mirrorMode = 0;
    const mirrorSelect = document.getElementById('gradient-mirror-mode');
    if (mirrorSelect) {
      mirrorMode = parseInt(mirrorSelect.value);
    }
    
    // Set noise uniforms
    gl.uniform1f(programInfo.uniformLocations.seed, seed);
    gl.uniform1f(programInfo.uniformLocations.period, period);
    gl.uniform1f(programInfo.uniformLocations.roughness, roughness);
    gl.uniform1f(programInfo.uniformLocations.amplitude, amplitude);
    gl.uniform1f(programInfo.uniformLocations.animationSpeed, animationSpeed);
    
    // Set transform uniforms
    gl.uniform2f(programInfo.uniformLocations.translate, translateX, translateY);
    gl.uniform2f(programInfo.uniformLocations.scale, scaleX, scaleY);
    
    // Set effect uniforms
    gl.uniform1f(programInfo.uniformLocations.paperTexture, paperTextureIntensity);
    gl.uniform1i(programInfo.uniformLocations.mirrorMode, mirrorMode);
    
    // Set color uniforms
    updateGradientColors();
  }
  
  // Get current gradient settings
  function getCurrentGradientSettings() {
    return {
      // Colors
      color0: document.getElementById('gradient-color0').value,
      color1: document.getElementById('gradient-color1').value,
      color2: document.getElementById('gradient-color2').value,
      color3: document.getElementById('gradient-color3').value,
      color4: document.getElementById('gradient-color4').value,
      
      // Noise
      seed: parseFloat(document.getElementById('gradient-seed').value),
      period: parseFloat(document.getElementById('gradient-period').value),
      roughness: parseFloat(document.getElementById('gradient-roughness').value),
      amplitude: parseFloat(document.getElementById('gradient-amplitude').value),
      animationSpeed: parseFloat(document.getElementById('gradient-animation-speed').value),
      
      // Transform
      translateX: parseFloat(document.getElementById('gradient-translate-x').value),
      translateY: parseFloat(document.getElementById('gradient-translate-y').value),
      scaleX: parseFloat(document.getElementById('gradient-scale-x').value),
      scaleY: parseFloat(document.getElementById('gradient-scale-y').value),
      
      // Effects
      paperTexture: parseFloat(document.getElementById('gradient-paper-texture').value),
      mirrorMode: parseInt(document.getElementById('gradient-mirror-mode').value)
    };
  }
  
  // Apply settings from a preset
  function applyGradientSettings(settings) {
    // Apply colors
    document.getElementById('gradient-color0').value = settings.color0;
    document.getElementById('gradient-color1').value = settings.color1;
    document.getElementById('gradient-color2').value = settings.color2;
    document.getElementById('gradient-color3').value = settings.color3;
    document.getElementById('gradient-color4').value = settings.color4;
    
    // Apply noise settings
    document.getElementById('gradient-seed').value = settings.seed;
    document.getElementById('gradient-seed-value').value = settings.seed;
    document.getElementById('gradient-period').value = settings.period;
    document.getElementById('gradient-period-value').value = settings.period;
    document.getElementById('gradient-roughness').value = settings.roughness;
    document.getElementById('gradient-roughness-value').value = settings.roughness;
    document.getElementById('gradient-amplitude').value = settings.amplitude;
    document.getElementById('gradient-amplitude-value').value = settings.amplitude;
    document.getElementById('gradient-animation-speed').value = settings.animationSpeed;
    document.getElementById('gradient-animation-speed-value').value = settings.animationSpeed;
    
    // Apply transform settings
    document.getElementById('gradient-translate-x').value = settings.translateX;
    document.getElementById('gradient-translate-x-value').value = settings.translateX;
    document.getElementById('gradient-translate-y').value = settings.translateY;
    document.getElementById('gradient-translate-y-value').value = settings.translateY;
    document.getElementById('gradient-scale-x').value = settings.scaleX;
    document.getElementById('gradient-scale-x-value').value = settings.scaleX;
    document.getElementById('gradient-scale-y').value = settings.scaleY;
    document.getElementById('gradient-scale-y-value').value = settings.scaleY;
    
    // Apply effect settings
    document.getElementById('gradient-paper-texture').value = settings.paperTexture;
    document.getElementById('gradient-paper-texture-value').value = settings.paperTexture;
    document.getElementById('gradient-mirror-mode').value = settings.mirrorMode;
    
    // Update the shader
    updateGradientColors();
  }
  
  // Load built-in gradient presets
  function loadBuiltInGradientPresets() {
    // Define built-in presets
    gradientPresets = [
      {
        name: "Default",
        settings: {
          color0: '#F14D7B',
          color1: '#FEC677',
          color2: '#FEF6EA',
          color3: '#A5FEEE',
          color4: '#556360',
          seed: 793.24,
          period: 0.7,
          roughness: 0.56,
          amplitude: 0.75,
          animationSpeed: 0.09,
          translateX: -8,
          translateY: 0,
          scaleX: 0.1,
          scaleY: 3,
          paperTexture: 0.13,
          mirrorMode: 0
        }
      },
      {
        name: "Sunset Waves",
        settings: {
          color0: '#3A1C71',
          color1: '#D76D77',
          color2: '#FFAF7B',
          color3: '#AA4465',
          color4: '#462255',
          seed: 420.5,
          period: 1.3,
          roughness: 0.8,
          amplitude: 0.65,
          animationSpeed: 0.05,
          translateX: -5,
          translateY: 0,
          scaleX: 0.2,
          scaleY: 2.5,
          paperTexture: 0.13,
          mirrorMode: 2
        }
      },
      {
        name: "Ocean Deep",
        settings: {
          color0: '#005AA7',
          color1: '#FFFDE4',
          color2: '#4FACFE',
          color3: '#00F2FE',
          color4: '#003F75',
          seed: 213.7,
          period: 0.9,
          roughness: 0.35,
          amplitude: 0.9,
          animationSpeed: 0.12,
          translateX: -6,
          translateY: -0.5,
          scaleX: 0.15,
          scaleY: 2,
          paperTexture: 0.13,
          mirrorMode: 1
        }
      },
      {
        name: "Purple Haze",
        settings: {
          color0: '#667EEA',
          color1: '#764BA2',
          color2: '#6B8DD6',
          color3: '#8E37D7',
          color4: '#4B3993',
          seed: 567.8,
          period: 1.5,
          roughness: 0.6,
          amplitude: 0.85,
          animationSpeed: 0.07,
          translateX: -4,
          translateY: 0.5,
          scaleX: 0.3,
          scaleY: 2.2,
          paperTexture: 0.13,
          mirrorMode: 3
        }
      }
    ];
    
    // Render presets in the UI
    renderGradientPresets();
  }
  
  // Load user gradient presets from localStorage
  function loadUserGradientPresets() {
    try {
      const savedPresets = localStorage.getItem('gradientPresets');
      if (savedPresets) {
        userGradientPresets = JSON.parse(savedPresets);
      }
    } catch (e) {
      console.error('Error loading user gradient presets:', e);
      userGradientPresets = [];
    }
    
    // Render presets in the UI
    renderUserGradientPresets();
  }
  
  // Save current settings as a preset
  function saveGradientPreset() {
    const presetName = document.getElementById('gradient-preset-name').value.trim();
    if (!presetName) {
      alert('Please enter a preset name');
      return;
    }
    
    const settings = getCurrentGradientSettings();
    const newPreset = { name: presetName, settings: settings };
    
    // Check if name already exists
    const existingIndex = userGradientPresets.findIndex(p => p.name === presetName);
    
    if (existingIndex >= 0) {
      // Update existing preset
      userGradientPresets[existingIndex] = newPreset;
      alert(`Updated preset: ${presetName}`);
    } else {
      // Add new preset
      userGradientPresets.push(newPreset);
      alert(`Saved preset: ${presetName}`);
    }
    
    // Save to localStorage
    localStorage.setItem('gradientPresets', JSON.stringify(userGradientPresets));
    
    // Update preset list
    renderUserGradientPresets();
    
    // Clear input
    document.getElementById('gradient-preset-name').value = '';
  }
  
  // Apply a preset by name
  function applyGradientPreset(presetName) {
    // Check built-in presets
    let preset = gradientPresets.find(p => p.name === presetName);
    
    // If not found, check user presets
    if (!preset) {
      preset = userGradientPresets.find(p => p.name === presetName);
    }
    
    if (preset) {
      applyGradientSettings(preset.settings);
    }
  }
  
  // Render built-in presets in the UI
  function renderGradientPresets() {
    const presetList = document.getElementById('gradient-builtin-preset-list');
    if (!presetList) return;
    
    presetList.innerHTML = '';
    
    gradientPresets.forEach(preset => {
      const presetItem = document.createElement('div');
      presetItem.className = 'gradient-preset-item';
      presetItem.innerHTML = `
        <span>${preset.name}</span>
        <div class="gradient-preset-actions">
          <button class="gradient-preset-load">Load</button>
          <button class="gradient-preset-copy">Copy Code</button>
        </div>
      `;
      
      // Add event listener for load button
      presetItem.querySelector('.gradient-preset-load').addEventListener('click', () => {
        applyGradientPreset(preset.name);
      });
      
      // Add event listener for copy button
      presetItem.querySelector('.gradient-preset-copy').addEventListener('click', () => {
        copyPresetToCode(preset.name);
      });
      
      presetList.appendChild(presetItem);
    });
    
    // Add the copy current settings button with a slight delay to ensure DOM is ready
    setTimeout(addCopyCurrentSettingsButton, 100);
  }
  
  // Render user presets in the UI
  function renderUserGradientPresets() {
    const presetList = document.getElementById('gradient-user-preset-list');
    if (!presetList) return;
    
    presetList.innerHTML = '';
    
    if (userGradientPresets.length === 0) {
      presetList.innerHTML = '<div style="padding: 5px; opacity: 0.7;">No saved presets yet</div>';
      return;
    }
    
    userGradientPresets.forEach(preset => {
      const presetItem = document.createElement('div');
      presetItem.className = 'gradient-preset-item';
      presetItem.innerHTML = `
        <span>${preset.name}</span>
        <div class="gradient-preset-actions">
          <button class="gradient-preset-load">Load</button>
          <button class="gradient-preset-copy">Copy Code</button>
          <button class="gradient-preset-delete">Delete</button>
        </div>
      `;
      
      // Add event listener for load button
      presetItem.querySelector('.gradient-preset-load').addEventListener('click', () => {
        applyGradientPreset(preset.name);
      });
      
      // Add event listener for copy button
      presetItem.querySelector('.gradient-preset-copy').addEventListener('click', () => {
        copyPresetToCode(preset.name);
      });
      
      // Add event listener for delete button
      presetItem.querySelector('.gradient-preset-delete').addEventListener('click', () => {
        deleteGradientPreset(preset.name);
      });
      
      presetList.appendChild(presetItem);
    });
  }
  
  // Delete a user preset
  function deleteGradientPreset(presetName) {
    userGradientPresets = userGradientPresets.filter(p => p.name !== presetName);
    localStorage.setItem('gradientPresets', JSON.stringify(userGradientPresets));
    renderUserGradientPresets();
    alert(`Deleted preset: ${presetName}`);
  }

  // Function to format gradient settings as code
  function formatGradientSettingsAsCode(preset) {
    const settings = preset.settings;
    
    // Format the colors with backticks for easier embedding in code
    const formattedSettings = {
      ...settings,
      color0: `\`${settings.color0}\``,
      color1: `\`${settings.color1}\``,
      color2: `\`${settings.color2}\``,
      color3: `\`${settings.color3}\``,
      color4: `\`${settings.color4}\``
    };
    
    // Create the formatted string
    const formattedString = `{ name: "${preset.name}", settings: ${JSON.stringify(formattedSettings).replace(/"(`[^`]+`)":/g, "$1:").replace(/"/g, "'")} },`;
    
    return formattedString;
  }

  // Function to copy current settings to clipboard
  function copyCurrentGradientSettingsToCode() {
    // Get current settings
    const currentSettings = getCurrentGradientSettings();
    
    // Create a preset object with current settings
    const tempPreset = {
      name: "Custom Gradient",
      settings: currentSettings
    };
    
    // Get formatted code string
    const codeString = formatGradientSettingsAsCode(tempPreset);
    
    // Copy to clipboard
    navigator.clipboard.writeText(codeString)
      .then(() => {
        showNotification("Settings copied to clipboard as code");
      })
      .catch(err => {
        console.error("Error copying settings to clipboard:", err);
        showNotification("Failed to copy settings. See console for details.");
      });
  }

  // Function to copy specific preset to clipboard
  function copyPresetToCode(presetName) {
    // Find the preset in built-in presets
    let preset = gradientPresets.find(p => p.name === presetName);
    
    // If not found, check user presets
    if (!preset) {
      preset = userGradientPresets.find(p => p.name === presetName);
    }
    
    if (!preset) {
      showNotification("Preset not found");
      return;
    }
    
    // Get formatted code string
    const codeString = formatGradientSettingsAsCode(preset);
    
    // Copy to clipboard
    navigator.clipboard.writeText(codeString)
      .then(() => {
        showNotification(`Preset "${preset.name}" copied to clipboard as code`);
      })
      .catch(err => {
        console.error("Error copying preset to clipboard:", err);
        showNotification("Failed to copy preset. See console for details.");
      });
  }

  // Function to add a "Copy Current Settings as Code" button
  function addCopyCurrentSettingsButton() {
    // Find the presets panel
    const presetsPanel = document.getElementById('gradient-presets-panel');
    if (!presetsPanel) return;
    
    // Check if button already exists
    if (presetsPanel.querySelector('#gradient-copy-current-settings')) return;
    
    // Create button
    const copyCurrentButton = document.createElement('button');
    copyCurrentButton.id = 'gradient-copy-current-settings';
    copyCurrentButton.className = 'gradient-action-button';
    copyCurrentButton.textContent = 'Copy Current Settings as Code';
    copyCurrentButton.style.marginTop = '20px';
    
    // Add event listener
    copyCurrentButton.addEventListener('click', copyCurrentGradientSettingsToCode);
    
    // Find the save preset section - try to find the input first
    const presetNameInput = presetsPanel.querySelector('#gradient-preset-name');
    
    if (presetNameInput) {
      // Insert before the input's parent element
      presetNameInput.parentElement.insertBefore(copyCurrentButton, presetNameInput);
    } else {
      // If we can't find the input, just append to the end of the panel
      presetsPanel.appendChild(copyCurrentButton);
    }
  }
  
  // Integrate with existing design mode
  function integrateWithDesignMode() {
    // Check if the original design mode toggle function exists
    if (window.toggleDesignMode) {
      // Store the original function
      const originalToggleDesignMode = window.toggleDesignMode;
      
      // Override the function to also show/hide gradient controls
      window.toggleDesignMode = function() {
        // Call the original function
        originalToggleDesignMode();
        
        // Update gradient controls visibility based on design mode
        updateGradientControlsVisibility();
      };
    }
    
    // Initial visibility update
    updateGradientControlsVisibility();
  }
  
  // Update gradient controls visibility based on design mode
  function updateGradientControlsVisibility() {
    const isDesignMode = document.body.classList.contains('design-mode');
    const gradientControls = document.getElementById('gradient-controls');
    const toggleButton = document.getElementById('toggle-gradient-controls');
    
    if (gradientControls && toggleButton) {
      if (isDesignMode) {
        toggleButton.style.display = 'flex';
        // Only show controls if toggle button is clicked
      } else {
        toggleButton.style.display = 'none';
        gradientControls.style.display = 'none';
      }
    }
  }
  
  // Make sure to integrate with design mode when the DOM is loaded
  window.addEventListener('load', integrateWithDesignMode);