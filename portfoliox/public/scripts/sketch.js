/* Global Configuration */
const CONFIG = {
    noiseScale: 0.004,
    charSize: 10,
    edgeDistance: 100,
    brightnessThreshold: 0.05, // Skip nearly invisible characters
    octaveNum: 4,
    freqMultiplier: 2.2,
    ampMultiplier: 0.45,
    frameRateVal: 30,
    asciiChars: [" ", ".", ":", "-", "~", "+", "=", "^", "*", "#", "@", "▒"]
  };
  
  // Noise offsets for smooth animation
  let noiseOffsetX = 0;
  let noiseOffsetY = 0;
  
  // Pre-calculated values for noise generation
  const frequencies = Array(CONFIG.octaveNum)
    .fill(0)
    .map((_, i) => Math.pow(CONFIG.freqMultiplier, i));
  const amplitudes = Array(CONFIG.octaveNum)
    .fill(0)
    .map((_, i) => Math.pow(CONFIG.ampMultiplier, i));
  const maxNoiseVal = amplitudes.reduce((sum, amp) => sum + amp, 0);
  
  // Cache structures
  let prevCols = 0,
    prevRows = 0,
    noiseCache = [],
    fadeCache = [];
  
  // Add error handling for p5 functions
  function safeNoise(x, y) {
    try {
      return noise(x, y);
    } catch (error) {
      console.error('Error in noise function:', error);
      return 0;
    }
  }
  
  /**
   * Returns a ridged noise value for the given coordinates.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @returns {number} The ridged noise value.
   */
  function getRidgedNoise(x, y) {
    let noiseVal = 0;
  
    for (let i = 0; i < CONFIG.octaveNum; i++) {
      const frequency = frequencies[i];
      const amplitude = amplitudes[i];
      let n =
        1 -
        abs(
          safeNoise(
            x * frequency * CONFIG.noiseScale + noiseOffsetX,
            y * frequency * CONFIG.noiseScale + noiseOffsetY
          )
        );
      n = 1 - abs(n * 2 - 1);
      n = n * n * n;
      noiseVal += n * amplitude;
    }
  
    return noiseVal / maxNoiseVal;
  }
  
  /**
   * Initializes or updates the noise and fade caches based on the current canvas dimensions.
   * @param {number} cols - The number of columns.
   * @param {number} rows - The number of rows.
   */
  function updateCaches(cols, rows) {
    // Reinitialize caches if canvas dimensions have changed
    if (cols !== prevCols || rows !== prevRows || noiseCache.length === 0) {
      noiseCache = new Array(cols * rows);
      fadeCache = new Array(cols * rows);
      prevCols = cols;
      prevRows = rows;
      const halfCharSize = CONFIG.charSize / 2;
      for (let col = 0; col < cols; col++) {
        const x = col * CONFIG.charSize + halfCharSize;
        const fadeX = min(x, width - x) / CONFIG.edgeDistance;
        for (let row = 0; row < rows; row++) {
          const y = row * CONFIG.charSize + halfCharSize;
          const fadeY = min(y, height - y) / CONFIG.edgeDistance;
          fadeCache[col * rows + row] =
            constrain(fadeX, 0, 1) * constrain(fadeY, 0, 1);
        }
      }
    }
  
    // Update noise values for each cell using flat index
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        noiseCache[col * rows + row] = getRidgedNoise(col, row);
      }
    }
  }
  
  /**
   * Sets up the canvas and initializes the drawing environment.
   */
  function setup() {
    try {
      console.log('Setting up canvas...');
      const canvas = createCanvas(windowWidth, windowHeight);
      canvas.parent('perlin-container');
      console.log('Canvas created and attached to container');
      
      textFont("Courier New");
      textSize(CONFIG.charSize);
      textAlign(CENTER, CENTER);
      frameRate(CONFIG.frameRateVal);
      console.log('Setup complete');
    } catch (error) {
      console.error('Error in setup:', error);
    }
  }
  
  /**
   * Draws the noise pattern on the canvas.
   */
  function draw() {
    try {
      background(0);
  
      const cols = floor(width / CONFIG.charSize);
      const rows = floor(height / CONFIG.charSize);
      const halfCharSize = CONFIG.charSize / 2;
  
      // Update caches each frame
      updateCaches(cols, rows);
  
      let currentBrightness = -1;
  
      for (let col = 0; col < cols; col++) {
        const x = col * CONFIG.charSize + halfCharSize;
        for (let row = 0; row < rows; row++) {
          const y = row * CONFIG.charSize + halfCharSize;
          const index = col * rows + row;
  
          // Retrieve cached noise and fade values
          let noiseVal = noiseCache[index];
          const fadeFactor = fadeCache[index];
  
          // Skip rendering if fade factor is below threshold
          if (fadeFactor < CONFIG.brightnessThreshold) continue;
  
          // Adjust noise value for contrast and apply power curve
          noiseVal = constrain(map(noiseVal, 0, 1, -0.2, 1.2), 0, 1);
          noiseVal = pow(noiseVal, 1.5);
  
          // Compute brightness
          const brightness = pow(noiseVal, 0.8) * 255 * fadeFactor;
  
          // Only update fill if brightness change is significant
          if (abs(brightness - currentBrightness) > 1) {
            fill(brightness);
            currentBrightness = brightness;
          }
  
          // Determine character based on noise value and render text
          const charIndex = floor(
            map(noiseVal, 0, 1, 0, CONFIG.asciiChars.length - 0.01)
          );
          text(CONFIG.asciiChars[charIndex], x, y);
        }
      }
  
      // Increment noise offsets for smooth animation
      noiseOffsetX += 0.001;
      noiseOffsetY += 0.001;
    } catch (error) {
      console.error('Error in draw:', error);
    }
  }
  
  /**
   * Resizes the canvas when the window is resized.
   */
  function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
  }
  