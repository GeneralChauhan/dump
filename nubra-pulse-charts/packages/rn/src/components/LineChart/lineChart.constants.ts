/**
 * Constants for LineChart component
 */

export const LINE_CHART_DEFAULTS = {
  COLOR: "#4F8EF7",
  STROKE_WIDTH: 3,
  FONT_SIZE: 12,
  X_TICK_COUNT: 5,
  Y_TICK_COUNT: 7,
  TOOLTIP_POSITION: "top" as const,
  TOOLTIP_BACKGROUND_COLOR: "rgba(223, 224, 234, 0.95)",
  TOOLTIP_BORDER_COLOR: "#bbb",
  TOOLTIP_TEXT_COLOR: "#222",
  TOOLTIP_SECONDARY_TEXT_COLOR: "#666",
  PERSIST_HIGHLIGHT: false,
  SHOW_TOOLTIP: true,
  SHOW_X_AXIS: false,
  SHOW_Y_AXIS: false,
} as const;

export const LINE_CHART_LAYOUT = {
  X_AXIS_LABEL_HEIGHT: 10,
  Y_AXIS_LABEL_WIDTH: 20,
  PADDING_LEFT_OFFSET: 8,
  CHART_RIGHT_PADDING: 12,
  CHART_RIGHT_PADDING_BASE: 8,
  TICK_MARK_LENGTH: 4,
  LABEL_OFFSET_Y: 20,
  TEXT_OFFSET_Y: 4,
} as const;

export const LINE_CHART_ANIMATION = {
  FRAME_COUNT: 30,
  MORPH_DURATION: 200,
  PROGRESS_DURATION: 400,
  SPRING_DAMPING: 20,
  SPRING_STIFFNESS: 300,
  // Pulse indicator (live dot)
  PULSE_DURATION: 1200,
} as const;

export const LINE_CHART_PULSE = {
  MIN_RADIUS: 3,
  MAX_RADIUS: 10,
  STROKE_WIDTH: 1,
} as const;

export const LINE_CHART_TOOLTIP = {
  HEIGHT: 48,
  RADIUS: 8,
  MIN_WIDTH: 80,
  MAX_WIDTH: 200,
  PADDING: 16, // Left/right padding for left-aligned text
  DEFAULT_WIDTH: 120,
  VERTICAL_OFFSET: 8,
  // Date/time text (top line) - smaller, left-aligned
  DATE_TEXT_Y: 20,
  DATE_TEXT_X: 12, // Left padding
  // Value text (bottom line) - larger, left-aligned with circle
  VALUE_TEXT_Y: 36,
  VALUE_TEXT_X: 22, // Left padding (circle will be before this)
  CIRCLE_RADIUS: 4, // Small green circle before value
  CIRCLE_X_OFFSET: 14, // X position of circle from left edge
  CIRCLE_Y_OFFSET: 24, // Y position aligned with value text
  CIRCLE_COLOR: "#4CAF50", // Green color for the indicator circle
  VALUE_PREFIX: "", // Prefix for value text
} as const;

export const LINE_CHART_GESTURE = {
  HIT_SLOP: -10,
  LONG_PRESS_DURATION: 0,
  MIN_DISTANCE: 0,
  MAX_POINTERS: 1,
} as const;

export const LINE_CHART_AXIS = {
  MIN_VERTICAL_SPACING: 20,
  MIN_TICK_COUNT: 3,
  MAX_TICK_COUNT: 8,
  DEFAULT_LABEL_WIDTH: 30,
  // Extra headroom added above the max value in the Y-domain (keeps some empty space at top).
  Y_HEADROOM_RATIO: 0.02,
  // Pixel padding at the top of the canvas so the stroke + top label don't clip.
  TOP_PADDING: 14,
  // Pixel padding at the bottom of the chart area so the lowest Y tick label doesn't clip.
  BOTTOM_PADDING: 14,
  CIRCLE_RADIUS: 6,
  STROKE_WIDTH: 1,
  DASH_PATTERN: [4, 4] as [number, number],
  DASH_OFFSET: 0,
} as const;

export const LINE_CHART_GRID = {
  STROKE_WIDTH: 1,
  OPACITY: 0.2,
  DASH_PATTERN: [2, 2] as [number, number],
} as const;

// Formatting and time format constants are now in @pulse/engine
// Re-export for backward compatibility
export { NUMBER_FORMATTING, TIME_FORMATS } from "@pulse/engine";
