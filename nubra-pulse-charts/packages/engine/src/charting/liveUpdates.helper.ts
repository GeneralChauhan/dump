/**
 * TradingView-style live price update functionality for charts.
 * Handles resolution-based bar updates, determining when to update the last bar
 * versus creating a new bar based on the resolution.
 */

/**
 * Resolution string format (TradingView compatible)
 * Examples: "1", "5", "15", "30", "60", "1H", "4H", "1D", "1W", "1M"
 */
export type ResolutionString = string;

/**
 * OHLC bar structure
 */
export interface OHLCBar {
  time: number; // timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/**
 * Live update data from socket/API
 */
export interface LiveUpdateData {
  timestamp: number; // timestamp in microseconds (nanoseconds / 1000)
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  bucketVolume?: number;
}

/**
 * Converts a resolution string to milliseconds
 * @param resolution - Resolution string (e.g., "1", "5", "1D", "1W", "1M")
 * @returns Milliseconds in the resolution period
 */
export const getMilliSecondsInTheResolution = (
  resolution: ResolutionString
): number => {
  const resolutionUpper = resolution.toUpperCase().trim();

  // Handle minutes (e.g., "1", "5", "15", "30", "60" or "1MIN", "5MIN")
  if (resolutionUpper.endsWith("MIN") || /^\d+$/.test(resolutionUpper)) {
    const minutes = parseInt(resolutionUpper.replace("MIN", ""), 10);
    if (!isNaN(minutes) && minutes > 0) {
      return minutes * 60 * 1000;
    }
  }

  // Handle hours (e.g., "1H", "4H", "12H")
  if (resolutionUpper.endsWith("H")) {
    const hours = parseInt(resolutionUpper.replace("H", ""), 10);
    if (!isNaN(hours) && hours > 0) {
      return hours * 60 * 60 * 1000;
    }
  }

  // Handle days (e.g., "1D", "7D")
  if (resolutionUpper.endsWith("D")) {
    const days = parseInt(resolutionUpper.replace("D", ""), 10);
    if (!isNaN(days) && days > 0) {
      return days * 24 * 60 * 60 * 1000;
    }
  }

  // Handle weeks (e.g., "1W", "2W")
  if (resolutionUpper.endsWith("W")) {
    const weeks = parseInt(resolutionUpper.replace("W", ""), 10);
    if (!isNaN(weeks) && weeks > 0) {
      return weeks * 7 * 24 * 60 * 60 * 1000;
    }
  }

  // Handle months (e.g., "1M", "3M")
  // For months, we use an approximate value (30 days)
  // The actual logic for monthly bars is handled in getShouldUpdateLastBar
  if (resolutionUpper.endsWith("M")) {
    const months = parseInt(resolutionUpper.replace("M", ""), 10);
    if (!isNaN(months) && months > 0) {
      return months * 30 * 24 * 60 * 60 * 1000; // Approximate
    }
  }

  // Default to 1 minute if resolution is not recognized
  return 60 * 1000;
};

/**
 * Determines if the last bar should be updated based on whether the current time
 * falls within the same resolution period.
 * @param lastBarSec - Last bar timestamp in seconds
 * @param currentBarTime - Current bar timestamp in seconds
 * @param resolution - Resolution string
 * @returns true if the last bar should be updated, false if a new bar should be created
 */
export const getShouldUpdateLastBar = (
  lastBarSec: number,
  currentBarTime: number,
  resolution: ResolutionString
): boolean => {
  const resolutionValue = getMilliSecondsInTheResolution(resolution);
  // Convert resolution from milliseconds to seconds for comparison
  const resolutionValueSeconds = resolutionValue / 1000;

  let shouldUpdateLastBar =
    currentBarTime - lastBarSec < resolutionValueSeconds;

  const isResolutionMonth = resolution.toUpperCase().trim().includes("M");

  if (isResolutionMonth) {
    const lastBarDate = new Date(lastBarSec * 1000);
    const currentDate = new Date(currentBarTime * 1000);

    // Start of the current month
    const startOfCurrentMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getTime();

    // Start of the month for the lastBar timestamp
    const startOfLastBarDateMonth = new Date(
      lastBarDate.getFullYear(),
      lastBarDate.getMonth(),
      1
    ).getTime();

    shouldUpdateLastBar = startOfLastBarDateMonth >= startOfCurrentMonth;
  }

  return shouldUpdateLastBar;
};

/**
 * Creates an OHLC bar from the provided data
 */
const createOHLCBar = (params: {
  time: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volume?: number;
}): OHLCBar => {
  return {
    time: params.time,
    open: params.open,
    high: params.high,
    low: params.low,
    close: params.close,
    volume: params.volume,
  };
};

/**
 * Processes a live update and returns an updated or new bar.
 * This is the main function for handling TradingView-style live price updates.
 *
 * @param data - Live update data from socket/API
 * @param lastBar - The last bar (or null if no bars exist)
 * @param resolution - Resolution string (e.g., "1", "5", "1D", "1W", "1M")
 * @param priceConverter - Optional function to convert prices (e.g., paisa to rupee)
 * @returns Updated bar if within the same resolution period, new bar if a new period has started, or null if update should be ignored
 */
export const processLiveUpdate = (
  data: LiveUpdateData,
  lastBar: OHLCBar | null,
  resolution: ResolutionString,
  priceConverter?: (value: number) => number
): OHLCBar | null => {
  const {
    timestamp: currentBarTime = 0,
    open = 0,
    bucketVolume = 0,
    high = 0,
    low = 0,
    close = 0,
  } = data;

  // Convert microseconds to seconds
  // Note: Reference code divides by 1e6, suggesting timestamp is in microseconds
  // If your API uses nanoseconds, change 1e6 to 1e9
  const currentBarTimeSeconds = Math.floor(currentBarTime / 1e6);

  if (!currentBarTime || currentBarTimeSeconds <= 0) {
    return null;
  }

  // If no last bar exists, create a new one
  if (!lastBar) {
    const currentBarTimeRoundedToMinute =
      Math.floor(currentBarTimeSeconds / 60) * 60; // Rounding to the minute
    const converter = priceConverter || ((v: number) => v);
    return createOHLCBar({
      time: currentBarTimeRoundedToMinute,
      high: converter(high),
      low: converter(low),
      open: converter(open),
      close: converter(close),
      volume: bucketVolume,
    });
  }

  const { time: lastBarSec } = lastBar;

  const shouldUpdateLastBar = getShouldUpdateLastBar(
    lastBarSec,
    currentBarTimeSeconds,
    resolution
  );

  const currentBarTimeRoundedToMinute =
    Math.floor(currentBarTimeSeconds / 60) * 60; // Rounding to the minute so minute next candle does not include seconds
  const barTime = shouldUpdateLastBar
    ? lastBar.time
    : currentBarTimeRoundedToMinute;

  const converter = priceConverter || ((v: number) => v);

  // Create a new candle or update existing one
  const updatedLastBar = createOHLCBar({
    time: barTime,
    high: converter(high),
    low: converter(low),
    open: converter(open),
    close: converter(close),
    volume: bucketVolume,
  });

  // If updating the last bar, merge with existing values
  if (shouldUpdateLastBar && lastBar) {
    // When updating, preserve the original open, but update high/low/close
    updatedLastBar.open = lastBar.open;
    updatedLastBar.high = Math.max(lastBar.high, updatedLastBar.high);
    updatedLastBar.low = Math.min(lastBar.low, updatedLastBar.low);
    updatedLastBar.volume = (lastBar.volume || 0) + (bucketVolume || 0);
  }

  return updatedLastBar;
};
