/**
 * COMMENTED OUT:
 * Not used by `LineChart` (part of the grid stack).
 * Original implementation preserved below for reference.
 */
// import type { SkCanvas, SkPaint } from '@shopify/react-native-skia';
// import type { CanvasContext } from '@pulse/engine';
// import { decomposeMatrix } from '@pulse/engine';
//
// export const renderGrid = (
//   canvas: SkCanvas,
//   context: CanvasContext,
//   paints: {
//     horizontalGridPaint: SkPaint;
//     verticalGridPaint: SkPaint;
//   },
//   renderHorizontal: boolean = true,
//   renderVertical: boolean = true
// ) => {
//   'worklet';
//   if (
//     context.chartDimensions.CHART_WIDTH === 0 ||
//     context.chartDimensions.CHART_HEIGHT === 0
//   ) {
//     return;
//   }
//
//   if (renderHorizontal) {
//     const m = context.matrix.get();
//     const scaleY = m[4];
//     const translateY = m[5];
//
//     canvas.translate(0, translateY);
//     canvas.scale(1, scaleY);
//
//     paints.horizontalGridPaint.setStrokeWidth(1 / scaleY);
//
//     context.visiblePriceLevels.forEach((lvl) => {
//       canvas.drawLine(
//         0,
//         lvl.y,
//         context.chartDimensions.CHART_WIDTH,
//         lvl.y,
//         paints.horizontalGridPaint
//       );
//     });
//   }
//
//   if (renderVertical) {
//     if (context.chartData.candles.length === 0) {
//       return;
//     }
//
//     const {
//       scale: { x: scaleX },
//       translate: { x: translateX },
//     } = decomposeMatrix(context.matrix);
//
//     paints.verticalGridPaint.setStrokeWidth(1 / scaleX);
//
//     canvas.translate(translateX, 0);
//     canvas.scale(scaleX, 1);
//
//     context.axisLabels.forEach((label) => {
//       const invertedIndex =
//         context.chartData.candles.length - 1 - label.candlePosition;
//
//       const x =
//         -invertedIndex * context.candleDimensions.candleSpacing +
//         context.chartDimensions.CHART_WIDTH;
//       canvas.drawLine(
//         x,
//         0,
//         x,
//         context.chartDimensions.CHART_HEIGHT,
//         paints.verticalGridPaint
//       );
//     });
//   }
// };

export {};

