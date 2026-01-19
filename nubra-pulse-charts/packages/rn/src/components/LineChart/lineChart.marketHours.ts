/**
 * Market hours utilities for LineChart
 */

/**
 * Checks if market is currently open
 */
export const isMarketOpen = (
  isOneDayPeriod: boolean,
  isMarketOpenProp: boolean | undefined,
  marketStartTime: Date | number | undefined,
  marketCloseTime: Date | number | undefined
): boolean => {
  if (!isOneDayPeriod) return false;
  if (typeof isMarketOpenProp === "boolean") return isMarketOpenProp;

  const startMs =
    marketStartTime !== undefined && marketStartTime !== null
      ? new Date(marketStartTime as any).getTime()
      : null;
  const closeMs =
    marketCloseTime !== undefined && marketCloseTime !== null
      ? new Date(marketCloseTime as any).getTime()
      : null;

  // If no market times were provided, assume "open" for 1D
  if (!startMs || !closeMs) return true;
  const now = Date.now();
  return now >= startMs && now <= closeMs;
};
