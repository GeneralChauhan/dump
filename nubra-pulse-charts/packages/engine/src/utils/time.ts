/**
 * Time-related utilities for the engine package
 */

/**
 * Generates evenly distributed timestamps across a time range
 * Creates an array of timestamps spaced uniformly between startTime and closeTime
 */
export const generateUniformTimestamps = (
  data: number[],
  startTime: number,
  closeTime: number
): number[] => {
  if (data.length === 0) {
    return [];
  }
  const totalDuration = closeTime - startTime;
  const interval = totalDuration / (data.length - 1);
  return data.map((_, index) => startTime + index * interval);
};
