import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { FiberProvider } from 'its-fine';
import { Chart, createInitialMatrix } from '@pulse/rn';
import { createCanvasContextFromRN } from '@pulse/rn';
import { Dimensions } from 'react-native';
// Import types directly from their source files to avoid export issues
type CandleChartData = {
  candles: Array<[number, number, number, number, number, number | null]>;
  changeValue?: string | null;
  changePerc?: string | null;
  closingPrice?: number | null;
  startTimeEpochInMillis?: number;
};

type TimelineLabel = {
  candlePosition: number;
  timestamp: number;
  label: string;
};

type AssetInfo = {
  symbol: string;
  underlyinId: string;
  exchange: string;
  metaData: {
    displayName: string;
    assetType: string;
  };
};

export interface ChartViewProps {
  getAssetInfo: () => AssetInfo;
  onPressBack?: () => void;
  requestCandleChartData: (params: {
    endTimeInMillis: number;
    startTimeInMillis: number;
    intervalInMinutes: number;
    exchange: string;
    symbol: string;
    segment?: string;
  }) => Promise<CandleChartData>;
  trackEvent?: (params: {
    category: string;
    eventName: string;
    attributes: Record<string, any>;
  }) => void;
  subscribeToLiveData?: () => void;
  mode?: 'light' | 'dark';
  externalColors?: Record<string, string>;
  fontConfig?: any;
}

export const ChartView: React.FC<ChartViewProps> = ({
  getAssetInfo,
  onPressBack,
  requestCandleChartData,
  trackEvent,
  subscribeToLiveData,
  mode = 'light',
  externalColors,
  fontConfig,
}) => {
  const [chartData, setChartData] = useState<CandleChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assetInfo = useRef(getAssetInfo());
  // Initialize matrix with proper transform (scale and translate)
  const initialMatrix = createInitialMatrix();
  // Apply initial transform: scale(1,1) and translate(-50, 0) to offset first candle
  initialMatrix.postScale(1, 1);
  initialMatrix.postTranslate(-50, 0);
  const matrix = useSharedValue(initialMatrix);
  const chartDataShared = useSharedValue<CandleChartData>({
    candles: [],
    changePerc: null,
    changeValue: null,
    closingPrice: null,
  });

  // Get screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Track canvas size - Canvas will update this automatically
  const canvasSize = useSharedValue({ width: screenWidth, height: screenHeight });

  // Basic dimensions - update when canvas size changes
  const chartDimensions = useSharedValue({
    CHART_WIDTH: Math.max(100, screenWidth - 80), // Account for padding, ensure minimum
    CHART_HEIGHT: Math.max(100, screenHeight - 100), // Account for padding, ensure minimum
    PADDING_LEFT: 60,
    PADDING_RIGHT: 20,
    PADDING_TOP: 20,
    PADDING_BOTTOM: 40,
    yAxisHeight: 0,
  });


  const candleDimensions = useSharedValue({
    candleBodyWidth: 4,
    candleGap: 1,
    candleSpacing: 5,
  });

  const scaleDimensions = useSharedValue({
    MIN_SCALE_X: 0.08,
    MAX_SCALE_X: 12,
    MIN_SCALE_Y: 0.05,
    MAX_SCALE_Y: 20,
  });

  const bestFitHighLow = useSharedValue({
    highest: 0,
    lowest: 0,
  });

  const axisLabels = useSharedValue<TimelineLabel[]>([]);
  const chartMetadata = useSharedValue({ candleDataLength: 0 });

  const theme = mode === 'light' 
    ? {
        backgroundPrimary: '#FFFFFF',
        backgroundSecondary: '#F5F5F5',
        backgroundTertiary: '#E8E8E8',
        contentPositive: '#00C853',
        contentNegative: '#D32F2F',
        textPrimary: '#000000',
        textSecondary: '#666666',
        borderPrimary: '#E0E0E0',
        ...externalColors,
      }
    : {
        backgroundPrimary: '#000000',
        backgroundSecondary: '#1A1A1A',
        backgroundTertiary: '#2A2A2A',
        contentPositive: '#00C853',
        contentNegative: '#D32F2F',
        textPrimary: '#FFFFFF',
        textSecondary: '#CCCCCC',
        borderPrimary: '#333333',
        ...externalColors,
      };

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const asset = assetInfo.current;
      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;

      const data = await requestCandleChartData({
        endTimeInMillis: now,
        startTimeInMillis: oneDayAgo,
        intervalInMinutes: 1,
        exchange: asset.exchange,
        symbol: asset.symbol,
        segment: asset.metaData.assetType || 'CASH',
      });

      setChartData(data);

      setLoading(false);
      
      if (subscribeToLiveData) {
        subscribeToLiveData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart data');
      setLoading(false);
    }
  }, [requestCandleChartData, subscribeToLiveData, chartDataShared, bestFitHighLow, chartMetadata]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Update SharedValues as a side effect when chartData changes
  // This avoids accessing SharedValue.value during render or in callbacks
  useEffect(() => {
    if (chartData) {
      chartDataShared.value = chartData;
      chartMetadata.value = { candleDataLength: chartData.candles.length };

      // Calculate basic high/low from candles
      if (chartData.candles.length > 0) {
        let highest = chartData.candles[0][2]; // high
        let lowest = chartData.candles[0][3]; // low
        chartData.candles.forEach((candle: [number, number, number, number, number, number | null]) => {
          if (candle[2] > highest) highest = candle[2];
          if (candle[3] < lowest) lowest = candle[3];
        });
        bestFitHighLow.value = { highest, lowest };
      }
    }
  }, [chartData]);

  // Create context function - it reads SharedValues reactively when called
  // We need to recreate it when dependencies change to ensure reactivity
  const context = useMemo(() => {
    return createCanvasContextFromRN({
      matrix,
      chartData: chartDataShared,
      chartMetadata,
      chartDimensions,
      candleDimensions,
      scaleDimensions,
      bestFitHighLow,
      axisLabels,
      theme,
    });
  }, []); // Empty deps - the function reads SharedValues reactively

  // Use static values to avoid reading .value during render
  // These match the initial values set in the SharedValues above
  const candleSpacing = 5;
  const minScaleX = 0.08;
  const maxScaleX = 12;
  const minScaleY = 0.05;
  const maxScaleY = 20;

  if (loading) {
    return null; // You can add a loading component here
  }

  if (error) {
    return null; // You can add an error component here
  }

  if (!chartData || chartData.candles.length === 0) {
    return null;
  }

  return (
    <FiberProvider>
      <Chart
        context={context}
        matrix={matrix}
        showGrid={true}
        showCrosshair={true}
        canvasStyle={{ flex: 1 }}
        onSize={canvasSize}
        chartDimensions={chartDimensions}
        candleDataLength={chartData?.candles.length || 0}
        candleSpacing={candleSpacing}
        minScaleX={minScaleX}
        maxScaleX={maxScaleX}
        minScaleY={minScaleY}
        maxScaleY={maxScaleY}
      >
        {null}
      </Chart>
    </FiberProvider>
  );
};

