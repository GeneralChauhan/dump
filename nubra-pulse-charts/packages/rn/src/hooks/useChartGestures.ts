/**
 * COMMENTED OUT:
 * Not used by `LineChart` (part of the interactive pan/zoom chart stack).
 * Original implementation preserved below for reference.
 */
// import {
//   SharedValue,
//   useSharedValue,
// } from 'react-native-reanimated';
// import { Gesture } from 'react-native-gesture-handler';
// import { type SkMatrix } from '@shopify/react-native-skia';
// import { scaleMatrixAround, translateMatrix, resetMatrix } from '../utils/matrixTransforms';
// import { useDirectionalPinch, DirectionalPinchGestureOnChange } from './useDirectionalPinch';
// import type { ChartDimensions } from '@pulse/engine';
//
// export type UseChartGesturesParams = {
//   matrix: SharedValue<SkMatrix>;
//   chartDimensions: SharedValue<ChartDimensions>;
//   candleDataLength: number;
//   candleSpacing: number;
//   minScaleX?: number;
//   maxScaleX?: number;
//   minScaleY?: number;
//   maxScaleY?: number;
//   onMatrixChange?: (matrix: SkMatrix) => void;
//   isbestFit?: SharedValue<boolean>;
//   flushPendingUpdate?: () => void;
// };
//
// export const useChartGestures = ({
//   matrix,
//   chartDimensions,
//   candleDataLength,
//   candleSpacing,
//   minScaleX = 0.2,
//   maxScaleX = 5,
//   minScaleY = 0.2,
//   maxScaleY = 5,
//   onMatrixChange,
//   isbestFit,
//   flushPendingUpdate: externalFlushPendingUpdate,
// }: UseChartGesturesParams) => {
//   const pendingTranslation = useSharedValue({ x: 0, y: 0 });
//   const rafId = useSharedValue<number | null>(null);
//   const isPinchGestureActive = useSharedValue(false);
//   const isbestFitInternal = isbestFit || useSharedValue(true);
//
//   const applyPendingTransform = () => {
//     'worklet';
//     const deltaX = pendingTranslation.value.x;
//     const deltaY = pendingTranslation.value.y;
//
//     if (deltaX !== 0 || deltaY !== 0) {
//       translateMatrix(
//         deltaX,
//         deltaY,
//         matrix,
//         candleDataLength,
//         chartDimensions.value.CHART_WIDTH,
//         candleSpacing
//       );
//       if (onMatrixChange) {
//         onMatrixChange(matrix.value);
//       }
//       pendingTranslation.value = { x: 0, y: 0 };
//     }
//
//     rafId.value = null;
//   };
//
//   const scheduleUpdate = () => {
//     'worklet';
//     if (rafId.value === null) {
//       rafId.value = requestAnimationFrame(applyPendingTransform);
//     }
//   };
//
//   const flushPendingUpdate = () => {
//     'worklet';
//     if (rafId.value !== null) {
//       cancelAnimationFrame(rafId.value);
//       rafId.value = null;
//     }
//     applyPendingTransform();
//   };
//
//   const chartPan = Gesture.Pan()
//     .maxPointers(1)
//     .minPointers(1)
//     .onStart(() => {
//       'worklet';
//     })
//     .onChange((e) => {
//       'worklet';
//
//       if (isPinchGestureActive.value) {
//         return;
//       }
//
//       pendingTranslation.value = {
//         x: pendingTranslation.value.x + e.changeX * 1.5,
//         y:
//           pendingTranslation.value.y + (!isbestFitInternal.value ? e.changeY * 1.5 : 0),
//       };
//
//       scheduleUpdate();
//     })
//     .onEnd(() => {
//       'worklet';
//       if (externalFlushPendingUpdate) {
//         externalFlushPendingUpdate();
//       } else {
//         flushPendingUpdate();
//       }
//     })
//     .onFinalize(() => {
//       'worklet';
//       if (externalFlushPendingUpdate) {
//         externalFlushPendingUpdate();
//       } else {
//         flushPendingUpdate();
//       }
//     });
//
//   const onStart = () => {
//     'worklet';
//     isPinchGestureActive.value = true;
//   };
//
//   const onChange = (e: DirectionalPinchGestureOnChange) => {
//     'worklet';
//     if (isbestFitInternal) {
//       isbestFitInternal.value = false;
//     }
//
//     scaleMatrixAround(
//       e.scaleChangeX,
//       e.scaleChangeY,
//       matrix,
//       chartDimensions.value.CHART_WIDTH,
//       chartDimensions.value.CHART_HEIGHT,
//       minScaleX,
//       maxScaleX,
//       minScaleY,
//       maxScaleY,
//       e.focalX,
//       e.focalY
//     );
//
//     if (onMatrixChange) {
//       onMatrixChange(matrix.value);
//     }
//   };
//
//   const onEnd = () => {
//     'worklet';
//     if (externalFlushPendingUpdate) {
//       externalFlushPendingUpdate();
//     } else {
//       flushPendingUpdate();
//     }
//     isPinchGestureActive.value = false;
//   };
//
//   const chartPinch = useDirectionalPinch({
//     onStart,
//     onChange,
//     onEnd,
//   });
//
//   const resetChart = () => {
//     resetMatrix(matrix);
//     if (isbestFitInternal) {
//       isbestFitInternal.value = true;
//     }
//     if (onMatrixChange) {
//       onMatrixChange(matrix.value);
//     }
//   };
//
//   return {
//     chartPan,
//     chartPinch,
//     resetChart,
//   };
// };

export {};
