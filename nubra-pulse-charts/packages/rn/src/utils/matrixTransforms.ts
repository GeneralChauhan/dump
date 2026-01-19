/**
 * COMMENTED OUT:
 * Not used by `LineChart` (part of the gesture/matrix stack).
 * Original implementation preserved below for reference.
 */
// import { Skia, type SkMatrix } from '@shopify/react-native-skia';
// import { SharedValue } from 'react-native-reanimated';
//
// export const createInitialMatrix = (): SkMatrix => {
//   'worklet';
//   const initial = Skia.Matrix();
//   initial.postScale(1, 1);
//   initial.postTranslate(-50, 0);
//   return initial;
// };
//
// export const resetMatrix = (matrix: SharedValue<SkMatrix>) => {
//   'worklet';
//   matrix.value = createInitialMatrix();
// };
//
// export const scaleMatrixAround = (
//   sx: number,
//   sy: number,
//   matrix: SharedValue<SkMatrix>,
//   viewWidth: number,
//   viewHeight: number,
//   minScaleX: number,
//   maxScaleX: number,
//   minScaleY: number,
//   maxScaleY: number,
//   pivotX?: number,
//   pivotY?: number
// ) => {
//   'worklet';
//   const arr = [...matrix.value.get()];
//   const currentScaleX = arr[0];
//   const currentScaleY = arr[4];
//
//   let targetScaleX = currentScaleX * sx;
//   let targetScaleY = currentScaleY * sy;
//
//   if (targetScaleX < minScaleX) targetScaleX = minScaleX;
//   if (targetScaleX > maxScaleX) targetScaleX = maxScaleX;
//   if (targetScaleY < minScaleY) targetScaleY = minScaleY;
//   if (targetScaleY > maxScaleY) targetScaleY = maxScaleY;
//
//   const adjSX = targetScaleX / currentScaleX;
//   const adjSY = targetScaleY / currentScaleY;
//
//   if (adjSX === 1 && adjSY === 1) return;
//
//   const px = pivotX ?? viewWidth / 2;
//   const py = pivotY ?? viewHeight / 2;
//
//   const m = Skia.Matrix(arr);
//   m.postTranslate(-px, -py);
//   m.postScale(adjSX, adjSY);
//   m.postTranslate(px, py);
//
//   matrix.value = m;
// };
//
// export const translateMatrix = (
//   dx: number,
//   dy: number,
//   matrix: SharedValue<SkMatrix>,
//   candleDataLength: number,
//   chartWidth: number,
//   candleSpacing: number
// ) => {
//   'worklet';
//   const arr = [...matrix.value.get()];
//   const scaleX = arr[0];
//   let transX = arr[2] + dx;
//   let transY = arr[5] + dy;
//
//   const contentWidth = candleDataLength * candleSpacing * scaleX;
//   const viewWidth = chartWidth * scaleX;
//   const minTranslateX = -viewWidth;
//   const maxTranslateX = contentWidth + chartWidth;
//   transX = Math.max(minTranslateX, Math.min(maxTranslateX, transX));
//
//   arr[2] = transX;
//   arr[5] = transY;
//   matrix.value = Skia.Matrix(arr);
// };
//
// export const copyXComponents = (target: SkMatrix, source: SkMatrix): SkMatrix => {
//   'worklet';
//   const result = [...target.get()];
//   const sourceMatrix = source.get();
//
//   result[0] = sourceMatrix[0];
//   result[1] = sourceMatrix[1];
//   result[2] = sourceMatrix[2];
//
//   return Skia.Matrix(result);
// };

export {};

