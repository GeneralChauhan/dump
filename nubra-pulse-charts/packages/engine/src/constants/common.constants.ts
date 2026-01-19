/**
 * Common constants shared across chart types / platforms.
 */

export const NUMBER_FORMATTING = {
  THOUSAND_DIVISOR: 1000,
  THOUSAND_SUFFIX: "k",
  DECIMAL_PLACES_LARGE: 0,
  DECIMAL_PLACES_MEDIUM: 1,
  DECIMAL_PLACES_SMALL: 2,
  THRESHOLD_THOUSAND: 1000,
  THRESHOLD_HUNDRED: 100,
  THRESHOLD_TEN: 10,
} as const;

export const TIME_FORMATS = {
  HOURS_IN_DAY: 12,
  MINUTES_PADDING: 10,
  AM_PM_THRESHOLD: 12,
} as const;


