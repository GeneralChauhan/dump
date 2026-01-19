/**
 * Tooltip utilities for LineChart
 */

import { LINE_CHART_TOOLTIP } from "./lineChart.constants";

/**
 * Calculates fixed tooltip width based on data range
 */
export const calculateTooltipWidth = (
  layoutFont: { measureText: (text: string) => { width: number } } | null,
  filteredData: number[],
  marketHoursRange: { startTime: number; closeTime: number } | null,
  timestamps: number[] | undefined
): number => {
  if (!layoutFont) {
    return LINE_CHART_TOOLTIP.DEFAULT_WIDTH;
  }
  if (!filteredData || filteredData.length === 0) {
    return LINE_CHART_TOOLTIP.DEFAULT_WIDTH;
  }

  const maxValue = Math.max(...filteredData);
  const minValue = Math.min(...filteredData);

  const maxValueString = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(maxValue);

  const minValueString = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minValue);

  const maxPriceWidth = layoutFont.measureText(maxValueString).width;
  const minPriceWidth = layoutFont.measureText(minValueString).width;
  const maxPriceContentWidth = Math.max(maxPriceWidth, minPriceWidth);

  let maxXValueWidth = 0;
  if (marketHoursRange && timestamps && timestamps.length > 0) {
    const sampleTimeString = "12:30 PM";
    maxXValueWidth = layoutFont.measureText(sampleTimeString).width;
  } else if (filteredData.length > 0) {
    const maxIndexString = String(filteredData.length - 1);
    maxXValueWidth = layoutFont.measureText(maxIndexString).width;
  }

  const maxContentWidth = Math.max(maxPriceContentWidth, maxXValueWidth);
  const calculatedWidth = maxContentWidth + LINE_CHART_TOOLTIP.PADDING;

  return Math.min(
    Math.max(LINE_CHART_TOOLTIP.MIN_WIDTH, calculatedWidth),
    LINE_CHART_TOOLTIP.MAX_WIDTH
  );
};
