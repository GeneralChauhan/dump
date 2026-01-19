/**
 * Hook for managing TradingView-style live price updates
 * Converts OHLC bars to LineChart-compatible format
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  processLiveUpdate,
  getMilliSecondsInTheResolution,
  type OHLCBar,
  type LiveUpdateData,
  type ResolutionString,
} from "@pulse/engine";

export interface UseLivePriceUpdatesOptions {
  /**
   * Resolution string (e.g., "1", "5", "1D", "1W", "1M")
   */
  resolution: ResolutionString;
  /**
   * Initial bars to start with
   */
  initialBars?: OHLCBar[];
  /**
   * Optional price converter function (e.g., paisa to rupee)
   */
  priceConverter?: (value: number) => number;
  /**
   * Maximum number of bars to keep in memory (for performance)
   * Defaults to 1000
   */
  maxBars?: number;
}

export interface UseLivePriceUpdatesReturn {
  /**
   * Array of price values (close prices from bars) for LineChart
   */
  data: number[];
  /**
   * Array of timestamps (in seconds) for LineChart
   */
  timestamps: number[];
  /**
   * Current last bar (or null)
   */
  lastBar: OHLCBar | null;
  /**
   * Function to update with new live data
   */
  updatePrice: (update: LiveUpdateData) => void;
  /**
   * Function to reset/clear all bars
   */
  reset: () => void;
  /**
   * Function to set initial bars
   */
  setBars: (bars: OHLCBar[]) => void;
}

/**
 * Converts period string to resolution string
 * @param period - Period string (e.g., "1D", "1W", "1M", "YTD")
 * @returns Resolution string
 */
export const periodToResolution = (period: string): ResolutionString => {
  const periodUpper = period.toUpperCase().trim();
  
  if (periodUpper === "1D") return "1"; // 1 minute for 1 day
  if (periodUpper === "1W") return "30"; // 30 minutes for 1 week
  if (periodUpper === "1M") return "30"; // 30 minutes for 1 month
  
  // YTD: dynamic resolution based on days since year start
  if (periodUpper === "YTD") {
    const startOfYearMs = new Date(new Date().getFullYear(), 0, 1).getTime();
    const nowMs = Date.now();
    const daysSinceYearStart = Math.floor(
      (nowMs - startOfYearMs) / (24 * 60 * 60 * 1000)
    );
    const currentMonth = new Date().getMonth();
    const currentDate = new Date().getDate();
    
    if (currentMonth === 0 && currentDate === 1) return "1"; // 1m
    if (currentMonth === 0 && daysSinceYearStart <= 7) return "15"; // 15m
    if (currentMonth === 0) return "60"; // 1h
    if (currentMonth <= 2 || daysSinceYearStart <= 90) return "240"; // 4h
    if (daysSinceYearStart <= 180) return "1440"; // 1d
    return "1440"; // 1d
  }
  
  // Default to 1 minute
  return "1";
};

/**
 * Hook for managing live price updates with TradingView-style bar management
 */
export const useLivePriceUpdates = (
  options: UseLivePriceUpdatesOptions
): UseLivePriceUpdatesReturn => {
  const {
    resolution,
    initialBars = [],
    priceConverter,
    maxBars = 1000,
  } = options;

  const [bars, setBars] = useState<OHLCBar[]>(initialBars);
  const barsRef = useRef<OHLCBar[]>(initialBars);

  // Update ref when bars change
  useEffect(() => {
    barsRef.current = bars;
  }, [bars]);

  // Convert bars to LineChart format (using close prices)
  const { data, timestamps } = bars.reduce<{
    data: number[];
    timestamps: number[];
  }>(
    (acc, bar) => {
      acc.data.push(bar.close);
      acc.timestamps.push(bar.time);
      return acc;
    },
    { data: [], timestamps: [] }
  );

  const updatePrice = useCallback(
    (update: LiveUpdateData) => {
      const currentBars = barsRef.current;
      const lastBar = currentBars.length > 0 ? currentBars[currentBars.length - 1] : null;

      const updatedBar = processLiveUpdate(
        update,
        lastBar,
        resolution,
        priceConverter
      );

      if (!updatedBar) {
        return; // Update was ignored
      }

      setBars((prevBars) => {
        const newBars = [...prevBars];
        const prevLastBar = newBars.length > 0 ? newBars[newBars.length - 1] : null;

        // Check if we're updating the last bar or creating a new one
        if (prevLastBar && updatedBar.time === prevLastBar.time) {
          // Update existing last bar
          newBars[newBars.length - 1] = updatedBar;
        } else {
          // Add new bar
          newBars.push(updatedBar);
          
          // Trim old bars if we exceed maxBars
          if (newBars.length > maxBars) {
            return newBars.slice(-maxBars);
          }
        }

        return newBars;
      });
    },
    [resolution, priceConverter, maxBars]
  );

  const reset = useCallback(() => {
    setBars([]);
    barsRef.current = [];
  }, []);

  const setBarsCallback = useCallback((newBars: OHLCBar[]) => {
    setBars(newBars);
    barsRef.current = newBars;
  }, []);

  const lastBar = bars.length > 0 ? bars[bars.length - 1] : null;

  return {
    data,
    timestamps,
    lastBar,
    updatePrice,
    reset,
    setBars: setBarsCallback,
  };
};
