/**
 * Data processing utilities for LineChart
 * Handles data sampling, timestamp normalization, and bucketing
 */

/**
 * Gets resolution in minutes for a given period
 */
export const getResolutionMinutesForPeriod = (
  periodKey: string
): number | null => {
  if (periodKey === "ONE_DAY" || periodKey === "1D") return 1; // 1m
  if (periodKey === "ONE_WEEK" || periodKey === "1W") return 30; // 30m
  if (periodKey === "ONE_MONTH" || periodKey === "1M") return 30; // 30m
  if (periodKey === "ONE_YEAR" || periodKey === "1Y") return 1440; // 1d
  if (periodKey === "FIVE_YEARS" || periodKey === "5Y") return 7 * 24 * 60; // 1w
  if (periodKey === "YEAR_TO_DATE" || periodKey === "YTD") {
    const startOfYearMs = new Date(
      new Date().getFullYear(),
      0,
      1
    ).getTime();
    const nowMs = Date.now();
    const daysSinceYearStart = Math.floor(
      (nowMs - startOfYearMs) / (24 * 60 * 60 * 1000)
    );
    const currentMonth = new Date().getMonth();
    const currentDate = new Date().getDate();
    if (currentMonth === 0 && currentDate === 1) return 1; // 1m
    if (currentMonth === 0 && daysSinceYearStart <= 7) return 15; // 15m
    if (currentMonth === 0) return 60; // 1h
    if (currentMonth <= 2 || daysSinceYearStart <= 90) return 240; // 4h
    if (daysSinceYearStart <= 180) return 1440; // 1d
    return 1440; // 1d
  }
  return null;
};

/**
 * Normalizes and processes timestamps and data
 * - Converts seconds to milliseconds if needed
 * - Sorts by timestamp
 * - Deduplicates identical timestamps
 */
export const normalizeTimestamps = (
  data: number[],
  timestamps?: number[]
): { data: number[]; timestamps: number[] | undefined } => {
  if (!timestamps || timestamps.length !== data.length) {
    return { data, timestamps: undefined };
  }

  // Detect if timestamps are in seconds (less than 1 trillion)
  let maxTs = 0;
  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i] ?? 0;
    if (ts > maxTs) maxTs = ts;
  }
  const isSeconds = maxTs > 0 && maxTs < 1_000_000_000_000;

  // Create pairs and normalize
  const pairs = timestamps.map((ts, i) => ({
    ts: (ts ?? 0) * (isSeconds ? 1000 : 1),
    v: data[i] as number,
  }));

  // Sort by timestamp
  pairs.sort((a, b) => a.ts - b.ts);

  // Deduplicate identical timestamps (keep last value)
  const deduped: { ts: number; v: number }[] = [];
  for (let i = 0; i < pairs.length; i++) {
    const last = deduped[deduped.length - 1];
    const cur = pairs[i];
    if (last && last.ts === cur.ts) {
      last.v = cur.v;
    } else {
      deduped.push({ ts: cur.ts, v: cur.v });
    }
  }

  return {
    data: deduped.map((p) => p.v),
    timestamps: deduped.map((p) => p.ts),
  };
};

/**
 * Buckets data points by time intervals based on period resolution
 */
export const bucketDataByResolution = (
  data: number[],
  timestamps: number[],
  resolutionMinutes: number
): { data: number[]; timestamps: number[] } => {
  const bucketMs = resolutionMinutes * 60 * 1000;
  const buckets = new Map<number, { ts: number; v: number }>();

  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i] ?? 0;
    const v = data[i] as number;
    const key = Math.floor(ts / bucketMs);
    // Keep the latest sample in the bucket
    buckets.set(key, { ts, v });
  }

  const keys = Array.from(buckets.keys()).sort((a, b) => a - b);
  return {
    data: keys.map((k) => buckets.get(k)!.v),
    timestamps: keys.map((k) => buckets.get(k)!.ts),
  };
};

/**
 * Processes and samples data for chart display
 */
export const processChartData = (
  data: number[],
  timestamps: number[] | undefined,
  period: string | undefined
): { sampledData: number[]; sampledTimestamps: number[] | undefined } => {
  let processedData = data;
  let processedTimestamps = timestamps;

  // Validate timestamp alignment
  if (
    processedTimestamps &&
    processedTimestamps.length !== processedData.length
  ) {
    processedTimestamps = undefined;
  }

  // Normalize and sort timestamps
  if (
    processedTimestamps &&
    processedTimestamps.length === processedData.length
  ) {
    const normalized = normalizeTimestamps(processedData, processedTimestamps);
    processedData = normalized.data;
    processedTimestamps = normalized.timestamps;
  }

  // Bucket by periodicity if timestamps are available
  if (
    processedTimestamps &&
    processedTimestamps.length === processedData.length
  ) {
    const periodKey = typeof period === "string" ? period.toUpperCase() : "";
    const resolutionMinutes = getResolutionMinutesForPeriod(periodKey);
    if (resolutionMinutes) {
      const bucketed = bucketDataByResolution(
        processedData,
        processedTimestamps,
        resolutionMinutes
      );
      processedData = bucketed.data;
      processedTimestamps = bucketed.timestamps;
    }
  }

  return {
    sampledData: processedData,
    sampledTimestamps: processedTimestamps,
  };
};

/**
 * Computes time domain from timestamps
 */
export const computeTimeDomain = (
  timestamps: number[] | undefined
): { start: number; end: number; spanMs: number } | null => {
  if (!timestamps || timestamps.length < 2) {
    return null;
  }

  let minTs = Number.POSITIVE_INFINITY;
  let maxTs = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];
    if (typeof ts !== "number") continue;
    if (ts < minTs) minTs = ts;
    if (ts > maxTs) maxTs = ts;
  }

  if (!isFinite(minTs) || !isFinite(maxTs)) {
    return null;
  }

  return { start: minTs, end: maxTs, spanMs: Math.abs(maxTs - minTs) };
};
