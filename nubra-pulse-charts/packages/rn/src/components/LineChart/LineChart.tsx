import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Canvas,
  Path,
  Circle,
  Text as SkiaText,
  Group,
  Skia,
  LinearGradient,
  vec,
  PaintStyle,
} from "@shopify/react-native-skia";
import { useFont } from "@shopify/react-native-skia";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  withSpring,
  withRepeat,
  cancelAnimation,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import type { LinearScale } from "../../utils/scales";
// import type { TimeScale } from "../utils/scales"; // unused by LineChart
import { interpolatePath } from "../../utils/pathInterpolation";
import {
  LINE_CHART_DEFAULTS,
  LINE_CHART_LAYOUT,
  LINE_CHART_ANIMATION,
  LINE_CHART_PULSE,
  LINE_CHART_TOOLTIP,
  LINE_CHART_GESTURE,
  LINE_CHART_AXIS,
  LINE_CHART_GRID,
  TIME_FORMATS,
} from "./lineChart.constants";
import { getTheme, type ThemeMode } from "@pulse/engine";
import {
  findNearestIndex,
  interpolateY,
  formatScaledNumber,
  formatTimeLabel,
  makeNiceStep,
  processMarketHoursData,
  calculateChartDimensions,
  computeChartScales,
  getYAxisNiceStep,
  getDecimalsFromStep,
  formatYAxisTickLabel,
  getXPositions,
  getDashPaint,
  createAreaPath,
} from "./lineChart.helpers";
import {
  processChartData,
  computeTimeDomain,
} from "./lineChart.dataProcessing";
import { isMarketOpen } from "./lineChart.marketHours";
import { calculateTooltipWidth } from "./lineChart.tooltip";
import {
  createPathFrames,
  PATH_MORPH_ANIMATION,
  PATH_DRAW_ANIMATION,
} from "./lineChart.animations";
import type {
  iLineChartProps,
  iPoint,
  // ChartScalesResult, // unused by LineChart
  iTooltipData,
  iTooltipElements,
  // TimePeriod, // unused by LineChart (re-exported below)
} from "./lineChart.types";

// Re-export types for backward compatibility
export type { iLineChartProps, iTimePeriod } from "./lineChart.types";

const LineChart: React.FC<iLineChartProps> = (
  props: iLineChartProps
): JSX.Element => {
  // 📌 Props Destructuring with Defaults
  const {
    data = [],
    width,
    height,
    theme = "light",
    color,
    strokeWidth,
    persistHighlight = LINE_CHART_DEFAULTS.PERSIST_HIGHLIGHT,
    lineProps = {},
    circleProps = {},
    labels = [],
    onLabelPress,
    labelContainerStyle,
    labelTextStyle,
    selectedLabelTextStyle,
    showXAxis = LINE_CHART_DEFAULTS.SHOW_X_AXIS,
    showYAxis = LINE_CHART_DEFAULTS.SHOW_Y_AXIS,
    xTickCount = LINE_CHART_DEFAULTS.X_TICK_COUNT,
    yTickCount = LINE_CHART_DEFAULTS.Y_TICK_COUNT,
    axisProps = {},
    axisLabelProps = {},
    fontSource,
    animate = false,
    showTooltip = LINE_CHART_DEFAULTS.SHOW_TOOLTIP,
    tooltipPosition = LINE_CHART_DEFAULTS.TOOLTIP_POSITION,
    tooltipBackgroundColor,
    tooltipBorderColor,
    tooltipTextColor,
    tooltipSecondaryTextColor,
    marketStartTime,
    marketCloseTime,
    isMarketOpen: isMarketOpenProp,
    showPulseIndicator = true,
    timestamps,
    period,
    lowerCircuit,
    upperCircuit,
    yAxisPosition = "left",
    showArea = false,
    showTooltipCircle = true,
    showGridLines = false,
  } = props;

  // Get theme values
  const chartTheme = getTheme(theme);

  // Apply theme defaults, but allow props to override
  const lineColor = color ?? chartTheme.lineColor;
  const lineStrokeWidth = strokeWidth ?? chartTheme.strokeWidth;
  const tooltipBgColor =
    tooltipBackgroundColor ?? chartTheme.tooltipBackgroundColor;
  const tooltipBdColor = tooltipBorderColor ?? chartTheme.tooltipBorderColor;
  const tooltipTxtColor = tooltipTextColor ?? chartTheme.tooltipTextColor;
  const tooltipSecTxtColor =
    tooltipSecondaryTextColor ?? chartTheme.tooltipSecondaryTextColor;
  const axisColor = axisProps.color ?? chartTheme.axisColor;
  const axisLabelColor = axisLabelProps.color ?? chartTheme.axisLabelColor;

  const periodKey = typeof period === "string" ? period.toUpperCase() : "";
  const isOneDayPeriod = periodKey === "ONE_DAY" || periodKey === "1D";

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const font = useFont(fontSource, LINE_CHART_DEFAULTS.FONT_SIZE);
  // Fallback font ensures axis labels render immediately (and avoids layout jitter
  // caused by waiting for async custom font loading).
  const fallbackFont = useMemo(() => {
    try {
      // Skia's default typeface helper isn't always present in the TS types.
      // At runtime (RN Skia), a default typeface is available; we guard defensively.
      const typeface = (Skia as any).Typeface?.MakeDefault?.();
      return typeface
        ? Skia.Font(typeface, LINE_CHART_DEFAULTS.FONT_SIZE)
        : null;
    } catch {
      return null;
    }
  }, []);

  // Use a stable font for layout measurements so the plot doesn't "shift" when a custom font loads.
  const layoutFont = fallbackFont ?? font ?? null;
  // Use the best available font for actual rendering.
  const renderFont = font ?? fallbackFont ?? null;
  // Smaller font for date text in tooltip
  const dateFont = useMemo(() => {
    if (!font && !fallbackFont) return null;
    try {
      const typeface = font
        ? ((font as any).getTypeface?.() ?? null)
        : (Skia as any).Typeface?.MakeDefault?.();
      if (!typeface) return renderFont;
      return Skia.Font(typeface, LINE_CHART_DEFAULTS.FONT_SIZE - 1); // 1px smaller
    } catch {
      return renderFont;
    }
  }, [font, fallbackFont, renderFont]);

  // Larger, bolder font for value text in tooltip
  const valueFont = useMemo(() => {
    if (!font && !fallbackFont) return null;
    try {
      const typeface = font
        ? ((font as any).getTypeface?.() ?? null)
        : (Skia as any).Typeface?.MakeDefault?.();
      if (!typeface) return renderFont;
      // Make it significantly larger (4px bigger than default, 5px bigger than date font)
      // The larger size will make it appear bolder
      const valueFontInstance = Skia.Font(
        typeface,
        LINE_CHART_DEFAULTS.FONT_SIZE + 4
      );
      return valueFontInstance;
    } catch {
      return renderFont;
    }
  }, [font, fallbackFont, renderFont]);
  const pathRef = useRef<string>("");
  const framesRef = useRef<string[]>([]);
  const areaFramesRef = useRef<string[]>([]);

  const morphT = useSharedValue(1);
  const framesSV = useSharedValue<string[]>([]);
  const areaFramesSV = useSharedValue<string[]>([]);
  const progress = useSharedValue(0);
  const pulseFrac = useSharedValue(0);
  const circleX = useSharedValue(0);
  const circleY = useSharedValue(0);
  const nearestIdx = useSharedValue(0);
  const showTooltipSV = useSharedValue(false);
  const smoothTooltipX = useSharedValue(0);
  const smoothCircleY = useSharedValue(0);
  const [animationEnded, setAnimationEnded] = useState(false);

  // Calculate Y-axis label width estimate from data range (before processing)
  const estimatedYAxisLabelWidth = useMemo(() => {
    if (!showYAxis || !layoutFont || data.length === 0) {
      return LINE_CHART_LAYOUT.Y_AXIS_LABEL_WIDTH;
    }

    // Estimate label width from min/max values in the data
    const dataMin = Math.min(...data);
    const dataMax = Math.max(...data);

    // Format both min and the *top tick* (with headroom) to get maximum label width.
    const range = dataMax - dataMin;
    const targetMax =
      isFinite(range) && range > 0
        ? dataMax + range * LINE_CHART_AXIS.Y_HEADROOM_RATIO
        : dataMax;
    const yStep = getYAxisNiceStep(dataMin, targetMax, yTickCount);
    const topTick =
      isFinite(yStep) && yStep > 0
        ? dataMin + yStep * (Math.max(2, yTickCount) - 1)
        : dataMax;
    const minLabel = formatYAxisTickLabel(dataMin, yStep);
    const maxLabel = formatYAxisTickLabel(topTick, yStep);

    const minWidth = layoutFont.measureText(minLabel).width;
    const maxWidth = layoutFont.measureText(maxLabel).width;
    const estimatedWidth = Math.max(minWidth, maxWidth);

    // Keep this as the raw label width estimate; layout offsets are applied in `calculateChartDimensions()`.
    // Add a small safety buffer so text never clips at the edge.
    return Math.ceil(
      Math.max(estimatedWidth, LINE_CHART_LAYOUT.Y_AXIS_LABEL_WIDTH) + 4
    );
  }, [showYAxis, layoutFont, data, yTickCount]);

  // Prevent left/right "shifts" when the duration/data changes: reserve at least the maximum
  // Y-axis label width we've seen for this chart instance (never shrink).
  const yAxisLabelWidthRef = useRef<number>(
    LINE_CHART_LAYOUT.Y_AXIS_LABEL_WIDTH
  );
  const yAxisLabelWidthForLayout = useMemo(() => {
    if (!showYAxis) return 0;
    const next = Math.max(
      yAxisLabelWidthRef.current,
      estimatedYAxisLabelWidth || 0
    );
    yAxisLabelWidthRef.current = next;
    return next;
  }, [showYAxis, estimatedYAxisLabelWidth]);

  const chartDimensions = useMemo(
    () =>
      calculateChartDimensions({
        width,
        height,
        showXAxis,
        showYAxis,
        yAxisLabelWidth: yAxisLabelWidthForLayout,
        yAxisPosition,
      }),
    [
      width,
      height,
      showXAxis,
      showYAxis,
      yAxisLabelWidthForLayout,
      yAxisPosition,
    ]
  );

  const {
    xAxisLabelHeight,
    // yAxisLabelWidth, // unused by LineChart
    paddingLeft,
    // paddingBottom, // unused by LineChart
    chartRightPadding,
    chartWidth,
    chartHeight,
  } = chartDimensions;

  // Transform data for plotting: normalize timestamps, bucket by periodicity, compress gaps.
  const { sampledData, sampledTimestamps } = useMemo(
    () => processChartData(data, timestamps, period),
    [data, period, timestamps]
  );

  const processedData = useMemo(
    () =>
      processMarketHoursData({
        data: sampledData,
        // Engine will apply market-hours filtering only for 1D when `period` is provided.
        marketStartTime,
        marketCloseTime,
        timestamps: sampledTimestamps,
        period: typeof period === "string" ? period : undefined,
      }),
    [sampledData, marketStartTime, marketCloseTime, sampledTimestamps, period]
  );

  const {
    filteredData,
    filteredIndices,
    marketHoursRange,
    plottedData,
    plottedIndices,
  } = processedData;

  const chartScales = useMemo(
    () =>
      computeChartScales({
        filteredData,
        plottedData,
        plottedIndices,
        marketHoursRange,
        chartWidth,
        chartHeight,
        chartRightPadding,
        timestamps: sampledTimestamps,
        data: sampledData,
        xTickCount,
        yTickCount,
        showXAxis,
        showYAxis,
        period,
        lowerCircuit,
        upperCircuit,
      }),
    [
      plottedData,
      plottedIndices,
      filteredData,
      filteredIndices,
      marketHoursRange,
      chartWidth,
      chartHeight,
      sampledTimestamps,
      sampledData,
      xTickCount,
      yTickCount,
      showXAxis,
      showYAxis,
      chartRightPadding,
      period,
      lowerCircuit,
      upperCircuit,
    ]
  );

  const { path, points, xScale, yScale, xTicks, yTicks } = chartScales;

  const yTickStep = useMemo(() => {
    if (yTicks.length >= 2) {
      return Math.abs((yTicks[1] ?? 0) - (yTicks[0] ?? 0));
    }
    const domain =
      typeof (yScale as unknown as { domain?: () => unknown }).domain ===
      "function"
        ? ((yScale as unknown as { domain: () => unknown }).domain() as unknown)
        : null;
    if (
      Array.isArray(domain) &&
      domain.length === 2 &&
      typeof domain[0] === "number" &&
      typeof domain[1] === "number"
    ) {
      return getYAxisNiceStep(domain[0], domain[1], yTickCount);
    }
    return 0;
  }, [yTicks, yScale, yTickCount]);

  const xPositions = useMemo(() => getXPositions(points), [points]);

  const dashPaint = useMemo(
    () => getDashPaint(tooltipBdColor),
    [tooltipBdColor]
  );

  // Create grid paint for grid lines
  const gridPaint = useMemo(() => {
    const paint = Skia.Paint();
    paint.setStyle(PaintStyle.Stroke);
    paint.setStrokeWidth(LINE_CHART_GRID.STROKE_WIDTH);
    paint.setColor(Skia.Color(axisColor));
    paint.setAlphaf(LINE_CHART_GRID.OPACITY);
    paint.setPathEffect(
      Skia.PathEffect.MakeDash(
        LINE_CHART_GRID.DASH_PATTERN,
        LINE_CHART_AXIS.DASH_OFFSET
      )
    );
    return paint;
  }, [axisColor]);

  // Helper function to convert color to rgba with opacity
  const colorToRgba = useMemo(() => {
    return (color: string, opacity: number): string => {
      // Handle hex colors
      if (color.startsWith("#")) {
        const hex = color.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      // Handle rgb/rgba colors
      if (color.startsWith("rgb")) {
        const match = color.match(/\d+/g);
        if (match && match.length >= 3) {
          const r = parseInt(match[0] ?? "0", 10);
          const g = parseInt(match[1] ?? "0", 10);
          const b = parseInt(match[2] ?? "0", 10);
          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
      }
      // Fallback: return color as-is (may not work for all color formats)
      return color;
    };
  }, []);

  // Create area path for gradient fill
  const areaPath = useMemo(() => {
    if (!showArea || !path) {
      return "";
    }
    return createAreaPath(path, chartHeight, chartWidth);
  }, [showArea, path, chartHeight, chartWidth]);

  // Animated area path for morphing (uses pre-computed area frames)
  const animatedAreaPath = useDerivedValue((): string => {
    "worklet";
    if (!showArea) {
      return "";
    }
    const frames = areaFramesSV.value;
    const morphTValue = morphT.value;

    if (!frames || frames.length === 0) {
      return "";
    }

    const framesLength = frames.length;
    const frameIndex = Math.min(
      framesLength - 1,
      Math.max(0, Math.floor(morphTValue * (framesLength - 1)))
    );

    return frames[frameIndex] ?? "";
  });

  const timeDomain = useMemo(
    () => computeTimeDomain(sampledTimestamps),
    [sampledTimestamps]
  );

  const tooltipFixedWidth = useMemo(
    () =>
      calculateTooltipWidth(
        layoutFont,
        filteredData,
        marketHoursRange,
        timestamps
      ),
    [layoutFont, filteredData, marketHoursRange, timestamps]
  );

  useEffect(() => {
    const oldPath = pathRef.current ?? "";
    const newPath = path ?? "";
    pathRef.current = newPath;

    // Default: no animation (faster render, no initial draw/morph).
    if (!animate) {
      framesRef.current = newPath ? [newPath] : [];
      framesSV.value = framesRef.current;
      if (showArea) {
        const newAreaPath = createAreaPath(newPath, chartHeight, chartWidth);
        areaFramesRef.current = newAreaPath ? [newAreaPath] : [];
        areaFramesSV.value = areaFramesRef.current;
      } else {
        areaFramesRef.current = [];
        areaFramesSV.value = [];
      }
      morphT.value = 1;
      progress.value = 1;
      setAnimationEnded(true);
      return;
    }

    const frames = createPathFrames(
      oldPath,
      newPath,
      LINE_CHART_ANIMATION.FRAME_COUNT,
      interpolatePath
    );

    framesRef.current = frames;
    framesSV.value = frames;

    // Create area path frames if showArea is enabled
    if (showArea) {
      const oldAreaPath = createAreaPath(oldPath, chartHeight, chartWidth);
      const newAreaPath = createAreaPath(newPath, chartHeight, chartWidth);
      const areaFrames = createPathFrames(
        oldAreaPath,
        newAreaPath,
        LINE_CHART_ANIMATION.FRAME_COUNT,
        interpolatePath
      );
      areaFramesRef.current = areaFrames;
      areaFramesSV.value = areaFrames;
    } else {
      areaFramesRef.current = [];
      areaFramesSV.value = [];
    }

    morphT.value = 0;
    morphT.value = withTiming(1, PATH_MORPH_ANIMATION);
    progress.value = withTiming(1, PATH_DRAW_ANIMATION);

    // Gate "live" indicator until the draw animation has completed.
    setAnimationEnded(false);
    const t = setTimeout(() => {
      setAnimationEnded(true);
    }, LINE_CHART_ANIMATION.PROGRESS_DURATION);
    return () => clearTimeout(t);
  }, [
    animate,
    data,
    framesSV,
    areaFramesSV,
    morphT,
    path,
    progress,
    showArea,
    chartHeight,
    chartWidth,
  ]);

  const lastPoint = useMemo(() => {
    if (!points || points.length === 0) return null;
    const p = points[points.length - 1];
    if (!p) return null;
    const x = (p.x ?? 0) + paddingLeft;
    const y = p.y ?? 0;
    return { x, y };
  }, [points, paddingLeft]);

  const isMarketOpenNow = useMemo(
    () =>
      isMarketOpen(
        isOneDayPeriod,
        isMarketOpenProp,
        marketStartTime,
        marketCloseTime
      ),
    [isOneDayPeriod, isMarketOpenProp, marketStartTime, marketCloseTime]
  );

  const shouldPulseIndicator =
    showPulseIndicator &&
    isOneDayPeriod &&
    animationEnded &&
    isMarketOpenNow &&
    !!lastPoint &&
    selectedIndex === null;

  useEffect(() => {
    if (!shouldPulseIndicator) {
      cancelAnimation(pulseFrac);
      pulseFrac.value = 0;
      return;
    }

    pulseFrac.value = 0;
    pulseFrac.value = withRepeat(
      withTiming(1, {
        duration: LINE_CHART_ANIMATION.PULSE_DURATION,
        easing: Easing.out(Easing.quad),
      }),
      -1,
      true
    );

    return () => {
      cancelAnimation(pulseFrac);
    };
  }, [shouldPulseIndicator, pulseFrac]);

  const pulseR = useDerivedValue(() => {
    return (
      LINE_CHART_PULSE.MIN_RADIUS +
      pulseFrac.value *
        (LINE_CHART_PULSE.MAX_RADIUS - LINE_CHART_PULSE.MIN_RADIUS)
    );
  });
  const pulseOp = useDerivedValue(() => 1 - pulseFrac.value);

  const animatedPath = useDerivedValue((): string => {
    "worklet";
    const frames = framesSV.value;
    const morphTValue = morphT.value;

    if (!frames || frames.length === 0) {
      return "";
    }

    const framesLength = frames.length;
    const frameIndex = Math.min(
      framesLength - 1,
      Math.max(0, Math.floor(morphTValue * (framesLength - 1)))
    );

    return frames[frameIndex] ?? "";
  });

  const trimEnd = useDerivedValue((): number => {
    return progress.value;
  });

  const tooltipData = useDerivedValue((): iTooltipData | null => {
    "worklet";
    const isTooltipVisible = showTooltipSV.value;
    const currentNearestIdx = nearestIdx.value;
    const plottedDataLength = plottedData.length;

    if (
      !isTooltipVisible ||
      currentNearestIdx < 0 ||
      currentNearestIdx >= plottedDataLength
    ) {
      return null;
    }

    const currentIndex = currentNearestIdx;
    const dataValue = plottedData[currentIndex];

    if (dataValue === undefined || dataValue === null || isNaN(dataValue)) {
      return null;
    }

    let xAxisValue: number | null = null;
    if (sampledTimestamps && sampledTimestamps.length > 0) {
      const originalIndex = plottedIndices[currentIndex];
      xAxisValue = sampledTimestamps[originalIndex] ?? null;
    } else if (marketHoursRange) {
      const totalDuration =
        marketHoursRange.closeTime - marketHoursRange.startTime;
      const interval =
        sampledData.length > 1 ? totalDuration / (sampledData.length - 1) : 0;
      const originalIndex = plottedIndices[currentIndex];
      xAxisValue = marketHoursRange.startTime + originalIndex * interval;
    } else {
      xAxisValue = currentIndex;
    }

    const currentTooltipX = smoothTooltipX.value;

    return {
      x: currentTooltipX,
      value: dataValue,
      xValue: xAxisValue,
      selectedIndex: currentIndex,
    };
  });

  const tooltipElements = useDerivedValue<iTooltipElements | null>(
    (): iTooltipElements | null => {
      "worklet";
      const tooltipDataValue = tooltipData.value;

      if (!tooltipDataValue) {
        return null;
      }

      const {
        x: tooltipXPosition,
        value: tooltipValue,
        xValue: tooltipXValue,
      } = tooltipDataValue;

      let formattedValueString: string;
      try {
        formattedValueString = new Intl.NumberFormat("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(tooltipValue);
      } catch {
        formattedValueString =
          typeof tooltipValue === "number" && !isNaN(tooltipValue)
            ? tooltipValue.toFixed(2)
            : "0.00";
      }

      let formattedXValueString: string;
      const looksLikeEpochMs =
        typeof tooltipXValue === "number" && tooltipXValue > 1_000_000_000_000;

      if (tooltipXValue !== null && (marketHoursRange || looksLikeEpochMs)) {
        const date = new Date(tooltipXValue);
        // If this is an epoch timestamp (non-1D), include date to avoid ambiguity.
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const monthStr = months[date.getMonth()] ?? "";
        const dayStr = String(date.getDate()).padStart(2, "0");
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const isPM = hours >= TIME_FORMATS.AM_PM_THRESHOLD;
        const ampm = isPM ? "PM" : "AM";
        hours = hours % TIME_FORMATS.HOURS_IN_DAY;
        hours = hours ? hours : TIME_FORMATS.HOURS_IN_DAY;
        const minutesString =
          minutes < TIME_FORMATS.MINUTES_PADDING
            ? `0${minutes}`
            : minutes.toString();
        const timeStr =
          minutes === 0
            ? `${hours} ${ampm}`
            : `${hours}:${minutesString} ${ampm}`;

        // Check if period is 1 week or 1 month - show both date and time
        const isOneWeekOrMonth =
          periodKey === "ONE_WEEK" ||
          periodKey === "1W" ||
          periodKey === "ONE_MONTH" ||
          periodKey === "1M";

        if (isOneWeekOrMonth) {
          // Show both date and time for 1 week and 1 month periods
          formattedXValueString = `${monthStr}, ${dayStr} ${timeStr}`;
        } else if (looksLikeEpochMs) {
          // For other non-1D periods, show date only
          formattedXValueString = `${monthStr}, ${dayStr}`;
        } else {
          // For 1D (market hours), show time only
          formattedXValueString = timeStr;
        }
      } else if (tooltipXValue !== null) {
        formattedXValueString = String(Math.round(tooltipXValue));
      } else {
        formattedXValueString = "";
      }

      // Calculate width with "Sales: " prefix
      // const valueWithPrefix = `${LINE_CHART_TOOLTIP.VALUE_PREFIX}${formattedValueString}`;
      const valueWithPrefix = formattedValueString;
      const calculatedPriceWidth = layoutFont
        ? layoutFont.measureText(valueWithPrefix).width
        : 60;
      const calculatedXValueWidth = layoutFont
        ? layoutFont.measureText(formattedXValueString).width
        : 60;
      // Account for circle width (radius * 2) + spacing
      const circleWidth = LINE_CHART_TOOLTIP.CIRCLE_RADIUS * 2 + 6; // 6px spacing
      const maxContentWidth = Math.max(
        calculatedPriceWidth + circleWidth,
        calculatedXValueWidth
      );
      const calculatedTooltipWidth = layoutFont
        ? Math.max(
            tooltipFixedWidth,
            maxContentWidth + LINE_CHART_TOOLTIP.PADDING * 2
          )
        : LINE_CHART_TOOLTIP.DEFAULT_WIDTH;

      let calculatedTooltipX = tooltipXPosition - calculatedTooltipWidth / 2;
      const maxTooltipX = width - calculatedTooltipWidth;
      calculatedTooltipX =
        calculatedTooltipX < 0
          ? 0
          : calculatedTooltipX > maxTooltipX
            ? maxTooltipX
            : calculatedTooltipX;

      let calculatedTooltipY: number;
      switch (tooltipPosition) {
        case "center":
          calculatedTooltipY = (chartHeight - LINE_CHART_TOOLTIP.HEIGHT) / 2;
          break;
        case "bottom":
          calculatedTooltipY =
            chartHeight -
            LINE_CHART_TOOLTIP.HEIGHT -
            LINE_CHART_TOOLTIP.VERTICAL_OFFSET;
          break;
        case "top":
        default:
          calculatedTooltipY = LINE_CHART_TOOLTIP.VERTICAL_OFFSET;
          break;
      }

      return {
        x: tooltipXPosition,
        tooltipX: calculatedTooltipX,
        tooltipY: calculatedTooltipY,
        tooltipWidth: calculatedTooltipWidth,
        tooltipHeight: LINE_CHART_TOOLTIP.HEIGHT,
        tooltipRadius: LINE_CHART_TOOLTIP.RADIUS,
        valueStr: formattedValueString,
        valueStrWithPrefix: valueWithPrefix,
        xValueStr: formattedXValueString,
        priceWidth: calculatedPriceWidth,
        xValueWidth: calculatedXValueWidth,
      };
    }
  );

  const tooltipVerticalLinePath = useDerivedValue<string>((): string => {
    "worklet";
    const isTooltipVisible = showTooltipSV.value;
    const tooltipDataValue = tooltipData.value;

    if (!isTooltipVisible || !tooltipDataValue) {
      return "";
    }

    const currentTooltipX = smoothTooltipX.value;
    const tooltipElementsValue = tooltipElements.value;

    if (!tooltipElementsValue) {
      return `M${currentTooltipX},0 L${currentTooltipX},${chartHeight}`;
    }

    const { tooltipY = 0, tooltipHeight = 0 } = tooltipElementsValue;
    return `M${currentTooltipX},${tooltipY + tooltipHeight} L${currentTooltipX},${chartHeight}`;
  });

  const tooltipOpacity = useDerivedValue<number>((): number => {
    "worklet";
    const isTooltipVisible = showTooltipSV.value;
    const tooltipDataValue = tooltipData.value;

    if (!isTooltipVisible || !tooltipDataValue) {
      return 0;
    }

    return 1;
  });

  const circleOpacity = useDerivedValue<number>((): number => {
    "worklet";
    const tooltipDataValue = tooltipData.value;

    if (!tooltipDataValue) {
      return 0;
    }

    return 1;
  });

  const tooltipTransform = useDerivedValue(() => {
    "worklet";
    const tooltipElementsValue = tooltipElements.value;
    const currentCircleX = circleX.value;

    if (!tooltipElementsValue) {
      return [
        { translateX: currentCircleX - 60 },
        { translateY: LINE_CHART_TOOLTIP.VERTICAL_OFFSET },
      ];
    }

    const { tooltipX = 0, tooltipY = 0 } = tooltipElementsValue;
    return [{ translateX: tooltipX }, { translateY: tooltipY }];
  });

  const tooltipBackgroundPath = useDerivedValue<string>((): string => {
    "worklet";
    const tooltipElementsValue = tooltipElements.value;

    if (!tooltipElementsValue) {
      const defaultTooltipWidth = LINE_CHART_TOOLTIP.DEFAULT_WIDTH;
      const defaultTooltipHeight = 24;
      const defaultTooltipRadius = LINE_CHART_TOOLTIP.RADIUS;
      return `M${defaultTooltipRadius},0 h${defaultTooltipWidth - 2 * defaultTooltipRadius} a${defaultTooltipRadius},${defaultTooltipRadius} 0 0 1 ${defaultTooltipRadius},${defaultTooltipRadius} v${defaultTooltipHeight - 2 * defaultTooltipRadius} a${defaultTooltipRadius},${defaultTooltipRadius} 0 0 1 -${defaultTooltipRadius},${defaultTooltipRadius} h-${defaultTooltipWidth - 2 * defaultTooltipRadius} a${defaultTooltipRadius},${defaultTooltipRadius} 0 0 1 -${defaultTooltipRadius},-${defaultTooltipRadius} v-${defaultTooltipHeight - 2 * defaultTooltipRadius} a${defaultTooltipRadius},${defaultTooltipRadius} 0 0 1 ${defaultTooltipRadius},-${defaultTooltipRadius} z`;
    }

    const {
      tooltipWidth = LINE_CHART_TOOLTIP.DEFAULT_WIDTH,
      tooltipHeight = LINE_CHART_TOOLTIP.HEIGHT,
      tooltipRadius = LINE_CHART_TOOLTIP.RADIUS,
    } = tooltipElementsValue;

    return `M${tooltipRadius},0 h${tooltipWidth - 2 * tooltipRadius} a${tooltipRadius},${tooltipRadius} 0 0 1 ${tooltipRadius},${tooltipRadius} v${tooltipHeight - 2 * tooltipRadius} a${tooltipRadius},${tooltipRadius} 0 0 1 -${tooltipRadius},${tooltipRadius} h-${tooltipWidth - 2 * tooltipRadius} a${tooltipRadius},${tooltipRadius} 0 0 1 -${tooltipRadius},-${tooltipRadius} v-${tooltipHeight - 2 * tooltipRadius} a${tooltipRadius},${tooltipRadius} 0 0 1 ${tooltipRadius},-${tooltipRadius} z`;
  });

  // Left-aligned text positions - value text aligned with date text
  const valueTextX = useDerivedValue<number>((): number => {
    "worklet";
    // Value text aligned with date text (same X position)
    return LINE_CHART_TOOLTIP.DATE_TEXT_X;
  });

  const dateTextX = useDerivedValue<number>((): number => {
    "worklet";
    // Date text is left-aligned
    return LINE_CHART_TOOLTIP.DATE_TEXT_X;
  });

  const valueText = useDerivedValue<string>((): string => {
    "worklet";
    const tooltipElementsValue = tooltipElements.value;
    const { valueStrWithPrefix = "" } = tooltipElementsValue || {};
    return valueStrWithPrefix;
  });

  const dateText = useDerivedValue<string>((): string => {
    "worklet";
    const tooltipElementsValue = tooltipElements.value;
    const { xValueStr = "" } = tooltipElementsValue || {};
    return xValueStr;
  });

  // Calculate circle color based on comparison with initial value
  const tooltipCircleColor = useDerivedValue<string>((): string => {
    "worklet";
    const tooltipDataValue = tooltipData.value;

    if (!tooltipDataValue || plottedData.length === 0) {
      return LINE_CHART_TOOLTIP.CIRCLE_COLOR; // Default green
    }

    const currentValue = tooltipDataValue.value;
    const initial = plottedData[0] ?? null;

    if (initial === null || initial === undefined) {
      return LINE_CHART_TOOLTIP.CIRCLE_COLOR; // Default green
    }

    if (currentValue > initial) {
      return "#4CAF50"; // Green for increase
    } else if (currentValue < initial) {
      return "#F44336"; // Red for decrease
    } else {
      return "#9E9E9E"; // Gray for no change
    }
  });

  const verticalLinePath = useDerivedValue<string>((): string => {
    "worklet";
    const currentCircleX = circleX.value;
    return `M${currentCircleX},0 L${currentCircleX},${chartHeight}`;
  });

  const handleLabelPress = (label: string): void => {
    setSelectedLabel(label);
    if (onLabelPress) {
      onLabelPress(label);
    }
  };

  const handleSetSelectedIndex = (index: number | null): void => {
    setSelectedIndex(index);
  };

  const panGesture = useMemo(() => {
    const shouldShowTooltip = showTooltip;
    let lastIndex = -1;

    const clampXPosition = (canvasX: number): number => {
      "worklet";
      if (xPositions.length > 0) {
        let minX = xPositions[0] ?? 0;
        let maxX = xPositions[0] ?? 0;
        for (let i = 1; i < xPositions.length; i++) {
          const position = xPositions[i];
          if (position !== undefined) {
            if (position < minX) minX = position;
            if (position > maxX) maxX = position;
          }
        }
        return Math.max(minX, Math.min(canvasX, maxX));
      } else {
        return Math.max(0, Math.min(canvasX, chartWidth));
      }
    };
    let isFirstTouchAfterLongPress = true;
    let hasMoved = false;
    return Gesture.Pan()
      .minDistance(LINE_CHART_GESTURE.MIN_DISTANCE)
      .maxPointers(LINE_CHART_GESTURE.MAX_POINTERS)
      .shouldCancelWhenOutside(false)
      .activateAfterLongPress(LINE_CHART_GESTURE.LONG_PRESS_DURATION)
      .hitSlop({
        left: LINE_CHART_GESTURE.HIT_SLOP,
        right: LINE_CHART_GESTURE.HIT_SLOP,
        top: LINE_CHART_GESTURE.HIT_SLOP,
        bottom: LINE_CHART_GESTURE.HIT_SLOP,
      })
      .runOnJS(false)
      .onTouchesDown(() => {
        "worklet";
        // Avoid showing the tooltip before we have computed x/y (prevents the
        // "first click slides from right to left" effect).
        lastIndex = -1;
      })
      .onBegin(({ x }) => {
        "worklet";
        const touchX = x;
        const canvasRelativeX = touchX - paddingLeft;
        const adjustedX = clampXPosition(canvasRelativeX);
        const nearestIndex = findNearestIndex({
          x: adjustedX,
          positions: xPositions,
        });
        const finalX = adjustedX + paddingLeft;

        // Tooltip/circle should snap to the exact touch point (no "first time" slide).
        // If animations are enabled, we can still smooth; otherwise update instantly.
        smoothTooltipX.value = animate
          ? withSpring(finalX, {
              damping: LINE_CHART_ANIMATION.SPRING_DAMPING,
              stiffness: LINE_CHART_ANIMATION.SPRING_STIFFNESS,
            })
          : finalX;
        circleX.value = finalX;
        nearestIdx.value = nearestIndex;

        const interpolatedYValue = interpolateY({
          x: adjustedX,
          points,
          xPositions,
        });
        smoothCircleY.value = animate
          ? withSpring(interpolatedYValue, {
              damping: LINE_CHART_ANIMATION.SPRING_DAMPING,
              stiffness: LINE_CHART_ANIMATION.SPRING_STIFFNESS,
            })
          : interpolatedYValue;
        const nearestPoint = points[nearestIndex];
        const nearestPointY = nearestPoint?.y ?? 0;
        circleY.value = nearestPointY;

        if (shouldShowTooltip) {
          showTooltipSV.value = true;
        }
        runOnJS(handleSetSelectedIndex)(nearestIndex);

        lastIndex = nearestIndex;
      })
      .onUpdate(({ x }) => {
        "worklet";
        const touchX = x;
        const canvasRelativeX = touchX - paddingLeft;
        const adjustedX = clampXPosition(canvasRelativeX);
        const finalX = adjustedX + paddingLeft;

        smoothTooltipX.value = animate
          ? withSpring(finalX, {
              damping: LINE_CHART_ANIMATION.SPRING_DAMPING,
              stiffness: LINE_CHART_ANIMATION.SPRING_STIFFNESS,
            })
          : finalX;
        circleX.value = finalX;

        const interpolatedYValue = interpolateY({
          x: adjustedX,
          points,
          xPositions,
        });
        smoothCircleY.value = animate
          ? withSpring(interpolatedYValue, {
              damping: LINE_CHART_ANIMATION.SPRING_DAMPING,
              stiffness: LINE_CHART_ANIMATION.SPRING_STIFFNESS,
            })
          : interpolatedYValue;

        const currentNearestIndex = findNearestIndex({
          x: adjustedX,
          positions: xPositions,
        });

        if (currentNearestIndex !== lastIndex) {
          nearestIdx.value = currentNearestIndex;
          const currentPoint = points[currentNearestIndex];
          const currentPointY = currentPoint?.y ?? 0;
          circleY.value = currentPointY;
          lastIndex = currentNearestIndex;
          runOnJS(handleSetSelectedIndex)(currentNearestIndex);
        }
      })
      .onTouchesUp(() => {
        "worklet";
        if (shouldShowTooltip) {
          showTooltipSV.value = false;
        }
        if (!persistHighlight) {
          runOnJS(handleSetSelectedIndex)(null);
        }
      })
      .onEnd(() => {
        "worklet";
        if (shouldShowTooltip) {
          showTooltipSV.value = false;
        }
        if (!persistHighlight) {
          runOnJS(handleSetSelectedIndex)(null);
        }
        lastIndex = -1;
      });
  }, [
    circleX,
    circleY,
    nearestIdx,
    showTooltipSV,
    smoothTooltipX,
    smoothCircleY,
    points,
    xPositions,
    chartWidth,
    paddingLeft,
    showTooltip,
    persistHighlight,
    chartRightPadding,
    animate,
  ]);

  const renderXAxis = () => {
    if (!showXAxis) {
      return null;
    }

    const hasEpochTimestamps =
      !!sampledTimestamps && sampledTimestamps.length > 0;
    const isMarketHoursScale = isOneDayPeriod && marketHoursRange !== null;
    const axisPath = `M${paddingLeft},${chartHeight} L${paddingLeft + chartWidth},${chartHeight}`;

    return (
      <>
        <Path path={axisPath} color={axisColor} {...axisProps} />
        {xTicks.map((tick: number, tickIndex: number) => {
          const tickXPosition = (xScale as LinearScale)(tick) + paddingLeft;

          let tickLabelText: string;
          if (isMarketHoursScale) {
            // Market hours: xTicks are timestamps (ms)
            tickLabelText = formatTimeLabel({ timestamp: tick });
          } else if (hasEpochTimestamps) {
            // Epoch mode: xTicks are indices, labels come from timestamps (ms)
            const idx = Math.max(
              0,
              Math.min(sampledTimestamps!.length - 1, Math.round(tick))
            );
            const ts = sampledTimestamps![idx]!;
            const spanMs = timeDomain?.spanMs ?? 0;
            if (spanMs > 2 * 24 * 60 * 60 * 1000) {
              tickLabelText = new Intl.DateTimeFormat("en-IN", {
                month: "short",
                day: "2-digit",
              }).format(new Date(ts));
            } else if (spanMs > 24 * 60 * 60 * 1000) {
              tickLabelText = new Intl.DateTimeFormat("en-IN", {
                month: "short",
                day: "2-digit",
                hour: "numeric",
                minute: "2-digit",
              }).format(new Date(ts));
            } else {
              tickLabelText = formatTimeLabel({ timestamp: ts });
            }
          } else {
            tickLabelText = formatScaledNumber({ value: tick });
          }
          const tickLabelWidth = layoutFont
            ? layoutFont.measureText(tickLabelText).width
            : LINE_CHART_AXIS.DEFAULT_LABEL_WIDTH;

          // Skip ticks if labels would overlap (always keep the last tick).
          const approxSpacing = tickLabelWidth + 12;
          const maxLabels = Math.max(2, Math.floor(chartWidth / approxSpacing));
          const step =
            xTicks.length > maxLabels
              ? Math.ceil(xTicks.length / maxLabels)
              : 1;
          const isLast = tickIndex === xTicks.length - 1;
          if (!isLast && step > 1 && tickIndex % step !== 0) {
            return null;
          }

          const tickPath = `M${tickXPosition},${chartHeight} L${tickXPosition},${chartHeight + LINE_CHART_LAYOUT.TICK_MARK_LENGTH}`;

          return (
            <React.Fragment key={`xtick-${tick}`}>
              <Path path={tickPath} color={axisColor} {...axisProps} />
              {renderFont && (
                <SkiaText
                  x={tickXPosition - tickLabelWidth / 2}
                  y={chartHeight + LINE_CHART_LAYOUT.LABEL_OFFSET_Y}
                  text={tickLabelText}
                  font={renderFont}
                  color={axisLabelColor}
                  {...axisLabelProps}
                />
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  };

  const renderYAxis = () => {
    if (!showYAxis) {
      return null;
    }

    const isRightSide = yAxisPosition === "right";
    const yBottom = chartHeight - LINE_CHART_AXIS.BOTTOM_PADDING;
    // For right-side Y-axis, position it at the right edge of the chart area
    // For left-side Y-axis, position it at the left edge (paddingLeft)
    const axisX = isRightSide ? paddingLeft + chartWidth : paddingLeft;

    const axisPath = `M${axisX},${LINE_CHART_AXIS.TOP_PADDING} L${axisX},${yBottom}`;

    return (
      <>
        <Path path={axisPath} color={axisColor} {...axisProps} />
        {yTicks.map((tick: number) => {
          const tickYPosition = yScale(tick);
          // Ensure tick is within chart bounds
          if (tickYPosition < 0 || tickYPosition > yBottom) {
            return null;
          }

          const tickLabelText = formatYAxisTickLabel(tick, yTickStep);
          const tickLabelWidth = layoutFont
            ? layoutFont.measureText(tickLabelText).width
            : LINE_CHART_AXIS.DEFAULT_LABEL_WIDTH;

          let tickTextX: number;
          let tickPath: string;

          if (isRightSide) {
            // Right-side Y-axis: labels on the right of the axis line
            // Reduced spacing for more compact right-side Y-axis
            tickTextX = axisX + LINE_CHART_LAYOUT.TICK_MARK_LENGTH + 10; // Reduced from PADDING_LEFT_OFFSET (8) to 2 for tighter spacing
            tickPath = `M${axisX},${tickYPosition} L${axisX + LINE_CHART_LAYOUT.TICK_MARK_LENGTH},${tickYPosition}`;
          } else {
            // Left-side Y-axis: labels on the left of the axis line
            tickTextX = Math.max(
              0,
              paddingLeft -
                tickLabelWidth -
                LINE_CHART_LAYOUT.PADDING_LEFT_OFFSET
            );
            tickPath = `M${axisX},${tickYPosition} L${axisX - LINE_CHART_LAYOUT.TICK_MARK_LENGTH},${tickYPosition}`;
          }

          return (
            <React.Fragment key={`ytick-${tick}`}>
              <Path path={tickPath} color={axisColor} {...axisProps} />
              {renderFont && (
                <SkiaText
                  x={tickTextX}
                  y={tickYPosition + LINE_CHART_LAYOUT.TEXT_OFFSET_Y}
                  text={tickLabelText}
                  font={renderFont}
                  color={axisLabelColor}
                  {...axisLabelProps}
                />
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  };

  const renderXGridLines = () => {
    if (!showGridLines || !showXAxis) {
      return null;
    }

    const topY = LINE_CHART_AXIS.TOP_PADDING;
    const bottomY = chartHeight - LINE_CHART_AXIS.BOTTOM_PADDING;

    return (
      <>
        {xTicks.map((tick: number) => {
          const tickXPosition = (xScale as LinearScale)(tick) + paddingLeft;
          const gridLinePath = `M${tickXPosition},${topY} L${tickXPosition},${bottomY}`;
          return (
            <Path key={`xgrid-${tick}`} path={gridLinePath} paint={gridPaint} />
          );
        })}
      </>
    );
  };

  const renderYGridLines = () => {
    if (!showGridLines || !showYAxis) {
      return null;
    }

    const topY = LINE_CHART_AXIS.TOP_PADDING;
    const bottomY = chartHeight - LINE_CHART_AXIS.BOTTOM_PADDING;
    const leftX = paddingLeft;
    const rightX = paddingLeft + chartWidth;

    return (
      <>
        {yTicks.map((tick: number) => {
          const tickYPosition = yScale(tick);
          // Ensure tick is within chart bounds
          if (tickYPosition < topY || tickYPosition > bottomY) {
            return null;
          }
          const gridLinePath = `M${leftX},${tickYPosition} L${rightX},${tickYPosition}`;
          return (
            <Path key={`ygrid-${tick}`} path={gridLinePath} paint={gridPaint} />
          );
        })}
      </>
    );
  };

  const renderTooltip = () => {
    const shouldRenderTooltip =
      showTooltip &&
      selectedIndex !== null &&
      plottedData.length > 0 &&
      points.length > 0 &&
      path;

    if (!shouldRenderTooltip) {
      return null;
    }

    return (
      <>
        <Path
          path={tooltipVerticalLinePath}
          paint={dashPaint}
          opacity={tooltipOpacity}
        />
        <Group transform={tooltipTransform} opacity={tooltipOpacity}>
          <Path
            path={tooltipBackgroundPath}
            color={tooltipBgColor}
            style="fill"
            opacity={0.95}
          />
          <Path
            path={tooltipBackgroundPath}
            color={tooltipBdColor}
            style="stroke"
            strokeWidth={LINE_CHART_AXIS.STROKE_WIDTH}
          />
          {renderFont && (
            <>
              {/* Date/Time text (top line) - smaller, left-aligned */}
              <SkiaText
                x={dateTextX}
                y={LINE_CHART_TOOLTIP.DATE_TEXT_Y}
                text={dateText}
                font={dateFont ?? renderFont}
                color={tooltipSecTxtColor}
              />
              {/* Circle indicator - color changes based on comparison with initial value */}
              {showTooltipCircle && (
                <Circle
                  cx={LINE_CHART_TOOLTIP.CIRCLE_X_OFFSET}
                  cy={LINE_CHART_TOOLTIP.CIRCLE_Y_OFFSET}
                  r={LINE_CHART_TOOLTIP.CIRCLE_RADIUS}
                  color={tooltipCircleColor}
                  style="fill"
                />
              )}
              {/* Value text (bottom line) - larger, bolder, left-aligned with date text */}
              <SkiaText
                x={valueTextX}
                y={LINE_CHART_TOOLTIP.VALUE_TEXT_Y}
                text={valueText}
                font={valueFont ?? renderFont}
                color={tooltipCircleColor}
              />
            </>
          )}
        </Group>
      </>
    );
  };

  const renderHighlight = () => {
    const shouldRenderHighlight =
      !showTooltip &&
      selectedIndex !== null &&
      plottedData.length > 0 &&
      points.length > 0 &&
      path;

    if (!shouldRenderHighlight) {
      return null;
    }

    const selectedValue = plottedData[selectedIndex] ?? null;
    const hasSelectedValue =
      selectedValue !== null && selectedValue !== undefined;

    return (
      <>
        <Path
          path={verticalLinePath}
          color={axisColor}
          style="stroke"
          strokeWidth={LINE_CHART_AXIS.STROKE_WIDTH}
          {...axisProps}
        />
        {renderFont && hasSelectedValue && (
          <SkiaText
            x={circleX}
            y={16}
            text={String(selectedValue)}
            font={renderFont}
            color={axisLabelColor}
            {...axisLabelProps}
          />
        )}
      </>
    );
  };

  const renderCircle = () => {
    const shouldRenderCircle =
      selectedIndex !== null &&
      plottedData.length > 0 &&
      points.length > 0 &&
      path;

    if (!shouldRenderCircle) {
      return null;
    }

    const circleRadius = circleProps.r ?? LINE_CHART_AXIS.CIRCLE_RADIUS;
    const circleColor = circleProps.color ?? lineColor;
    const circleStyle = circleProps.style ?? "fill";

    return (
      <Circle
        cx={smoothTooltipX}
        cy={smoothCircleY}
        r={circleRadius}
        color={circleColor}
        style={circleStyle}
        opacity={circleOpacity}
        {...circleProps}
      />
    );
  };

  const renderArea = () => {
    if (!showArea || !path) {
      return null;
    }

    const gradientStartColor = colorToRgba(lineColor, 0.35);
    const gradientEndColor = colorToRgba(lineColor, 0);
    const topY = LINE_CHART_AXIS.TOP_PADDING;
    const bottomY = chartHeight - LINE_CHART_AXIS.BOTTOM_PADDING;

    const currentAreaPath = animate ? animatedAreaPath : areaPath;

    return (
      <Group transform={[{ translateX: paddingLeft }, { translateY: 0 }]}>
        <Path path={currentAreaPath} start={0} end={animate ? trimEnd : 1}>
          <LinearGradient
            start={vec(0, topY)}
            end={vec(0, bottomY - topY)}
            colors={[gradientStartColor, gradientEndColor]}
          />
        </Path>
      </Group>
    );
  };

  const renderPulseIndicator = () => {
    if (!shouldPulseIndicator || !lastPoint) {
      return null;
    }

    return (
      <>
        <Circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={pulseR}
          style="stroke"
          strokeWidth={LINE_CHART_PULSE.STROKE_WIDTH}
          color={lineColor}
          opacity={pulseOp}
        />
        <Circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={LINE_CHART_PULSE.MIN_RADIUS}
          color={lineColor}
          style="fill"
        />
      </>
    );
  };

  const renderLabels = () => {
    if (labels.length === 0) {
      return null;
    }

    return (
      <View style={[styles.labelRow, labelContainerStyle]}>
        {labels.map((label: string) => {
          const isLabelSelected = label === selectedLabel;
          return (
            <TouchableOpacity
              key={label}
              onPress={() => handleLabelPress(label)}
            >
              <Text
                style={[
                  styles.labelText,
                  { color: chartTheme.labelTextColor },
                  labelTextStyle,
                  isLabelSelected && [
                    styles.labelTextSelected,
                    { color: chartTheme.labelTextSelectedColor },
                    selectedLabelTextStyle,
                  ],
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // 📌 Return JSX
  return (
    <View style={{ width, flexDirection: "column" as const }}>
      <GestureDetector gesture={panGesture}>
        <View
          style={{ height: height + xAxisLabelHeight, position: "relative" }}
        >
          <Canvas
            style={{
              flex: 1,
            }}
          >
            {renderXAxis()}
            {renderYAxis()}
            {renderXGridLines()}
            {renderYGridLines()}
            {renderArea()}
            <Group transform={[{ translateX: paddingLeft }, { translateY: 0 }]}>
              {!!path && (
                <Path
                  path={animate ? animatedPath : path}
                  start={0}
                  end={animate ? trimEnd : 1}
                  color={lineColor}
                  style="stroke"
                  strokeWidth={lineStrokeWidth}
                  {...lineProps}
                />
              )}
            </Group>
            {renderPulseIndicator()}
            {renderTooltip()}
            {renderHighlight()}
            {renderCircle()}
          </Canvas>
        </View>
      </GestureDetector>
      {renderLabels()}
    </View>
  );
};

export default LineChart;

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  labelText: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
  },
  labelTextSelected: {
    fontWeight: "bold",
  },
});
