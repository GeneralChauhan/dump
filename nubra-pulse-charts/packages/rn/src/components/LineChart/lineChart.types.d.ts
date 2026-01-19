/**
 * Type definitions for LineChart component - RN specific
 */

import type { PathProps, CircleProps } from "@shopify/react-native-skia";
import type { ViewStyle, TextStyle } from "react-native";
import type {
  iPoint,
  iMarketHoursRange,
  iFilteredDataResult,
  iFindNearestIndexParams,
  iInterpolateYParams,
  iFormatTickLabelParams,
  iFormatTimeLabelParams,
  iProcessMarketHoursDataParams,
  ThemeMode,
} from "@pulse/engine";

// Re-export engine types for convenience
export type {
  iPoint,
  iMarketHoursRange,
  iFilteredDataResult,
  iFindNearestIndexParams,
  iInterpolateYParams,
  iFormatTickLabelParams,
  iFormatTimeLabelParams,
  iProcessMarketHoursDataParams,
  ThemeMode,
};

export type iChartScalesResult = {
  path: string;
  points: iPoint[];
  xScale:
    | import("../../utils/scales").LinearScale
    | import("../../utils/scales").TimeScale;
  yScale: import("../../utils/scales").LinearScale;
  xTicks: number[];
  yTicks: number[];
};

export type iTooltipData = {
  x: number;
  value: number;
  xValue: number | null;
  selectedIndex: number;
};

export type iTooltipElements = {
  x: number;
  tooltipX: number;
  tooltipY: number;
  tooltipWidth: number;
  tooltipHeight: number;
  tooltipRadius: number;
  valueStr: string;
  valueStrWithPrefix: string;
  xValueStr: string;
  priceWidth: number;
  xValueWidth: number;
};

export type iTooltipPosition = "top" | "center" | "bottom";

export type iTimePeriod = "1D" | "1W" | "1M" | "1Y" | "5Y" | "YTD";

export type iLineChartProps = {
  data: number[];
  width: number;
  height: number;
  color?: string;
  strokeWidth?: number;
  /**
   * Enables/disables chart animations (path morph/draw and tooltip smoothing).
   * Defaults to false for snappier rendering.
   */
  animate?: boolean;
  persistHighlight?: boolean;
  lineProps?: Omit<PathProps, "path" | "start" | "end">;
  circleProps?: Partial<Omit<CircleProps, "cx" | "cy">>;
  labels?: string[];
  onLabelPress?: (label: string) => void;
  labelContainerStyle?: ViewStyle;
  labelTextStyle?: TextStyle;
  selectedLabelTextStyle?: TextStyle;
  showXAxis?: boolean;
  showYAxis?: boolean;
  xTickCount?: number;
  yTickCount?: number;
  axisProps?: Omit<PathProps, "path" | "start" | "end">;
  axisLabelProps?: Partial<Omit<CircleProps, "cx" | "cy">>;
  fontSource?: any;
  showTooltip?: boolean;
  tooltipPosition?: iTooltipPosition;
  tooltipBackgroundColor?: string;
  tooltipBorderColor?: string;
  tooltipTextColor?: string;
  tooltipSecondaryTextColor?: string;
  marketStartTime?: Date | number;
  marketCloseTime?: Date | number;
  /**
   * If provided, controls whether the market is currently open.
   * When true (and `period` is 1D), the chart can show a live pulsing indicator
   * at the last plotted point.
   */
  isMarketOpen?: boolean;
  /**
   * Enables/disables the live pulsing indicator at the last point (1D only).
   * Defaults to true.
   */
  showPulseIndicator?: boolean;
  timestamps?: number[];
  period?: iTimePeriod;
  lowerCircuit?: number;
  upperCircuit?: number;
  yAxisPosition?: "left" | "right";
  /**
   * Theme mode for the chart. Controls colors for lines, tooltips, axes, and labels.
   * Defaults to "light".
   */
  theme?: ThemeMode;
  /**
   * Enables area chart mode with gradient fill. When true, the area under the line
   * will be filled with a gradient based on the line color (opaque at top, transparent at bottom).
   * Defaults to false.
   */
  showArea?: boolean;
  /**
   * Enables/disables the circle indicator in the tooltip that shows the comparison
   * with the initial value (green for increase, red for decrease, gray for no change).
   * Defaults to true.
   */
  showTooltipCircle?: boolean;
  /**
   * Enables/disables grid lines for the axes. When true and an axis is enabled,
   * grid lines will be drawn at the tick positions for that axis.
   * Defaults to false.
   */
  showGridLines?: boolean;
};

export type iGenerateUniformTicksParams = {
  scale:
    | import("../../utils/scales").LinearScale
    | import("../../utils/scales").TimeScale;
  tickCount: number;
  isYAxis?: boolean;
  actualMin?: number;
  actualMax?: number;
  isTimeScale?: boolean;
  chartHeight?: number;
};

export type iFilterYTicksBySpacingParams = {
  ticks: number[];
  scale: import("../../utils/scales").LinearScale;
  minVerticalSpacing?: number;
};

export type iCalculateChartDimensionsParams = {
  width: number;
  height: number;
  showXAxis: boolean;
  showYAxis: boolean;
};

export type iChartDimensions = {
  xAxisLabelHeight: number;
  yAxisLabelWidth: number;
  paddingLeft: number;
  paddingBottom: number;
  chartRightPadding: number;
  chartWidth: number;
  chartHeight: number;
};
