import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import {
  initialWindowMetrics,
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import { useState } from "react";
import { ChartView } from "./components/ChartView";
import { useFonts } from "expo-font";

import LineChartExample from "./components/LineChartExample";
import LiveLineChartExample from "./components/LiveLineChartExample";
import type { CandleChartData } from "@pulse/engine";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import TradingViewLiveExample from "./components/TradingViewLiveExample";

type ExampleType =
  | "candle"
  | "bar"
  | "line"
  | "line-live"
  | "pie"
  | "graph"
  | "trading-view";

const paddingTop = StatusBar.currentHeight;

export default function App() {
  const [selectedExample, setSelectedExample] =
    useState<ExampleType>("trading-view");
  const [fontsLoaded] = useFonts({
    "Geist-Black": require("./assets/fonts/Geist-Black.ttf"),
    "Geist-Bold": require("./assets/fonts/Geist-Bold.ttf"),
    "Geist-ExtraBold": require("./assets/fonts/Geist-ExtraBold.ttf"),
    "Geist-ExtraLight": require("./assets/fonts/Geist-ExtraLight.ttf"),
    "Geist-Light": require("./assets/fonts/Geist-Light.ttf"),
    "Geist-Medium": require("./assets/fonts/Geist-Medium.ttf"),
    "Geist-Regular": require("./assets/fonts/Geist-Regular.ttf"),
    "Geist-SemiBold": require("./assets/fonts/Geist-SemiBold.ttf"),
    "Geist-Thin": require("./assets/fonts/Geist-Thin.ttf"),
  });

  if (!fontsLoaded) {
    // You might show a loading indicator or splash screen here
    return null;
  }
  const fetchCandlesData = ({
    endTimeInMillis,
    startTimeInMillis,
    intervalInMinutes,
    exchange,
    symbol,
  }: {
    endTimeInMillis: number;
    startTimeInMillis: number;
    intervalInMinutes: number;
    exchange: string;
    symbol: string;
  }) => {
    return new Promise<CandleChartData>((resolve) => {
      // Generate dummy candle data
      const candles: Array<
        [number, number, number, number, number, number | null]
      > = [];
      const totalMinutes = (endTimeInMillis - startTimeInMillis) / (1000 * 60);
      const numCandles = Math.floor(totalMinutes / intervalInMinutes);

      // Base price for generating realistic-looking data
      const basePrice = 25000;
      let currentPrice = basePrice;

      // Generate candles
      for (let i = 0; i < numCandles; i++) {
        const candleTime = Math.floor(
          (startTimeInMillis + i * intervalInMinutes * 60 * 1000) / 1000
        );

        // Simulate price movement with some randomness
        const change = (Math.random() - 0.5) * 100; // Random change between -50 and +50
        const open = currentPrice;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 20;
        const low = Math.min(open, close) - Math.random() * 20;
        const volume = Math.floor(Math.random() * 1000000) + 100000;

        candles.push([candleTime, open, high, low, close, volume]);
        currentPrice = close;
      }

      // Calculate change values
      if (candles.length > 0) {
        const firstCandle = candles[0];
        const lastCandle = candles[candles.length - 1];
        const firstClose = firstCandle[4];
        const lastClose = lastCandle[4];
        const changeValue = lastClose - firstClose;
        const changePerc = ((changeValue / firstClose) * 100).toFixed(2);

        resolve({
          candles,
          changeValue: changeValue.toFixed(2),
          changePerc: changePerc,
          closingPrice: lastClose,
          startTimeEpochInMillis: startTimeInMillis,
        });
      } else {
        resolve({
          candles: [],
          changeValue: null,
          changePerc: null,
          closingPrice: null,
          startTimeEpochInMillis: startTimeInMillis,
        });
      }
    });
  };

  const renderExample = () => {
    switch (selectedExample) {
      case "candle":
        return (
          <ChartView
            getAssetInfo={() => {
              return {
                exchange: "NSE",
                metaData: { assetType: "CASH", displayName: "BSE" },
                symbol: "BSE",
                underlyinId: "",
              };
            }}
            onPressBack={() => {}}
            requestCandleChartData={(params) => {
              return fetchCandlesData({
                endTimeInMillis: params.endTimeInMillis,
                startTimeInMillis: params.startTimeInMillis,
                intervalInMinutes: params.intervalInMinutes,
                exchange: params.exchange,
                symbol: params.symbol,
              });
            }}
            trackEvent={() => {}}
            subscribeToLiveData={() => {}}
            mode="light"
          />
        );
      case "line":
        return <LineChartExample />;
      case "line-live":
        return <LiveLineChartExample />;
      case "trading-view":
        return <TradingViewLiveExample />;
      default:
        return null;
    }
  };

  const examples: { key: ExampleType; label: string }[] = [
    { key: "candle", label: "Candle Chart" },
    { key: "line", label: "Line Chart" },
    { key: "line-live", label: "Live Line" },
    { key: "trading-view", label: "TradingView Live" },
  ];

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { fontFamily: "Geist-Bold" }]}>
              Celeris Charts Examples
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabContainer}
            >
              {examples.map((example) => (
                <TouchableOpacity
                  key={example.key}
                  style={[
                    styles.tab,
                    selectedExample === example.key && styles.tabActive,
                  ]}
                  onPress={() => setSelectedExample(example.key)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      selectedExample === example.key && styles.tabTextActive,
                    ]}
                  >
                    {example.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.content}>{renderExample()}</View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    fontFamily: "Geist-Bold",
  },
  header: {
    backgroundColor: "#f8f8f8",
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#333",
  },
  tabContainer: {
    paddingHorizontal: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontFamily: "SF-Pro-Text-Regular",
  },
  tabActive: {
    backgroundColor: "#4F8EF7",
    borderColor: "#4F8EF7",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    fontFamily: "Geist-Light",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Geist-Bold",
  },
  content: {
    flex: 1,
  },
});
