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
import { LineChart } from "@pulse/rn";

type PeriodKey = "1D" | "1W" | "1M" | "YTD";

interface ChartData {
  data: number[];
  timestamps: number[];
  endSec: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

// For testing: advance simulated timestamps by 5 seconds per update tick.
const LIVE_TIME_STEP_SEC = 5;

const getResolutionMinutesForPeriod = (period: PeriodKey): number => {
  // Mirrors the period → resolution logic you shared (just the periods we demo here).
  if (period === "1D") return 1; // 1m
  if (period === "1W") return 30; // 30m
  if (period === "1M") return 30; // 30m

  // YTD: dynamic resolution
  const startOfYearSec = Math.floor(
    new Date(new Date().getFullYear(), 0, 1).getTime() / 1000
  );
  const nowSec = Math.floor(Date.now() / 1000);
  const daysSinceYearStart = Math.floor(
    (nowSec - startOfYearSec) / (24 * 60 * 60)
  );
  const currentMonth = new Date().getMonth();
  const currentDate = new Date().getDate();

  if (currentMonth === 0 && currentDate === 1) return 1;
  if (currentMonth === 0 && daysSinceYearStart <= 7) return 15;
  if (currentMonth === 0) return 60;
  if (currentMonth <= 2 || daysSinceYearStart <= 90) return 240;
  if (daysSinceYearStart <= 180) return 1440;
  return 1440;
};

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

const generateInitialSeries = (period: PeriodKey): ChartData => {
  // Keep the underlying chart period semantics, but generate "live" ticks every 5s for testing.
  const stepSec = LIVE_TIME_STEP_SEC;
  const points =
    period === "1D" ? 600 : period === "1W" ? 600 : period === "1M" ? 600 : 600;

  // We intentionally use epoch seconds so the chart code exercises its seconds->ms normalization.
  const endSec = Math.floor(Date.now() / 1000);
  const startSec = endSec - (points - 1) * stepSec;

  let price = 163;
  const data: number[] = [];
  const timestamps: number[] = [];
  for (let i = 0; i < points; i++) {
    const ts = startSec + i * stepSec;
    // Random walk with a small drift and occasional spikes.
    const noise = (Math.random() - 0.5) * 0.25;
    const spike = Math.random() < 0.02 ? (Math.random() - 0.5) * 2.5 : 0;
    price = clamp(price + noise + spike, 150, 190);
    data.push(price);
    timestamps.push(ts);
  }

  return { data, timestamps, endSec };
};

const LiveLineChartExample: React.FC = () => {
  const [period, setPeriod] = useState<PeriodKey>("1D");
  const [isRunning, setIsRunning] = useState(true);
  // Faster default so updates are clearly visible for testing.
  const [speedMs, setSpeedMs] = useState(50);

  // Use a single state object to ensure atomic updates
  const [chartData, setChartData] = useState<ChartData>(() =>
    generateInitialSeries(period)
  );

  const endEpochSecRef = useRef(chartData.endSec);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset when period changes
  useEffect(() => {
    const newData = generateInitialSeries(period);
    setChartData(newData);
    endEpochSecRef.current = newData.endSec;
  }, [period]);

  // Update function that creates new array references
  const updateChart = useCallback(() => {
    setChartData((prev) => {
      const stepSec = LIVE_TIME_STEP_SEC;
      const nextTs = endEpochSecRef.current + stepSec;
      endEpochSecRef.current = nextTs;

      const lastPrice = prev.data[prev.data.length - 1] ?? 163;
      const noise = (Math.random() - 0.5) * 0.25;
      const spike = Math.random() < 0.02 ? (Math.random() - 0.5) * 2.5 : 0;
      const nextVal = clamp(lastPrice + noise + spike, 150, 190);

      // Create new arrays to ensure React detects the change
      const nextData = [...prev.data.slice(1), nextVal];
      const nextTimestamps = [...prev.timestamps.slice(1), nextTs];

      return {
        data: nextData,
        timestamps: nextTimestamps,
        endSec: nextTs,
      };
    });
  }, []);

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
  }, [period, chartData.endSec]);

  const handleReset = useCallback(() => {
    const newData = generateInitialSeries(period);
    setChartData(newData);
    endEpochSecRef.current = newData.endSec;
  }, [period]);

  const width = Math.min(Dimensions.get("window").width - 32, 420);
  const height = 220;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Line (synthetic)</Text>

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
              const speeds = [30, 50, 100, 250, 500] as const;
              const idx = speeds.indexOf(ms as (typeof speeds)[number]);
              return speeds[(idx + 1) % speeds.length] ?? 50;
            })
          }
        >
          <Text style={styles.btnText}>
            Speed: {speedMs}ms (Δt={LIVE_TIME_STEP_SEC}s)
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartWrap}>
        <LineChart
          fontSource={require("../assets/fonts/Geist-Regular.ttf")}
          data={chartData.data}
          timestamps={chartData.timestamps}
          period={period as any}
          marketStartTime={marketStartTime as any}
          marketCloseTime={marketCloseTime as any}
          width={width}
          height={height}
          color="#FF2D55"
          strokeWidth={1.4}
          showXAxis={true}
          showYAxis={true}
          xTickCount={5}
          yTickCount={7}
          showTooltip={true}
          tooltipPosition="top"
          yAxisPosition="right"
        />
      </View>
    </View>
  );
};

export default LiveLineChartExample;

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
  },
  btnTextActive: {
    color: "#fff",
  },
  chartWrap: {
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 12,
  },
});
