/**
 * COMMENTED OUT:
 * This module is not used by `LineChart` and has been intentionally commented
 * out as part of the "LineChart-only" pruning.
 *
 * Original implementation preserved below for reference.
 */
// import React from 'react';
// import { Picture } from '@shopify/react-native-skia';
// import { useDerivedValue } from 'react-native-reanimated';
// import { useCrosshairRenderer } from '../hooks/useCrosshairRenderer';
// import type { CanvasContext } from '@pulse/engine';
//
// export type CrosshairProps = {
//   context: CanvasContext | (() => CanvasContext);
// };
//
// export const Crosshair: React.FC<CrosshairProps> = ({ context }) => {
//   const contextValue = useDerivedValue(() => {
//     if (typeof context === 'function') {
//       return context();
//     }
//     return context;
//   });
//
//   const { getPictures } = useCrosshairRenderer(contextValue);
//
//   return <Picture picture={getPictures().crosshairPicture} />;
// };

export {};

