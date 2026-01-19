/**
 * COMMENTED OUT:
 * This module is not used by `LineChart` and has been intentionally commented
 * out as part of the "LineChart-only" pruning.
 *
 * Original implementation preserved below for reference.
 */
// import React from 'react';
// import { Picture } from '@shopify/react-native-skia';
// import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
// import { useCandleChartRenderer } from '../hooks/useCandleChartRenderer';
// import type { CanvasContext } from '@pulse/engine';
// import type { SkMatrix } from '@shopify/react-native-skia';
//
// export type CandleChartProps = {
//   context: CanvasContext | (() => CanvasContext);
//   matrix?: SharedValue<SkMatrix>;
// };
//
// export const CandleChart: React.FC<CandleChartProps> = ({ context, matrix }) => {
//   const contextValue = useDerivedValue(() => {
//     if (matrix) {
//       const _ = matrix.value.get();
//     }
//
//     if (typeof context === 'function') {
//       return context();
//     }
//     return context;
//   });
//
//   const { getPictures } = useCandleChartRenderer(contextValue);
//
//   return <Picture picture={getPictures().chartPicture} />;
// };

export {};
