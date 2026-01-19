/**
 * Animation utilities for LineChart
 */

import { LINE_CHART_ANIMATION } from "./lineChart.constants";

/**
 * Creates animation frames for path morphing
 */
export const createPathFrames = (
  oldPath: string,
  newPath: string,
  frameCount: number,
  interpolatePath: (oldPath: string, newPath: string, t: number) => string
): string[] => {
  return Array.from({ length: frameCount }, (_, index) => {
    const interpolationFactor = index / (frameCount - 1);
    return interpolatePath(oldPath, newPath, interpolationFactor);
  });
};

/**
 * Animation configuration for path morphing
 */
export const PATH_MORPH_ANIMATION = {
  duration: LINE_CHART_ANIMATION.MORPH_DURATION,
};

/**
 * Animation configuration for path drawing
 */
export const PATH_DRAW_ANIMATION = {
  duration: LINE_CHART_ANIMATION.PROGRESS_DURATION,
};
