/**
 * COMMENTED OUT:
 * Not used by the RN `LineChart` component (candle-chart rendering context).
 * Original implementation preserved below for reference.
 */
// import type { SkMatrix } from '@shopify/react-native-skia';
// import type { CandleChartData } from '../ChartData/CandleChartData';
//
// export type ChartDimensions = {
//   PADDING_LEFT: number;
//   PADDING_RIGHT: number;
//   PADDING_BOTTOM: number;
//   PADDING_TOP: number;
//   CHART_WIDTH: number;
//   CHART_HEIGHT: number;
//   yAxisHeight: number;
// };
//
// export type CandleDimensions = {
//   candleBodyWidth: number;
//   candleGap: number;
//   candleSpacing: number;
// };
//
// export type ScaleDimensions = {
//   MIN_SCALE_X: number;
//   MAX_SCALE_X: number;
//   MIN_SCALE_Y: number;
//   MAX_SCALE_Y: number;
// };
//
// export type PriceLevel = {
//   price: number;
//   y: number;
// };
//
// export type TimelineLabel = {
//   candlePosition: number;
//   timestamp: number;
//   label: string;
// };
//
// export type CrosshairState = {
//   isVisible: boolean;
//   x: number;
//   y: number;
//   candleIndex: number;
//   price: number;
//   time: number;
// };
//
// export type HighLowRange = {
//   highest: number;
//   lowest: number;
// };
//
// export type ChartMetadata = {
//   candleDataLength: number;
// };
//
// export type ThemeColors = {
//   backgroundPrimary: string;
//   backgroundSecondary: string;
//   backgroundTertiary: string;
//   contentPositive: string;
//   contentNegative: string;
//   borderPrimary: string;
//   [key: string]: string;
// };
//
// export type CanvasContext = {
//   matrix: SkMatrix;
//
//   chartData: CandleChartData;
//   chartMetadata: ChartMetadata;
//
//   chartDimensions: ChartDimensions;
//   candleDimensions: CandleDimensions;
//   scaleDimensions: ScaleDimensions;
//
//   bestFitHighLow: HighLowRange;
//   visiblePriceLevels: PriceLevel[];
//   axisLabels: TimelineLabel[];
//
//   crosshairState?: CrosshairState;
//
//   theme: ThemeColors;
//
//   onRequestHistoricalData?: () => void;
//   onChangeXAxisMatrix?: (matrix: SkMatrix) => void;
// };

export {};
