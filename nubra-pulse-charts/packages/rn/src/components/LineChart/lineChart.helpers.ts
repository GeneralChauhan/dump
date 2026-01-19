/**
 * RN-specific helper functions for LineChart component
 * Uses shared computation functions from @pulse/engine
 */

import {
  formatScaledNumber as engineFormatScaledNumber,
  formatTimeLabel as engineFormatTimeLabel,
  processMarketHoursData as engineProcessMarketHoursData,
  type iPoint,
  type iMarketHoursRange,
  type iFilteredDataResult,
} from "@pulse/engine";
import { Skia, PaintStyle } from "@shopify/react-native-skia";
import type {
  iFindNearestIndexParams,
  iInterpolateYParams,
  iFormatTickLabelParams,
  iFormatTimeLabelParams,
  iGenerateUniformTicksParams,
  iFilterYTicksBySpacingParams,
  iCalculateChartDimensionsParams,
  iChartDimensions,
  iChartScalesResult,
} from "./lineChart.types";
import { LINE_CHART_LAYOUT, LINE_CHART_AXIS } from "./lineChart.constants";
import type { LinearScale, TimeScale } from "../../utils/scales";
import { scaleLinear, scaleTime } from "../../utils/scales";
import { line, curveMonotoneX } from "../../utils/pathGenerators";

/**
 * Finds the nearest index - worklet version for RN
 * Must be inline worklet code, cannot call non-worklet functions
 */
export const findNearestIndex = ({
  x,
  positions,
}: iFindNearestIndexParams): number => {
  "worklet";
  const positionsLength = positions.length;

  if (positionsLength === 0) {
    return 0;
  }

  if (x <= positions[0]) {
    return 0;
  }

  if (x >= positions[positionsLength - 1]) {
    return positionsLength - 1;
  }

  let leftIndex = 0;
  let rightIndex = positionsLength - 1;

  while (leftIndex <= rightIndex) {
    const midIndex = (leftIndex + rightIndex) >> 1;
    const midValue = positions[midIndex];

    if (midValue === x) {
      return midIndex;
    }

    if (midValue < x) {
      leftIndex = midIndex + 1;
    } else {
      rightIndex = midIndex - 1;
    }
  }

  const leftValue = positions[rightIndex];
  const rightValue = positions[leftIndex];

  if (leftIndex >= positionsLength) {
    return rightIndex;
  }

  if (rightIndex < 0) {
    return leftIndex;
  }

  const isLeftCloser = x - leftValue <= rightValue - x;
  return isLeftCloser ? rightIndex : leftIndex;
};

/**
 * Interpolates Y value - worklet version for RN
 * Must be inline worklet code, cannot call non-worklet functions
 */
export const interpolateY = ({
  x,
  points,
  xPositions,
}: iInterpolateYParams): number => {
  "worklet";
  const pointsLength = points.length;

  if (pointsLength === 0) {
    return 0;
  }

  if (pointsLength === 1) {
    return points[0]?.y ?? 0;
  }

  if (x <= xPositions[0]) {
    return points[0]?.y ?? 0;
  }

  if (x >= xPositions[pointsLength - 1]) {
    return points[pointsLength - 1]?.y ?? 0;
  }

  let leftIndex = 0;
  let rightIndex = pointsLength - 1;

  while (leftIndex <= rightIndex) {
    const midIndex = (leftIndex + rightIndex) >> 1;
    const midValue = xPositions[midIndex];

    if (midValue === x) {
      return points[midIndex]?.y ?? 0;
    }

    if (midValue < x) {
      leftIndex = midIndex + 1;
    } else {
      rightIndex = midIndex - 1;
    }
  }

  const leftIdx = Math.max(0, Math.min(rightIndex, pointsLength - 1));
  const rightIdx = Math.max(0, Math.min(leftIndex, pointsLength - 1));

  if (leftIdx === rightIdx) {
    return points[leftIdx]?.y ?? 0;
  }

  const x1 = xPositions[leftIdx] ?? 0;
  const y1 = points[leftIdx]?.y ?? 0;
  const x2 = xPositions[rightIdx] ?? 0;
  const y2 = points[rightIdx]?.y ?? 0;

  if (x2 === x1) {
    return y1;
  }

  const interpolationFactor = (x - x1) / (x2 - x1);
  return y1 + interpolationFactor * (y2 - y1);
};

/**
 * Formats a number with appropriate scale (thousands, hundreds, etc.) - uses engine function
 */
export const formatScaledNumber = ({
  value,
}: iFormatTickLabelParams): string => {
  return engineFormatScaledNumber({ value });
};

/**
 * @deprecated Use formatScaledNumber instead. This is kept for backward compatibility.
 */
export const formatTickLabel = ({ value }: iFormatTickLabelParams): string => {
  return formatScaledNumber({ value });
};

/**
 * Formats time label - uses engine function
 */
export const formatTimeLabel = ({
  timestamp,
}: iFormatTimeLabelParams): string => {
  return engineFormatTimeLabel({ timestamp });
};

/**
 * Processes market hours data - uses engine function
 */
export const processMarketHoursData = ({
  data,
  marketStartTime,
  marketCloseTime,
  timestamps,
  period,
}: {
  data: number[];
  marketStartTime?: Date | number;
  marketCloseTime?: Date | number;
  timestamps?: number[];
  period?: string;
}): iFilteredDataResult => {
  const normalizeEpoch = (t?: Date | number): Date | number | undefined => {
    if (t === undefined) return undefined;
    if (t instanceof Date) return t;
    // If a numeric epoch looks like seconds, convert to milliseconds
    return t > 0 && t < 1_000_000_000_000 ? t * 1000 : t;
  };
  return engineProcessMarketHoursData({
    data,
    marketStartTime: normalizeEpoch(marketStartTime),
    marketCloseTime: normalizeEpoch(marketCloseTime),
    timestamps,
    period,
  });
};

/**
 * Generates uniform ticks for a scale - RN specific (uses RN scales)
 */
export const generateUniformTicks = ({
  scale,
  tickCount,
  isYAxis = false,
  actualMin,
  actualMax,
  isTimeScale = false,
  chartHeight,
}: iGenerateUniformTicksParams): number[] => {
  let minValue: number;
  let maxValue: number;

  if (isYAxis && actualMin !== undefined && actualMax !== undefined) {
    minValue = actualMin;
    maxValue = actualMax;
  } else if (isTimeScale) {
    const domain = (scale as TimeScale).domain() as [
      Date | number,
      Date | number,
    ];
    minValue = typeof domain[0] === "number" ? domain[0] : domain[0].getTime();
    maxValue = typeof domain[1] === "number" ? domain[1] : domain[1].getTime();
  } else {
    const domain = (scale as LinearScale).domain() as [number, number];
    [minValue, maxValue] = domain;
  }

  if (minValue === maxValue) {
    return [minValue];
  }

  let maxTicks = tickCount;
  if (isYAxis && chartHeight !== undefined) {
    const minSpacing = LINE_CHART_AXIS.MIN_VERTICAL_SPACING;
    const maxPossibleTicks = Math.floor(chartHeight / minSpacing);
    maxTicks = Math.min(
      tickCount,
      Math.max(
        LINE_CHART_AXIS.MIN_TICK_COUNT,
        Math.min(LINE_CHART_AXIS.MAX_TICK_COUNT, maxPossibleTicks)
      )
    );
  }

  if (maxTicks <= 1) {
    return [minValue, maxValue];
  }

  const step = (maxValue - minValue) / (maxTicks - 1);
  const ticks: number[] = [];

  for (let i = 0; i < maxTicks; i++) {
    ticks.push(minValue + step * i);
  }

  if (ticks[ticks.length - 1] !== maxValue) {
    ticks[ticks.length - 1] = maxValue;
  }

  return ticks;
};

/**
 * Filters Y-axis ticks to ensure minimum vertical spacing - RN specific
 */
export const filterYTicksBySpacing = ({
  ticks,
  scale,
  minVerticalSpacing = LINE_CHART_AXIS.MIN_VERTICAL_SPACING,
}: iFilterYTicksBySpacingParams): number[] => {
  if (ticks.length <= 2) {
    return ticks;
  }

  // Keep spacing *uniform* by selecting every Nth tick based on the base pixel spacing.
  // This avoids irregular gaps caused by greedily comparing only to the previously kept tick.
  let baseSpacing = 0;
  for (let i = 1; i < ticks.length; i++) {
    const prev = ticks[i - 1];
    const cur = ticks[i];
    if (prev === undefined || cur === undefined) continue;
    const dy = Math.abs(scale(prev) - scale(cur));
    if (isFinite(dy) && dy > 0) {
      baseSpacing = dy;
      break;
    }
  }

  if (!isFinite(baseSpacing) || baseSpacing <= 0) {
    return ticks;
  }

  const every = Math.max(1, Math.ceil(minVerticalSpacing / baseSpacing));
  if (every <= 1) {
    return ticks;
  }

  const filtered: number[] = [];
  for (let i = 0; i < ticks.length; i++) {
    const t = ticks[i];
    if (t === undefined) continue;
    const isFirst = i === 0;
    const isLast = i === ticks.length - 1;
    if (isFirst || isLast || i % every === 0) {
      filtered.push(t);
    }
  }

  // Ensure last tick is present and avoid duplicates.
  const last = ticks[ticks.length - 1];
  if (last !== undefined && filtered[filtered.length - 1] !== last) {
    filtered.push(last);
  }

  return filtered;
};

/**
 * Converts a raw step into a "nice" step size (1/2/5 * 10^n).
 * Exported so callers can keep formatting precision consistent with tick generation.
 */
export const makeNiceStep = (step: number): number => {
  const abs = Math.abs(step);
  if (!isFinite(abs) || abs === 0) return 1;
  const magnitude = Math.floor(Math.log10(abs));
  const magnitudeValue = Math.pow(10, magnitude);
  const normalized = abs / magnitudeValue;
  let niceNormalized: number;
  if (normalized <= 1) niceNormalized = 1;
  else if (normalized <= 2) niceNormalized = 2;
  else if (normalized <= 5) niceNormalized = 5;
  else niceNormalized = 10;
  return niceNormalized * magnitudeValue;
};

/**
 * Calculates chart dimensions based on width, height, and axis visibility - RN specific
 */
export const calculateChartDimensions = ({
  width,
  height,
  showXAxis,
  showYAxis,
  yAxisLabelWidth: providedYAxisLabelWidth,
  yAxisPosition = "left",
}: iCalculateChartDimensionsParams & {
  yAxisLabelWidth?: number;
  yAxisPosition?: "left" | "right";
}): iChartDimensions => {
  const xAxisLabelHeight = showXAxis
    ? LINE_CHART_LAYOUT.X_AXIS_LABEL_HEIGHT
    : 0;
  // Use provided label width if available (calculated from actual label widths), otherwise use default
  const yAxisLabelWidth = showYAxis
    ? (providedYAxisLabelWidth ?? LINE_CHART_LAYOUT.Y_AXIS_LABEL_WIDTH)
    : 0;

  // For left-side Y-axis, reserve space on the left; otherwise keep a small baseline offset.
  const paddingLeft =
    yAxisPosition === "left" && showYAxis
      ? yAxisLabelWidth + LINE_CHART_LAYOUT.PADDING_LEFT_OFFSET
      : LINE_CHART_LAYOUT.PADDING_LEFT_OFFSET;
  const paddingBottom = xAxisLabelHeight;

  /**
   * Right-side reserved width:
   * - Always keep a small base padding so the line doesn't hug the edge.
   * - If Y-axis is on the right, additionally reserve space for labels.
   */
  // Reserve exactly the space needed for right-side Y labels (avoid excessive right padding).
  const rightAxisReserved =
    yAxisPosition === "right" && showYAxis
      ? yAxisLabelWidth +
        LINE_CHART_LAYOUT.TICK_MARK_LENGTH +
        LINE_CHART_LAYOUT.PADDING_LEFT_OFFSET
      : 0;
  const chartRightPadding =
    rightAxisReserved + LINE_CHART_LAYOUT.CHART_RIGHT_PADDING_BASE;

  const chartWidth = width - paddingLeft - chartRightPadding;
  const chartHeight = height - paddingBottom;

  return {
    xAxisLabelHeight,
    yAxisLabelWidth,
    paddingLeft,
    paddingBottom,
    chartRightPadding,
    chartWidth,
    chartHeight,
  };
};

/**
 * Gets a "nice" step size for Y-axis ticks
 */
export const getYAxisNiceStep = (
  min: number,
  max: number,
  count: number
): number => {
  if (!isFinite(min) || !isFinite(max) || min === max) return 0;
  const desired = Math.max(2, count);
  const rawStep = (max - min) / (desired - 1);
  return makeNiceStep(rawStep);
};

/**
 * Gets the number of decimal places needed for a step size
 */
export const getDecimalsFromStep = (step: number): number => {
  const abs = Math.abs(step);
  if (!isFinite(abs) || abs === 0) return 0;
  // Ensure adjacent ticks don't collapse to the same rounded label.
  // Example: step=0.8 => decimals=1; step=0.05 => decimals=2.
  const decimals = Math.ceil(-Math.log10(abs + Number.EPSILON));
  return Math.max(0, Math.min(6, decimals));
};

/**
 * Formats a Y-axis tick label with appropriate decimals and k-suffix
 */
export const formatYAxisTickLabel = (value: number, step: number): string => {
  if (!isFinite(value)) return "";
  const useK = Math.abs(value) >= 1000;
  const scaledValue = useK ? value / 1000 : value;
  const scaledStep = useK ? step / 1000 : step;
  const decimals = getDecimalsFromStep(scaledStep);
  return `${scaledValue.toFixed(decimals)}${useK ? "k" : ""}`;
};

/**
 * Extracts X positions from an array of points
 */
export const getXPositions = (points: iPoint[]): number[] => {
  return points.map((point: iPoint) => point.x ?? 0);
};

/**
 * Creates a dash paint for tooltip vertical line
 */
export const getDashPaint = (tooltipBorderColor: string) => {
  const paint = Skia.Paint();
  paint.setStyle(PaintStyle.Stroke);
  paint.setStrokeWidth(0.5);
  paint.setColor(Skia.Color(tooltipBorderColor));
  paint.setPathEffect(
    Skia.PathEffect.MakeDash(
      LINE_CHART_AXIS.DASH_PATTERN,
      LINE_CHART_AXIS.DASH_OFFSET
    )
  );
  return paint;
};

/**
 * Creates a closed area path from a line path by closing it at the bottom
 * The path goes: line path -> bottom-right -> bottom-left -> back to start
 */
export const createAreaPath = (
  linePath: string,
  chartHeight: number,
  chartWidth: number
): string => {
  if (!linePath || linePath.trim() === "") {
    return "";
  }

  // Parse the line path to get the first and last points
  const commands = linePath.match(/[ML][\d.]+(?:,[\d.]+)?/g) || [];
  if (commands.length === 0) {
    return "";
  }

  // Extract first point
  const firstCommand = commands[0];
  const firstMatch = firstCommand?.match(/[\d.]+/g);
  if (!firstMatch || firstMatch.length < 2) {
    return "";
  }
  const firstX = parseFloat(firstMatch[0] ?? "0");
  const firstY = parseFloat(firstMatch[1] ?? "0");

  // Extract last point
  const lastCommand = commands[commands.length - 1];
  const lastMatch = lastCommand.match(/[\d.]+/g);
  if (!lastMatch || lastMatch.length < 2) {
    return "";
  }
  const lastX = parseFloat(lastMatch[0] ?? "0");
  const lastY = parseFloat(lastMatch[1] ?? "0");

  // Account for bottom padding
  const bottomY = chartHeight - LINE_CHART_AXIS.BOTTOM_PADDING;

  // Create closed path: line path -> bottom-right -> bottom-left -> close
  return `${linePath} L${lastX},${bottomY} L${firstX},${bottomY} Z`;
};

/**
 * Computes chart scales, path, points, and ticks - RN specific computation
 */
export const computeChartScales = (params: {
  filteredData: number[];
  plottedData: number[];
  plottedIndices: number[];
  marketHoursRange: iMarketHoursRange | null;
  chartWidth: number;
  chartHeight: number;
  chartRightPadding: number;
  timestamps?: number[];
  data: number[];
  xTickCount: number;
  yTickCount: number;
  showXAxis: boolean;
  showYAxis: boolean;
  period?: string;
  lowerCircuit?: number;
  upperCircuit?: number;
}): iChartScalesResult => {
  const {
    filteredData,
    plottedData,
    plottedIndices,
    marketHoursRange,
    chartWidth,
    chartHeight,
    // `chartRightPadding` is accepted for backwards compatibility but currently unused.
    timestamps,
    data,
    xTickCount,
    yTickCount,
    showXAxis,
    showYAxis,
    period,
    lowerCircuit,
    upperCircuit,
  } = params;
  if (filteredData.length === 0) {
    return {
      path: "",
      points: [],
      xScale: scaleLinear(),
      yScale: scaleLinear(),
      xTicks: [],
      yTicks: [],
    };
  }

  // Y scale is shared across all X-scale modes; initialize it before any early returns.
  const yScale = scaleLinear();
  const dataMin = Math.min(...filteredData);
  const dataMax = Math.max(...filteredData);

  // Calculate Y-domain with special handling for 1D period with circuit limits
  let yDomain: [number, number];
  if (
    period === "ONE_DAY" &&
    typeof lowerCircuit === "number" &&
    typeof upperCircuit === "number"
  ) {
    // For 1D period with circuit limits: ensure all data fits within bounds
    const minVal = Math.min(lowerCircuit, dataMin);
    const maxVal = Math.max(upperCircuit, dataMax);
    yDomain = [minVal, maxVal];
  } else {
    // For other periods: use min/max of actual data
    yDomain = [dataMin, dataMax];
  }

  // If all values are equal, widen domain slightly to avoid flatline division by zero.
  if (yDomain[0] === yDomain[1]) {
    const v = yDomain[0];
    yDomain = [v - 1, v + 1];
  }

  // Expand the top of the domain to leave some visual headroom above the max value.
  // Then generate Y ticks such that:
  // - first tick is the domain minimum
  // - exactly `yTickCount` ticks are produced
  // - ticks are uniformly spaced
  const desiredYTicks = Math.max(2, yTickCount);
  const yMin = yDomain[0];
  const yMax = yDomain[1];
  const range = yMax - yMin;
  const targetMax =
    isFinite(range) && range > 0
      ? yMax + range * LINE_CHART_AXIS.Y_HEADROOM_RATIO
      : yMax;
  const step = makeNiceStep((targetMax - yMin) / (desiredYTicks - 1));
  const domainMax =
    isFinite(step) && step > 0 ? yMin + step * (desiredYTicks - 1) : yMax;

  yScale.domain([yMin, domainMax]);
  yScale.range([
    chartHeight - LINE_CHART_AXIS.BOTTOM_PADDING,
    LINE_CHART_AXIS.TOP_PADDING,
  ]);
  // Important: don't call `nice()` here. It expands the domain and creates extra empty space
  // between the min data point and the X-axis, which makes the chart look "floating".

  // const hasTimestamps = !!timestamps && timestamps.length > 0; // unused
  // "Time scale" here refers to market-hours continuous time. For epoch timestamps we compress gaps,
  // so we intentionally use index-based spacing (linear scale) while still labeling with timestamps.
  const periodKey = typeof period === "string" ? period.toUpperCase() : "";
  const isOneDayPeriod = periodKey === "ONE_DAY" || periodKey === "1D";
  const isMarketHoursScale = isOneDayPeriod && marketHoursRange !== null;
  let xScale: LinearScale | TimeScale;

  if (isMarketHoursScale && plottedData.length > 0) {
    xScale = scaleTime();
    const { startTime, closeTime } = marketHoursRange ?? {
      startTime: 0,
      closeTime: 0,
    };
    xScale.domain([startTime, closeTime]);
    xScale.range([0, chartWidth]);
  } else {
    // Epoch timestamps and non-time series both use index-based spacing (compress gaps).
    xScale = scaleLinear();
    // X domain should represent the actually plotted series length.
    xScale.domain([0, Math.max(0, plottedData.length - 1)]);
    xScale.range([0, chartWidth]);
  }

  const points: iPoint[] = plottedData.map(
    (dataValue: number, index: number) => {
      let xValue: number;
      if (isMarketHoursScale && marketHoursRange) {
        const originalIndex = plottedIndices[index];
        const ts =
          typeof originalIndex === "number"
            ? timestamps?.[originalIndex]
            : undefined;
        // Prefer real timestamps so "market open" shows empty space to the right until close.
        if (typeof ts === "number" && !isNaN(ts)) {
          xValue = (xScale as TimeScale)(ts);
        } else {
          const totalDuration =
            marketHoursRange.closeTime - marketHoursRange.startTime;
          const interval =
            data.length > 1 ? totalDuration / (data.length - 1) : 0;
          const fallbackTs =
            marketHoursRange.startTime + (originalIndex ?? 0) * interval;
          xValue = (xScale as TimeScale)(fallbackTs);
        }
      } else {
        xValue = (xScale as LinearScale)(index);
      }
      return { x: xValue, y: yScale(dataValue) };
    }
  );

  const lineGenerator = line<number>();
  if (isMarketHoursScale && marketHoursRange) {
    lineGenerator.x((_dataValue: number, index: number) => {
      const originalIndex = plottedIndices[index];
      const ts =
        typeof originalIndex === "number"
          ? timestamps?.[originalIndex]
          : undefined;
      if (typeof ts === "number" && !isNaN(ts)) {
        return (xScale as TimeScale)(ts);
      }
      const totalDuration =
        marketHoursRange.closeTime - marketHoursRange.startTime;
      const interval = data.length > 1 ? totalDuration / (data.length - 1) : 0;
      const fallbackTs =
        marketHoursRange.startTime + (originalIndex ?? 0) * interval;
      return (xScale as TimeScale)(fallbackTs);
    });
  } else {
    lineGenerator.x((_dataValue: number, index: number) =>
      (xScale as LinearScale)(index)
    );
  }
  lineGenerator.y((dataValue: number) => yScale(dataValue));
  lineGenerator.curve(curveMonotoneX);

  const generatedXTicks = showXAxis
    ? generateUniformTicks({
        scale: xScale,
        tickCount: xTickCount,
        isYAxis: false,
        isTimeScale: isMarketHoursScale,
      })
    : [];

  const rawYTicks = (() => {
    if (!showYAxis) return [];
    if (!isFinite(yMin) || !isFinite(domainMax)) return [];
    if (!isFinite(step) || step <= 0) return [yMin, domainMax];
    const ticks: number[] = [];
    for (let i = 0; i < desiredYTicks; i++) {
      const v =
        i === 0 ? yMin : i === desiredYTicks - 1 ? domainMax : yMin + step * i;
      // Stabilize floating-point output without altering the anchored endpoints.
      const safe = Math.round(v * 1e12) / 1e12;
      ticks.push(safe);
    }
    return ticks;
  })();

  const pathString = lineGenerator(plottedData) ?? "";

  return {
    path: pathString,
    points,
    xScale,
    yScale,
    xTicks: generatedXTicks,
    yTicks: rawYTicks,
  };
};
