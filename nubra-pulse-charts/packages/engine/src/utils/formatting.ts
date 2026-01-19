/**
 * Common formatting utilities for the engine package
 */

import { NUMBER_FORMATTING, TIME_FORMATS } from "../constants/common.constants";
import type {
  iFormatTimeLabelParams,
  iFormatTickLabelParams,
} from "../interfaces/ChartData/lineChartData";

/**
 * Formats a number with appropriate scale (thousands, hundreds, etc.) and decimal places
 * Formats numbers with "k" suffix for thousands and adjusts decimal places based on magnitude
 */
export const formatScaledNumber = ({
  value,
}: iFormatTickLabelParams): string => {
  if (value >= NUMBER_FORMATTING.THRESHOLD_THOUSAND) {
    const thousandsValue = value / NUMBER_FORMATTING.THOUSAND_DIVISOR;
    return `${thousandsValue.toFixed(NUMBER_FORMATTING.DECIMAL_PLACES_MEDIUM)}${NUMBER_FORMATTING.THOUSAND_SUFFIX}`;
  }

  if (value >= NUMBER_FORMATTING.THRESHOLD_HUNDRED) {
    return value.toFixed(NUMBER_FORMATTING.DECIMAL_PLACES_LARGE);
  }

  if (value >= NUMBER_FORMATTING.THRESHOLD_TEN) {
    return value.toFixed(NUMBER_FORMATTING.DECIMAL_PLACES_MEDIUM);
  }

  return value.toFixed(NUMBER_FORMATTING.DECIMAL_PLACES_SMALL);
};

/**
 * Formats timestamp to time label string
 */
export const formatTimeLabel = ({
  timestamp,
}: iFormatTimeLabelParams): string => {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();

  hours = hours % TIME_FORMATS.HOURS_IN_DAY;
  hours = hours ? hours : TIME_FORMATS.HOURS_IN_DAY;

  const minutesString =
    minutes < TIME_FORMATS.MINUTES_PADDING ? `0${minutes}` : minutes.toString();

  return minutes === 0 ? `${hours}` : `${hours}:${minutesString}`;
};
