import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart, useLivePriceUpdates, periodToResolution } from "@pulse/rn";
import type { LiveUpdateData, OHLCBar } from "@pulse/engine";

type PeriodKey = "1D" | "1W" | "1M" | "YTD";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

// For testing: advance simulated timestamps by 5 seconds per update tick.
const LIVE_TIME_STEP_SEC = 5;

const buildMarketHours = (endEpochSec: number) => {
  // Market hours: 9:30 AM to 4:00 PM (local device timezone)
  const endDate = new Date(endEpochSec * 1000);
  const day = new Date(endDate);
  day.setHours(0, 0, 0, 0);

  const start = new Date(day);
  start.setHours(9, 30, 0, 0);

  const close = new Date(day);
  close.setHours(16, 0, 0, 0);

  return { marketStartTime: start, marketCloseTime: close };
};

const generateInitialBars = (
  period: PeriodKey,
  count: number = 1000
): OHLCBar[] => {
  const endSec = Math.floor(Date.now() / 1000);
  const resolution = periodToResolution(period);

  // Calculate resolution in seconds
  const getResolutionSeconds = (res: string): number => {
    const resUpper = res.toUpperCase().trim();
    if (resUpper === "1" || /^\d+$/.test(resUpper)) {
      return parseInt(resUpper, 10) * 60;
    }
    if (resUpper.endsWith("H")) {
      return parseInt(resUpper.replace("H", ""), 10) * 60 * 60;
    }
    if (resUpper.endsWith("D")) {
      return parseInt(resUpper.replace("D", ""), 10) * 24 * 60 * 60;
    }
    if (resUpper.endsWith("W")) {
      return parseInt(resUpper.replace("W", ""), 10) * 7 * 24 * 60 * 60;
    }
    return 60; // Default to 1 minute
  };

  const resolutionSec = getResolutionSeconds(resolution);
  const startSec = endSec - (count - 1) * resolutionSec;

  let price = 163;
  const bars: OHLCBar[] = [];

  for (let i = 0; i < count; i++) {
    const barTime = startSec + i * resolutionSec;
    // Random walk with a small drift and occasional spikes.
    const noise = (Math.random() - 0.5) * 0.25;
    const spike = Math.random() < 0.02 ? (Math.random() - 0.5) * 2.5 : 0;
    price = clamp(price + noise + spike, 150, 190);

    // Create OHLC bar
    const open = price;
    const high = price + Math.abs(Math.random() * 0.5);
    const low = price - Math.abs(Math.random() * 0.5);
    const close = price + (Math.random() - 0.5) * 0.3;
    const volume = Math.floor(Math.random() * 100000) + 10000;

    bars.push({
      time: barTime,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return bars;
};

const TradingViewLiveExample: React.FC = () => {
  const [period, setPeriod] = useState<PeriodKey>("1D");
  const [isRunning, setIsRunning] = useState(true);
  const [speedMs, setSpeedMs] = useState(100);

  const resolution = periodToResolution(period);
  const { data, timestamps, lastBar, updatePrice, reset, setBars } =
    useLivePriceUpdates({
      resolution,
      initialBars: [],
      maxBars: 1000,
    });

  const endEpochSecRef = useRef(Math.floor(Date.now() / 1000));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPriceRef = useRef(163);

  // Initialize bars when period changes
  useEffect(() => {
    const initialBars = generateInitialBars(period, 100);
    setBars(initialBars);
    if (initialBars.length > 0) {
      const lastBar = initialBars[initialBars.length - 1];
      lastPriceRef.current = lastBar.close;
      endEpochSecRef.current = lastBar.time;
    }
  }, [period, setBars]);

  // Update function that creates new live update data
  const updateChart = useCallback(() => {
    const stepSec = LIVE_TIME_STEP_SEC;
    const currentTime = endEpochSecRef.current + stepSec;
    endEpochSecRef.current = currentTime;

    // Generate new price update
    const lastPrice = lastPriceRef.current;
    const noise = (Math.random() - 0.5) * 0.25;
    const spike = Math.random() < 0.02 ? (Math.random() - 0.5) * 2.5 : 0;
    const newPrice = clamp(lastPrice + noise + spike, 150, 190);
    lastPriceRef.current = newPrice;

    // Create live update data (timestamp in microseconds)
    const update: LiveUpdateData = {
      timestamp: currentTime * 1e6, // Convert seconds to microseconds
      open: newPrice,
      high: newPrice + Math.abs(Math.random() * 0.5),
      low: newPrice - Math.abs(Math.random() * 0.5),
      close: newPrice + (Math.random() - 0.5) * 0.3,
      bucketVolume: Math.floor(Math.random() * 5000) + 1000,
    };

    updatePrice(update);
  }, [updatePrice]);

  // Live update interval
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(updateChart, speedMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, speedMs, updateChart]);

  const { marketStartTime, marketCloseTime } = useMemo(() => {
    if (period !== "1D")
      return { marketStartTime: undefined, marketCloseTime: undefined };
    const endSec = endEpochSecRef.current;
    return buildMarketHours(endSec);
  }, [period, endEpochSecRef.current]);

  const handleReset = useCallback(() => {
    reset();
    const initialBars = generateInitialBars(period, 100);
    setBars(initialBars);
    if (initialBars.length > 0) {
      const lastBar = initialBars[initialBars.length - 1];
      lastPriceRef.current = lastBar.close;
      endEpochSecRef.current = lastBar.time;
    }
  }, [period, reset, setBars]);

  const width = Math.min(Dimensions.get("window").width - 32, 420);
  const height = 220;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TradingView Live Updates</Text>
      <Text style={styles.subtitle}>
        Resolution: {resolution} | Bars: {data.length} | Last:{" "}
        {lastBar ? lastBar.close.toFixed(2) : "N/A"}
      </Text>

      <View style={styles.controlsRow}>
        {(["1D", "1W", "1M", "YTD"] as PeriodKey[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.chip, period === p && styles.chipActive]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[styles.chipText, period === p && styles.chipTextActive]}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.btn, isRunning && styles.btnActive]}
          onPress={() => setIsRunning((v) => !v)}
        >
          <Text style={[styles.btnText, isRunning && styles.btnTextActive]}>
            {isRunning ? "Pause" : "Play"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={handleReset}>
          <Text style={styles.btnText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            setSpeedMs((ms) => {
              const speeds = [50, 100, 250, 500, 1000] as const;
              const idx = speeds.indexOf(ms as (typeof speeds)[number]);
              return speeds[(idx + 1) % speeds.length] ?? 100;
            })
          }
        >
          <Text style={styles.btnText}>Speed: {speedMs}ms</Text>
        </TouchableOpacity>
      </View>

      {lastBar && (
        <View style={styles.barInfo}>
          <Text style={styles.barInfoText}>
            OHLC: O:{lastBar.open.toFixed(2)} H:{lastBar.high.toFixed(2)} L:
            {lastBar.low.toFixed(2)} C:{lastBar.close.toFixed(2)} V:
            {lastBar.volume?.toLocaleString() || 0}
          </Text>
        </View>
      )}

      <View style={styles.chartWrap}>
        {data.length > 0 ? (
          <LineChart
            fontSource={require("../assets/fonts/Geist-Regular.ttf")}
            data={data}
            showTooltipCircle={false}
            timestamps={timestamps}
            period={period as any}
            marketStartTime={marketStartTime as any}
            marketCloseTime={marketCloseTime as any}
            width={width + 10}
            height={height}
            color="#FF2D55"
            strokeWidth={1.3}
            showArea={true}
            xTickCount={5}
            yTickCount={7}
            showTooltip={true}
            tooltipPosition="top"
            showYAxis={true}
            yAxisPosition="right"
          />
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>No data yet...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default TradingViewLiveExample;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  controlsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  chipActive: {
    borderColor: "#FF2D55",
    backgroundColor: "rgba(255,45,85,0.12)",
  },
  chipText: {
    color: "#444",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#FF2D55",
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  btnActive: {
    borderColor: "#FF2D55",
    backgroundColor: "#FF2D55",
  },
  btnText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 12,
  },
  btnTextActive: {
    color: "#fff",
  },
  barInfo: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
  },
  barInfoText: {
    fontSize: 11,
    color: "#666",
    fontFamily: "monospace",
  },
  chartWrap: {
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 12,
    minHeight: 220,
  },
  emptyChart: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
  },
});
