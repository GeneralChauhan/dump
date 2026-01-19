/**
 * COMMENTED OUT:
 * Not used by `LineChart` (part of the candle chart stack).
 * Original implementation preserved below for reference.
 */
// import type { SkCanvas, SkPath, SkPaint } from '@shopify/react-native-skia';
// import type { CanvasContext } from '@pulse/engine';
// import {
//   getVisibleCandleRange,
//   priceToY,
// } from '@pulse/engine';
// import { candleDataToOHLC } from '@pulse/engine';
//
// export const renderCandleChart = (
//   canvas: SkCanvas,
//   context: CanvasContext,
//   paints: {
//     positivePaint: SkPaint;
//     negativePaint: SkPaint;
//     positiveLinePaint: SkPaint;
//     negativeLinePaint: SkPaint;
//   },
//   paths: {
//     positivePath: SkPath;
//     negativePath: SkPath;
//     positiveWickPath: SkPath;
//     negativeWickPath: SkPath;
//   }
// ) => {
//   'worklet';
//   if (
//     context.chartDimensions.CHART_WIDTH === 0 ||
//     context.chartDimensions.CHART_HEIGHT === 0 ||
//     context.chartMetadata.candleDataLength === 0
//   ) {
//     return;
//   }
//
//   canvas.concat(context.matrix);
//
//   const { firstVisibleIndex, lastVisibleIndex } = getVisibleCandleRange(
//     context.matrix,
//     context.chartMetadata.candleDataLength,
//     context.chartDimensions.CHART_WIDTH,
//     context.candleDimensions.candleSpacing
//   );
//
//   if (
//     Math.abs(lastVisibleIndex - context.chartMetadata.candleDataLength) < 15 &&
//     context.chartData.candles.length > 0 &&
//     context.onRequestHistoricalData
//   ) {
//     context.onRequestHistoricalData();
//   }
//
//   paths.positivePath.rewind();
//   paths.negativePath.rewind();
//   paths.positiveWickPath.rewind();
//   paths.negativeWickPath.rewind();
//
//   const halfBodyWidth = context.candleDimensions.candleBodyWidth / 2;
//   const chartHeight = context.chartDimensions.CHART_HEIGHT;
//   const chartWidth = context.chartDimensions.CHART_WIDTH;
//   const candleSpacing = context.candleDimensions.candleSpacing;
//   const highest = context.bestFitHighLow.highest;
//   const lowest = context.bestFitHighLow.lowest;
//
//   for (let index = firstVisibleIndex; index <= lastVisibleIndex; index++) {
//     const invertedIndex = Math.abs(
//       context.chartMetadata.candleDataLength - 1 - index
//     );
//     const d = candleDataToOHLC(context.chartData.candles[invertedIndex]);
//
//     if (!d || !d.high || !d.low || !d.open || !d.close) continue;
//
//     const x = -index * candleSpacing + chartWidth;
//
//     const highY = priceToY(d.high, chartHeight, highest, lowest);
//     const lowY = priceToY(d.low, chartHeight, highest, lowest);
//     const openY = priceToY(d.open, chartHeight, highest, lowest);
//     const closeY = priceToY(d.close, chartHeight, highest, lowest);
//
//     const isPositive = d.close >= d.open;
//     const bodyPath = isPositive ? paths.positivePath : paths.negativePath;
//     const wickPath = isPositive
//       ? paths.positiveWickPath
//       : paths.negativeWickPath;
//
//     wickPath.moveTo(x, highY);
//     wickPath.lineTo(x, lowY);
//
//     const bodyTop = Math.min(openY, closeY);
//     const bodyHeight = Math.abs(closeY - openY);
//
//     if (bodyHeight > 0.1) {
//       const rect = {
//         x: x - halfBodyWidth,
//         y: bodyTop,
//         width: context.candleDimensions.candleBodyWidth,
//         height: bodyHeight,
//       };
//       bodyPath.addRect(rect);
//     } else {
//       wickPath.moveTo(x - halfBodyWidth, openY);
//       wickPath.lineTo(x + halfBodyWidth, openY);
//     }
//   }
//
//   canvas.drawPath(paths.positiveWickPath, paints.positiveLinePaint);
//   canvas.drawPath(paths.negativeWickPath, paints.negativeLinePaint);
//   canvas.drawPath(paths.positivePath, paints.positivePaint);
//   canvas.drawPath(paths.negativePath, paints.negativePaint);
// };

export {};

