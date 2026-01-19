/**
 * COMMENTED OUT:
 * Not used by `LineChart` (part of the crosshair stack).
 * Original implementation preserved below for reference.
 */
// import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
// import { Skia, createPicture, type SkCanvas, type SkPicture, type SkPaint } from '@shopify/react-native-skia';
// import type { DerivedValue } from 'react-native-reanimated';
// import type { CanvasContext } from '@pulse/engine';
// import { renderCrosshair } from '../renderers/crosshairRenderer';
//
// export type UseCrosshairRendererResult = {
//   getPictures: () => {
//     crosshairPicture: DerivedValue<SkPicture>;
//   };
// };
//
// export const useCrosshairRenderer = (
//   context: DerivedValue<CanvasContext>
// ): UseCrosshairRendererResult => {
//   const paints = useSharedValue<{
//     crosshairLinePaint: SkPaint;
//     crosshairPointPaint: SkPaint;
//   } | null>(null);
//
//   if (paints.value === null) {
//     paints.value = {
//       crosshairLinePaint: Skia.Paint(),
//       crosshairPointPaint: Skia.Paint(),
//     };
//   }
//
//   const crosshairPicture = useDerivedValue(() => {
//     'worklet';
//     const ctx = context.value;
//
//     if (!paints.value) {
//       return createPicture(() => {});
//     }
//
//     paints.value.crosshairLinePaint.setColor(
//       Skia.Color(ctx.theme.borderPrimary)
//     );
//     paints.value.crosshairLinePaint.setStrokeWidth(1);
//     paints.value.crosshairLinePaint.setStyle(1);
//
//     paints.value.crosshairPointPaint.setColor(
//       Skia.Color(ctx.theme.borderPrimary)
//     );
//     paints.value.crosshairPointPaint.setStyle(0);
//
//     return createPicture((canvas: SkCanvas) => {
//       renderCrosshair(canvas, ctx, paints.value!);
//     });
//   });
//
//   return {
//     getPictures: () => ({
//       crosshairPicture,
//     }),
//   };
// };

export {};

