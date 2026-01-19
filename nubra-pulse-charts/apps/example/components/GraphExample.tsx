import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Graph, type LinePoint, type Candle } from '@pulse/rn';

const GraphExample: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'line' | 'candlestick'>('line');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ONE_DAY');

  // Generate sample line data
  const generateLineData = (count: number): LinePoint[] => {
    const now = Date.now();
    const data: LinePoint[] = [];
    let basePrice = 25000;

    for (let i = 0; i < count; i++) {
      const timestamp = now - (count - i) * 60000; // 1 minute intervals
      const change = (Math.random() - 0.5) * 100;
      basePrice = basePrice + change;
      data.push({
        timestamp,
        value: basePrice,
      });
    }
    return data;
  };

  // Generate sample candle data
  const generateCandleData = (count: number): Candle[] => {
    const now = Date.now();
    const data: Candle[] = [];
    let basePrice = 25000;

    for (let i = 0; i < count; i++) {
      const timestamp = now - (count - i) * 60000; // 1 minute intervals
      const change = (Math.random() - 0.5) * 100;
      const open = basePrice;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 20;
      const low = Math.min(open, close) - Math.random() * 20;
      basePrice = close;

      data.push({
        timestamp,
        open,
        high,
        low,
        close,
      });
    }
    return data;
  };

  const lineData = generateLineData(100);
  const candleData = generateCandleData(100);

  const periods = [
    { label: '1D', value: 'ONE_DAY' },
    { label: '1W', value: 'ONE_WEEK' },
    { label: '1M', value: 'ONE_MONTH' },
    { label: '1Y', value: 'ONE_YEAR' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Graph Examples</Text>

        {/* Type selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>Chart Type:</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, selectedType === 'line' && styles.buttonActive]}
              onPress={() => setSelectedType('line')}
            >
              <Text style={[styles.buttonText, selectedType === 'line' && styles.buttonTextActive]}>
                Line
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, selectedType === 'candlestick' && styles.buttonActive]}
              onPress={() => setSelectedType('candlestick')}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedType === 'candlestick' && styles.buttonTextActive,
                ]}
              >
                Candlestick
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Period selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>Period:</Text>
          <View style={styles.buttonRow}>
            {periods.map(period => (
              <TouchableOpacity
                key={period.value}
                style={[styles.button, selectedPeriod === period.value && styles.buttonActive]}
                onPress={() => setSelectedPeriod(period.value)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    selectedPeriod === period.value && styles.buttonTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.subtitle}>
            {selectedType === 'line' ? 'Line Chart' : 'Candlestick Chart'} - {selectedPeriod}
          </Text>
          <Graph
            data={selectedType === 'line' ? lineData : candleData}
            type={selectedType}
            width={350}
            height={300}
            period={selectedPeriod}
            showLabels={true}
            showXLabels={true}
            showYLabels={true}
            color={selectedType === 'line' ? '#4F8EF7' : undefined}
            tooltipPosition="top"
            theme="light"
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.subtitle}>With Market Hours (1D)</Text>
          <Graph
            data={lineData}
            type="line"
            width={350}
            height={300}
            period="ONE_DAY"
            showLabels={true}
            showXLabels={true}
            showYLabels={true}
            marketStartTime={new Date(Date.now() - 6 * 60 * 60 * 1000)}
            marketCloseTime={new Date(Date.now() + 2 * 60 * 60 * 1000)}
            isMarketOpen={true}
            currentPrice={25100}
            lastClose={25000}
            tooltipPosition="center"
            theme="light"
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.subtitle}>Dark Theme</Text>
          <View style={styles.darkContainer}>
            <Graph
              data={candleData}
              type="candlestick"
              width={350}
              height={300}
              period="ONE_DAY"
              showLabels={true}
              showXLabels={true}
              showYLabels={true}
              tooltipPosition="bottom"
              theme="dark"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#666',
  },
  chartContainer: {
    marginBottom: 32,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonActive: {
    backgroundColor: '#4F8EF7',
    borderColor: '#4F8EF7',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  buttonTextActive: {
    color: '#fff',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
  },
});

export default GraphExample;

