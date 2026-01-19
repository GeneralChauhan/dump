/**
 * COMMENTED OUT:
 * Not used by `LineChart` (part of the crosshair stack).
 * Original implementation preserved below for reference.
 */
// import type { SkCanvas, SkPaint } from '@shopify/react-native-skia';
// import type { CanvasContext } from '@pulse/engine';
//
// export const renderCrosshair = (
//   canvas: SkCanvas,
//   context: CanvasContext,
//   paints: {
//     crosshairLinePaint: SkPaint;
//     crosshairPointPaint: SkPaint;
//   }
// ) => {
//   'worklet';
//   if (!context.crosshairState || !context.crosshairState.isVisible) {
//     return;
//   }
//
//   const { x, y } = context.crosshairState;
//
//   canvas.drawLine(
//     x,
//     0,
//     x,
//     context.chartDimensions.CHART_HEIGHT,
//     paints.crosshairLinePaint
//   );
//
//   canvas.drawLine(
//     0,
//     y,
//     context.chartDimensions.CHART_WIDTH,
//     y,
//     paints.crosshairLinePaint
//   );
//
//   canvas.drawCircle(x, y, 4, paints.crosshairPointPaint);
// };

export {};

