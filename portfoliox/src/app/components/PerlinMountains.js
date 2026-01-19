"use client";

import { useEffect, useRef } from "react";
import "../style/perlin.css";

export default function PerlinMountains() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Load p5.js
    const loadP5 = async () => {
      try {
        const p5 = (await import("p5")).default;

        // Define the sketch
        const sketch = (p) => {
          const CONFIG = {
            noiseScale: 0.004,
            charSize: 10,
            edgeDistance: 100,
            brightnessThreshold: 0.05,
            octaveNum: 4,
            freqMultiplier: 2.2,
            ampMultiplier: 0.45,
            frameRateVal: 30,
            asciiChars: [
              " ",
              ".",
              ":",
              "-",
              "~",
              "+",
              "=",
              "^",
              "*",
              "#",
              "@",
              "▒",
            ],
          };

          let noiseOffsetX = 0;
          let noiseOffsetY = 0;

          const frequencies = Array(CONFIG.octaveNum)
            .fill(0)
            .map((_, i) => Math.pow(CONFIG.freqMultiplier, i));
          const amplitudes = Array(CONFIG.octaveNum)
            .fill(0)
            .map((_, i) => Math.pow(CONFIG.ampMultiplier, i));
          const maxNoiseVal = amplitudes.reduce((sum, amp) => sum + amp, 0);

          let prevCols = 0,
            prevRows = 0,
            noiseCache = [],
            fadeCache = [];

          function getRidgedNoise(x, y) {
            let noiseVal = 0;
            for (let i = 0; i < CONFIG.octaveNum; i++) {
              const frequency = frequencies[i];
              const amplitude = amplitudes[i];
              let n =
                1 -
                p.abs(
                  p.noise(
                    x * frequency * CONFIG.noiseScale + noiseOffsetX,
                    y * frequency * CONFIG.noiseScale + noiseOffsetY
                  )
                );
              n = 1 - p.abs(n * 2 - 1);
              n = n * n * n;
              noiseVal += n * amplitude;
            }
            return noiseVal / maxNoiseVal;
          }

          function updateCaches(cols, rows) {
            if (
              cols !== prevCols ||
              rows !== prevRows ||
              noiseCache.length === 0
            ) {
              noiseCache = new Array(cols * rows);
              fadeCache = new Array(cols * rows);
              prevCols = cols;
              prevRows = rows;
              const halfCharSize = CONFIG.charSize / 2;
              for (let col = 0; col < cols; col++) {
                const x = col * CONFIG.charSize + halfCharSize;
                const fadeX = p.min(x, p.width - x) / CONFIG.edgeDistance;
                for (let row = 0; row < rows; row++) {
                  const y = row * CONFIG.charSize + halfCharSize;
                  const fadeY = p.min(y, p.height - y) / CONFIG.edgeDistance;
                  fadeCache[col * rows + row] =
                    p.constrain(fadeX, 0, 1) * p.constrain(fadeY, 0, 1);
                }
              }
            }

            for (let col = 0; col < cols; col++) {
              for (let row = 0; row < rows; row++) {
                noiseCache[col * rows + row] = getRidgedNoise(col, row);
              }
            }
          }

          console.log(
            containerRef.current.offsetWidth,
            containerRef.current.offsetHeight,
            "offset"
          );

          p.setup = () => {
            const canvas = p.createCanvas(
              containerRef.current.offsetWidth,
              containerRef.current.offsetHeight
            );
            canvas.parent(containerRef.current);
            p.textFont("Courier New");
            p.textSize(CONFIG.charSize);
            p.textAlign(p.CENTER, p.CENTER);
            p.frameRate(CONFIG.frameRateVal);
          };

          p.draw = () => {
            p.background(0);

            const cols = p.floor(p.width / CONFIG.charSize);
            const rows = p.floor(p.height / CONFIG.charSize);
            const halfCharSize = CONFIG.charSize / 2;

            updateCaches(cols, rows);

            let currentBrightness = -1;

            for (let col = 0; col < cols; col++) {
              const x = col * CONFIG.charSize + halfCharSize;
              for (let row = 0; row < rows; row++) {
                const y = row * CONFIG.charSize + halfCharSize;
                const index = col * rows + row;

                let noiseVal = noiseCache[index];
                const fadeFactor = fadeCache[index];

                if (fadeFactor < CONFIG.brightnessThreshold) continue;

                noiseVal = p.constrain(p.map(noiseVal, 0, 1, -0.2, 1.2), 0, 1);
                noiseVal = p.pow(noiseVal, 1.5);

                const brightness = p.pow(noiseVal, 0.8) * 255 * fadeFactor;

                if (p.abs(brightness - currentBrightness) > 1) {
                  p.fill(brightness);
                  currentBrightness = brightness;
                }

                const charIndex = p.floor(
                  p.map(noiseVal, 0, 1, 0, CONFIG.asciiChars.length - 0.01)
                );
                p.text(CONFIG.asciiChars[charIndex], x, y);
              }
            }

            noiseOffsetX += 0.001;
            noiseOffsetY += 0.001;
          };

          p.windowResized = () => {
            p.resizeCanvas(
              containerRef.current.offsetWidth,
              containerRef.current.offsetHeight
            );
          };
        };

        // Create new p5 instance
        new p5(sketch);
      } catch (error) {
        console.error("Error loading p5:", error);
      }
    };

    loadP5();

    return () => {
      // Cleanup will be handled by p5's remove() method
      if (containerRef.current) {
        const canvases = containerRef.current.querySelectorAll("canvas");
        canvases.forEach((c) => c.remove());
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
