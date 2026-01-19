/**
 * COMMENTED OUT:
 * This module is not used by `LineChart` and has been intentionally commented
 * out as part of the "LineChart-only" pruning.
 *
 * Original implementation preserved below for reference.
 */
// import React, { useMemo } from 'react';
// import { Canvas } from '@shopify/react-native-skia';
// import { useContextBridge } from 'its-fine';
// import { StyleProp, ViewStyle } from 'react-native';
// import { SharedValue, useSharedValue } from 'react-native-reanimated';
// import { Gesture, GestureDetector } from 'react-native-gesture-handler';
// import { type SkMatrix } from '@shopify/react-native-skia';
// import { CandleChart } from './CandleChart';
// import { Grid } from './Grid';
// import { Crosshair } from './Crosshair';
// import { useChartGestures } from '../hooks/useChartGestures';
// import type { CanvasContext, ChartDimensions } from '@pulse/engine';
//
// export type ChartProps = {
//   context: CanvasContext | (() => CanvasContext);
//   matrix: SharedValue<SkMatrix>;
//   canvasStyle?: StyleProp<ViewStyle>;
//   onSize?: SharedValue<{ width: number; height: number }>;
//   showGrid?: boolean;
//   showCrosshair?: boolean;
//   candleDataLength?: number;
//   candleSpacing?: number;
//   minScaleX?: number;
//   maxScaleX?: number;
//   minScaleY?: number;
//   maxScaleY?: number;
//   chartDimensions?: SharedValue<ChartDimensions>;
//   children?: React.ReactNode;
// };
//
// export const Chart: React.FC<ChartProps> = ({
//   context,
//   matrix,
//   canvasStyle,
//   onSize,
//   showGrid = true,
//   showCrosshair = true,
//   candleDataLength = 0,
//   candleSpacing = 20,
//   minScaleX = 0.2,
//   maxScaleX = 5,
//   minScaleY = 0.2,
//   maxScaleY = 5,
//   chartDimensions: chartDimensionsProp,
//   children,
// }) => {
//   const ContextBridge = useContextBridge();
//
//   const chartDimensionsForGestures = chartDimensionsProp || useSharedValue({
//     CHART_WIDTH: 0,
//     CHART_HEIGHT: 0,
//     PADDING_LEFT: 0,
//     PADDING_RIGHT: 0,
//     PADDING_TOP: 0,
//     PADDING_BOTTOM: 0,
//     yAxisHeight: 0,
//   });
//
//   const { chartPan, chartPinch } = useChartGestures({
//     matrix,
//     chartDimensions: chartDimensionsForGestures,
//     candleDataLength,
//     candleSpacing,
//     minScaleX,
//     maxScaleX,
//     minScaleY,
//     maxScaleY,
//     onMatrixChange: (newMatrix) => {
//       'worklet';
//     },
//   });
//
//   const composedGesture = useMemo(
//     () => Gesture.Simultaneous(chartPan, chartPinch),
//     [chartPan, chartPinch]
//   );
//
//   return (
//     <GestureDetector gesture={composedGesture}>
//       <Canvas onSize={onSize} style={[canvasStyle]}>
//         <ContextBridge>
//           {showGrid && <Grid context={context} />}
//           <CandleChart context={context} matrix={matrix} />
//           {showCrosshair && <Crosshair context={context} />}
//           {children}
//         </ContextBridge>
//       </Canvas>
//     </GestureDetector>
//   );
// };

export {};

