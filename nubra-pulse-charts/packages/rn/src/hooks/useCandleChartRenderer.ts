/**
 * COMMENTED OUT:
 * Not used by `LineChart` (part of the candle chart stack).
 * Original implementation preserved below for reference.
 */
// import { runOnJS, useDerivedValue, useSharedValue } from 'react-native-reanimated';
// import { Skia, createPicture, type SkCanvas, type SkPicture, type SkPath, type SkPaint } from '@shopify/react-native-skia';
// import type { DerivedValue } from 'react-native-reanimated';
// import type { CanvasContext } from '@pulse/engine';
// import { renderCandleChart } from '../renderers/candleChartRenderer';
//
// export type UseCandleChartRendererResult = {
//   getPictures: () => {
//     chartPicture: DerivedValue<SkPicture>;
//   };
// };
//
// export const useCandleChartRenderer = (
//   context: DerivedValue<CanvasContext>
// ): UseCandleChartRendererResult => {
//   const paints = useSharedValue<{
//     positivePaint: SkPaint;
//     negativePaint: SkPaint;
//     positiveLinePaint: SkPaint;
//     negativeLinePaint: SkPaint;
//   } | null>(null);
//
//   const paths = useSharedValue<{
//     positivePath: SkPath;
//     negativePath: SkPath;
//     positiveWickPath: SkPath;
//     negativeWickPath: SkPath;
//   } | null>(null);
//
//   if (paints.value === null) {
//     paints.value = {
//       positivePaint: Skia.Paint(),
//       negativePaint: Skia.Paint(),
//       positiveLinePaint: Skia.Paint(),
//       negativeLinePaint: Skia.Paint(),
//     };
//   }
//
//   if (paths.value === null) {
//     paths.value = {
//       positivePath: Skia.Path.Make(),
//       negativePath: Skia.Path.Make(),
//       positiveWickPath: Skia.Path.Make(),
//       negativeWickPath: Skia.Path.Make(),
//     };
//   }
//
//   const chartPicture = useDerivedValue(() => {
//     'worklet';
//     const ctx = context.value;
//
//     if (!paints.value || !paths.value) {
//       return createPicture(() => {});
//     }
//     runOnJS(() => {
//       console.log('ctx', ctx, paints.value, paths.value);
//     });
//     paints.value.positivePaint.setColor(Skia.Color(ctx.theme.contentPositive));
//     paints.value.positivePaint.setStrokeWidth(0.5);
//     paints.value.positivePaint.setStyle(0);
//
//     paints.value.negativePaint.setColor(Skia.Color(ctx.theme.contentNegative));
//     paints.value.negativePaint.setStrokeWidth(0.1);
//     paints.value.negativePaint.setStyle(0);
//
//     paints.value.positiveLinePaint.setColor(Skia.Color(ctx.theme.contentPositive));
//     paints.value.positiveLinePaint.setStrokeWidth(0.5);
//     paints.value.positiveLinePaint.setStyle(1);
//
//     paints.value.negativeLinePaint.setColor(Skia.Color(ctx.theme.contentNegative));
//     paints.value.negativeLinePaint.setStrokeWidth(0.5);
//     paints.value.negativeLinePaint.setStyle(1);
//
//     return createPicture((canvas: SkCanvas) => {
//       renderCandleChart(canvas, ctx, paints.value!, paths.value!);
//     });
//   });
//
//   return {
//     getPictures: () => ({
//       chartPicture,
//     }),
//   };
// };

export {};

