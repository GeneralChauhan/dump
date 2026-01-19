/**
 * COMMENTED OUT:
 * Not used by `LineChart` (part of the pinch gesture stack).
 * Original implementation preserved below for reference.
 */
// import { Gesture } from 'react-native-gesture-handler';
// import { useSharedValue } from 'react-native-reanimated';
//
// export type DirectionalPinchGestureOnChange = {
//   scaleChangeX: number;
//   scaleChangeY: number;
//   focalX: number;
//   focalY: number;
// };
//
// export const useDirectionalPinch = ({
//   sensitivityFactor = 1.0,
//   xAxisZoomThreshold = 0.4,
//   yAxisZoomThreshold = 2.5,
//   minZoomThreshold = 5.0,
//   onChange,
//   onStart,
//   onEnd,
// }: {
//   sensitivityFactor?: number;
//   xAxisZoomThreshold?: number;
//   yAxisZoomThreshold?: number;
//   minZoomThreshold?: number;
//   onChange: (e: DirectionalPinchGestureOnChange) => void;
//   onStart: () => void;
//   onEnd: () => void;
// }) => {
//   const touchStartPoint = useSharedValue({ x: 0, y: 0 });
//   const previousSpanX = useSharedValue(0);
//   const previousSpanY = useSharedValue(0);
//
//   const getModifiedScaleFactor = (scaleFactor: number): number => {
//     'worklet';
//     if (scaleFactor < 1) {
//       return scaleFactor / sensitivityFactor;
//     } else {
//       return scaleFactor * sensitivityFactor;
//     }
//   };
//
//   const chartPinch = Gesture.Manual()
//     .onTouchesDown((e) => {
//       'worklet';
//       if (e.allTouches.length === 2) {
//         const touch1 = e.allTouches[0];
//         const touch2 = e.allTouches[1];
//
//         touchStartPoint.value = {
//           x: (touch1.x + touch2.x) / 2,
//           y: (touch1.y + touch2.y) / 2,
//         };
//
//         previousSpanX.value = Math.abs(touch2.x - touch1.x);
//         previousSpanY.value = Math.abs(touch2.y - touch1.y);
//         onStart?.();
//       }
//     })
//     .onTouchesMove((e) => {
//       'worklet';
//
//       if (e.allTouches.length === 2) {
//         const touch1 = e.allTouches[0];
//         const touch2 = e.allTouches[1];
//
//         const currentSpanX = Math.abs(touch2.x - touch1.x);
//         const currentSpanY = Math.abs(touch2.y - touch1.y);
//         const deltaSpanX = Math.abs(currentSpanX - previousSpanX.value);
//         const deltaSpanY = Math.abs(currentSpanY - previousSpanY.value);
//
//         if (deltaSpanX < minZoomThreshold && deltaSpanY < minZoomThreshold) {
//           return;
//         }
//
//         const safeSpanX = Math.max(currentSpanX, 0.1);
//         const tanTheta = currentSpanY / safeSpanX;
//
//         const scaleFactorRaw = currentSpanX / previousSpanX.value;
//
//         let scaleFactorX = 1;
//         let scaleFactorY = 1;
//
//         if (tanTheta > yAxisZoomThreshold) {
//           scaleFactorY = getModifiedScaleFactor(
//             currentSpanY / previousSpanY.value
//           );
//         } else if (tanTheta < xAxisZoomThreshold) {
//           scaleFactorX = getModifiedScaleFactor(scaleFactorRaw);
//         } else {
//           scaleFactorX = getModifiedScaleFactor(scaleFactorRaw);
//           scaleFactorY = getModifiedScaleFactor(
//             currentSpanY / previousSpanY.value
//           );
//         }
//
//         onChange?.({
//           scaleChangeX: scaleFactorX,
//           scaleChangeY: scaleFactorY,
//           focalX: touchStartPoint.value.x,
//           focalY: touchStartPoint.value.y,
//         });
//
//         previousSpanX.value = currentSpanX;
//         previousSpanY.value = currentSpanY;
//       }
//     })
//     .onTouchesUp(() => {
//       'worklet';
//       previousSpanX.value = 0;
//       previousSpanY.value = 0;
//       onEnd?.();
//     });
//
//   return chartPinch;
// };

export {};

