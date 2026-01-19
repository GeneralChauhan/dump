/**
 * COMMENTED OUT:
 * Not used by `LineChart` (RN canvas context adapter for candle chart stack).
 * Original implementation preserved below for reference.
 */
// import type { SharedValue } from 'react-native-reanimated';
// import type { SkMatrix } from '@shopify/react-native-skia';
// import type {
//   CanvasContext,
//   ChartDimensions,
//   CandleDimensions,
//   ScaleDimensions,
//   TimelineLabel,
//   CrosshairState,
//   HighLowRange,
//   ChartMetadata,
//   ThemeColors,
// } from '@pulse/engine';
// import type { CandleChartData } from '@pulse/engine';
// import { createCanvasContext } from '@pulse/engine';
//
// export const createCanvasContextFromRN = (params: {
//   matrix: SharedValue<SkMatrix>;
//   chartData: SharedValue<CandleChartData>;
//   chartMetadata: SharedValue<ChartMetadata>;
//   chartDimensions: SharedValue<ChartDimensions>;
//   candleDimensions: SharedValue<CandleDimensions>;
//   scaleDimensions: SharedValue<ScaleDimensions>;
//   bestFitHighLow: SharedValue<HighLowRange>;
//   axisLabels: SharedValue<TimelineLabel[]>;
//   theme: ThemeColors | SharedValue<ThemeColors>;
//   crosshairState?: SharedValue<CrosshairState>;
//   onRequestHistoricalData?: () => void;
//   onChangeXAxisMatrix?: (matrix: SkMatrix) => void;
//   minTargetIntervals?: number;
//   maxTargetIntervals?: number;
// }): () => CanvasContext => {
//   return () => {
//     'worklet';
//     const theme =
//       typeof params.theme === 'object' && 'value' in params.theme
//         ? params.theme.value
//         : params.theme;
//
//     return createCanvasContext({
//       matrix: params.matrix.value,
//       chartData: params.chartData.value,
//       chartMetadata: params.chartMetadata.value,
//       chartDimensions: params.chartDimensions.value,
//       candleDimensions: params.candleDimensions.value,
//       scaleDimensions: params.scaleDimensions.value,
//       bestFitHighLow: params.bestFitHighLow.value,
//       axisLabels: params.axisLabels.value,
//       theme: theme as ThemeColors,
//       crosshairState: params.crosshairState?.value,
//       onRequestHistoricalData: params.onRequestHistoricalData,
//       onChangeXAxisMatrix: params.onChangeXAxisMatrix,
//       minTargetIntervals: params.minTargetIntervals,
//       maxTargetIntervals: params.maxTargetIntervals,
//     });
//   };
// };

export {};

