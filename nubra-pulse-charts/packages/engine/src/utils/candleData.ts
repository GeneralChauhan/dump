/**
 * COMMENTED OUT:
 * Not used by the RN `LineChart` component (candle-chart only).
 * Original implementation preserved below for reference.
 */
// export const candleDataToOHLC = (
//   candleData: [number, number, number, number, number, number | null]
// ) => {
//   'worklet';
//   if (!candleData) return null;
//   return {
//     time: candleData[0] * 1000,
//     open: candleData[1],
//     high: candleData[2],
//     low: candleData[3],
//     close: candleData[4],
//     volume: candleData[5],
//   };
// };
//
// export const ohlcToCandleData = (
//   ohlc: {
//     time: number;
//     open: number;
//     high: number;
//     low: number;
//     close: number;
//     volume?: number;
//   },
//   currentTime?: number
// ): Array<[number, number, number, number, number, number | null]> => {
//   'worklet';
//   return [
//     [
//       currentTime ?? ohlc.time,
//       ohlc.open,
//       ohlc.high,
//       ohlc.low,
//       ohlc.close,
//       ohlc.volume ?? null,
//     ],
//   ];
// };

export {};

