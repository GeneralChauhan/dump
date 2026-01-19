/**
 * Shared computation functions for LineChart - platform agnostic
 */

import type {
  iMarketHoursRange,
  iFilteredDataResult,
  iProcessMarketHoursDataParams,
} from "../interfaces/ChartData/lineChartData";
import { generateUniformTimestamps } from "../utils/time";

/**
 * COMMENTED OUT:
 * Not used by the RN `LineChart` component anymore.
 * Original implementation preserved below for reference.
 */
// export const findNearestIndex = ({ x, positions }: FindNearestIndexParams): number => {
//   const positionsLength = positions.length;
//
//   if (positionsLength === 0) {
//     return 0;
//   }
//
//   if (x <= positions[0]) {
//     return 0;
//   }
//
//   if (x >= positions[positionsLength - 1]) {
//     return positionsLength - 1;
//   }
//
//   let leftIndex = 0;
//   let rightIndex = positionsLength - 1;
//
//   while (leftIndex <= rightIndex) {
//     const midIndex = (leftIndex + rightIndex) >> 1;
//     const midValue = positions[midIndex];
//
//     if (midValue === x) {
//       return midIndex;
//     }
//
//     if (midValue < x) {
//       leftIndex = midIndex + 1;
//     } else {
//       rightIndex = midIndex - 1;
//     }
//   }
//
//   const leftValue = positions[rightIndex];
//   const rightValue = positions[leftIndex];
//
//   if (leftIndex >= positionsLength) {
//     return rightIndex;
//   }
//
//   if (rightIndex < 0) {
//     return leftIndex;
//   }
//
//   const isLeftCloser = x - leftValue <= rightValue - x;
//   return isLeftCloser ? rightIndex : leftIndex;
// };

/**
 * COMMENTED OUT:
 * Not used by the RN `LineChart` component anymore.
 * Original implementation preserved below for reference.
 */
// export const interpolateY = ({ x, points, xPositions }: InterpolateYParams): number => {
//   const pointsLength = points.length;
//
//   if (pointsLength === 0) {
//     return 0;
//   }
//
//   if (pointsLength === 1) {
//     return points[0]?.y ?? 0;
//   }
//
//   if (x <= xPositions[0]) {
//     return points[0]?.y ?? 0;
//   }
//
//   if (x >= xPositions[pointsLength - 1]) {
//     return points[pointsLength - 1]?.y ?? 0;
//   }
//
//   let leftIndex = 0;
//   let rightIndex = pointsLength - 1;
//
//   while (leftIndex <= rightIndex) {
//     const midIndex = (leftIndex + rightIndex) >> 1;
//     const midValue = xPositions[midIndex];
//
//     if (midValue === x) {
//       return points[midIndex]?.y ?? 0;
//     }
//
//     if (midValue < x) {
//       leftIndex = midIndex + 1;
//     } else {
//       rightIndex = midIndex - 1;
//     }
//   }
//
//   const leftIdx = Math.max(0, Math.min(rightIndex, pointsLength - 1));
//   const rightIdx = Math.max(0, Math.min(leftIndex, pointsLength - 1));
//
//   if (leftIdx === rightIdx) {
//     return points[leftIdx]?.y ?? 0;
//   }
//
//   const x1 = xPositions[leftIdx] ?? 0;
//   const y1 = points[leftIdx]?.y ?? 0;
//   const x2 = xPositions[rightIdx] ?? 0;
//   const y2 = points[rightIdx]?.y ?? 0;
//
//   if (x2 === x1) {
//     return y1;
//   }
//
//   const interpolationFactor = (x - x1) / (x2 - x1);
//   return y1 + interpolationFactor * (y2 - y1);
// };

/**
 * Processes data with market hours filtering
 */
export const processMarketHoursData = ({
  data,
  marketStartTime,
  marketCloseTime,
  timestamps,
  period,
}: iProcessMarketHoursDataParams): iFilteredDataResult => {
  // Market-hours filtering is intended for 1D views. To keep backwards compatibility,
  // we only enforce this rule when `period` is explicitly provided by the caller.
  if (typeof period === "string" && period.length > 0) {
    const p = period.toUpperCase();
    const isOneDay = p === "1D" || p === "ONE_DAY";
    if (!isOneDay) {
      const allIndices = data.map((_, index) => index);
      return {
        filteredData: data,
        filteredIndices: allIndices,
        marketHoursRange: null,
        plottedData: data,
        plottedIndices: allIndices,
      };
    }
  }

  if (!marketStartTime || !marketCloseTime) {
    const allIndices = data.map((_, index) => index);
    return {
      filteredData: data,
      filteredIndices: allIndices,
      marketHoursRange: null,
      plottedData: data,
      plottedIndices: allIndices,
    };
  }

  const startTime =
    (marketStartTime instanceof Date
      ? marketStartTime
      : undefined
    )?.getTime() ?? (typeof marketStartTime === "number" ? marketStartTime : 0);
  const closeTime =
    (marketCloseTime instanceof Date
      ? marketCloseTime
      : undefined
    )?.getTime() ?? (typeof marketCloseTime === "number" ? marketCloseTime : 0);
  const currentTimestamp = Date.now();

  const dataTimestamps =
    timestamps ?? generateUniformTimestamps(data, startTime, closeTime);

  const filteredItems: Array<{
    value: number;
    index: number;
    timestamp: number;
  }> = [];
  data.forEach((value, index) => {
    const timestamp = dataTimestamps[index];
    if (
      timestamp !== undefined &&
      timestamp >= startTime &&
      timestamp <= closeTime
    ) {
      filteredItems.push({ value, index, timestamp });
    }
  });

  const plottedItems: Array<{
    value: number;
    index: number;
    timestamp: number;
  }> = [];
  filteredItems.forEach((item) => {
    if (item.timestamp <= currentTimestamp) {
      plottedItems.push(item);
    }
  });

  const marketHoursRange: iMarketHoursRange = { startTime, closeTime };

  return {
    filteredData: filteredItems.map((item) => item.value),
    filteredIndices: filteredItems.map((item) => item.index),
    marketHoursRange,
    plottedData: plottedItems.map((item) => item.value),
    plottedIndices: plottedItems.map((item) => item.index),
  };
};
