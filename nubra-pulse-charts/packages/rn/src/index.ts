// NOTE: This package has been pruned to only expose `LineChart` and the minimum
// utility surface it depends on. The rest of the components/hooks/renderers
// remain in the repo as commented code (for reference), but are not exported.

export { default as LineChart } from "./components/LineChart/LineChart";
export type {
  iLineChartProps,
  iTimePeriod,
} from "./components/LineChart/LineChart";

// Re-export theme types and utilities for convenience
export type { ThemeMode, ChartTheme, ThemeColorKey } from "@pulse/engine";
export {
  getTheme,
  lightTheme,
  darkTheme,
  themes,
  updateTheme,
  getThemeColor,
  themeColors,
  updateThemeColors,
} from "@pulse/engine";

// Minimal utils used by LineChart (directly or via its helpers)
export * from "./utils/scales";
export * from "./utils/pathGenerators";
export * from "./utils/pathInterpolation";

// Live price updates hook
export {
  useLivePriceUpdates,
  periodToResolution,
  type UseLivePriceUpdatesOptions,
  type UseLivePriceUpdatesReturn,
} from "./hooks/useLivePriceUpdates";
