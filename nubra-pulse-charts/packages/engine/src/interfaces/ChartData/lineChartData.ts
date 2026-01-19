/**
 * Type definitions for LineChart - shared across platforms
 */

export type iPoint = {
  x: number;
  y: number;
};

export type iMarketHoursRange = {
  startTime: number;
  closeTime: number;
};

export type iFilteredDataResult = {
  filteredData: number[];
  filteredIndices: number[];
  marketHoursRange: iMarketHoursRange | null;
  plottedData: number[];
  plottedIndices: number[];
};

export type iFindNearestIndexParams = {
  x: number;
  positions: number[];
};

export type iInterpolateYParams = {
  x: number;
  points: iPoint[];
  xPositions: number[];
};

export type iFormatTickLabelParams = {
  value: number;
};

export type iFormatTimeLabelParams = {
  timestamp: number;
};

export type iProcessMarketHoursDataParams = {
  data: number[];
  marketStartTime?: Date | number;
  marketCloseTime?: Date | number;
  timestamps?: number[];
  /**
   * Optional period identifier (e.g. "1D") used to decide whether market-hours
   * filtering should be applied.
   */
  period?: string;
};

