/**
 * COMMENTED OUT:
 * Not used by `LineChart` (part of the grid stack).
 * Original implementation preserved below for reference.
 */
// import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
// import { Skia, createPicture, type SkCanvas, type SkPicture, type SkPaint } from '@shopify/react-native-skia';
// import type { DerivedValue } from 'react-native-reanimated';
// import type { CanvasContext } from '@pulse/engine';
// import { renderGrid } from '../renderers/gridRenderer';
//
// export type UseGridRendererResult = {
//   getPictures: () => {
//     horizontalGrid: DerivedValue<SkPicture>;
//     verticalGrid: DerivedValue<SkPicture>;
//     combined: DerivedValue<SkPicture>;
//   };
// };
//
// export const useGridRenderer = (
//   context: DerivedValue<CanvasContext>
// ): UseGridRendererResult => {
//   const paints = useSharedValue<{
//     horizontalGridPaint: SkPaint;
//     verticalGridPaint: SkPaint;
//   } | null>(null);
//
//   if (paints.value === null) {
//     paints.value = {
//       horizontalGridPaint: Skia.Paint(),
//       verticalGridPaint: Skia.Paint(),
//     };
//   }
//
//   const horizontalGridPicture = useDerivedValue(() => {
//     'worklet';
//     const ctx = context.value;
//
//     if (!paints.value) {
//       return createPicture(() => {});
//     }
//
//     paints.value.horizontalGridPaint.setColor(
//       Skia.Color(ctx.theme.backgroundTertiary)
//     );
//     paints.value.horizontalGridPaint.setPathEffect(
//       Skia.PathEffect.MakeDash([3, 3], 0)
//     );
//
//     return createPicture((canvas: SkCanvas) => {
//       canvas.save();
//       renderGrid(canvas, ctx, paints.value!, true, false);
//       canvas.restore();
//     });
//   });
//
//   const verticalGridPicture = useDerivedValue(() => {
//     'worklet';
//     const ctx = context.value;
//
//     if (!paints.value) {
//       return createPicture(() => {});
//     }
//
//     paints.value.verticalGridPaint.setColor(
//       Skia.Color(ctx.theme.backgroundTertiary)
//     );
//     paints.value.verticalGridPaint.setPathEffect(
//       Skia.PathEffect.MakeDash([3, 3], 0)
//     );
//
//     return createPicture((canvas: SkCanvas) => {
//       canvas.save();
//       renderGrid(canvas, ctx, paints.value!, false, true);
//       canvas.restore();
//     });
//   });
//
//   const combinedGridPicture = useDerivedValue(() => {
//     'worklet';
//     return createPicture((canvas: SkCanvas) => {
//       const vg = verticalGridPicture.value;
//       if (vg) {
//         canvas.drawPicture(vg);
//       }
//       const hg = horizontalGridPicture.value;
//       if (hg) {
//         canvas.drawPicture(hg);
//       }
//     });
//   });
//
//   return {
//     getPictures: () => ({
//       horizontalGrid: horizontalGridPicture,
//       verticalGrid: verticalGridPicture,
//       combined: combinedGridPicture,
//     }),
//   };
// };

export {};

