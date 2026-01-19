# Theme System

The theme system provides light and dark themes for chart components using the Nubra color palette.

## Basic Usage

```typescript
import { getTheme } from '@pulse/engine';

// Get theme for a specific mode
const lightTheme = getTheme('light');
const darkTheme = getTheme('dark');

// Use in component
<LineChart
  data={data}
  width={width}
  height={height}
  theme="dark" // or "light"
/>
```

## Updating Colors

### Update Base Color Palette

To update colors in the base palette that will affect both themes:

```typescript
import { updateThemeColors } from '@pulse/engine';

// Update a single color
updateThemeColors({
  'primary-blue': '#586FED',
});

// Update multiple colors
updateThemeColors({
  'primary-blue': '#586FED',
  'cornflower-blue': '#6E83FB',
  'silver-mist': 'rgba(177, 177, 177, 0.40)',
});
```

### Update Theme-Specific Colors

To update colors for a specific theme (light or dark) without changing the base palette:

```typescript
import { updateTheme } from '@pulse/engine';

// Update only light theme
updateTheme(undefined, {
  light: {
    lineColor: '#FF0000',
    tooltipBackgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
});

// Update only dark theme
updateTheme(undefined, {
  dark: {
    lineColor: '#00FF00',
    tooltipBackgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
});

// Update both base colors and theme-specific overrides
updateTheme(
  {
    'primary-blue': '#586FED',
  },
  {
    light: {
      lineColor: '#586FED',
    },
    dark: {
      lineColor: '#6E83FB',
    },
  }
);
```

### Get Individual Colors

To get a specific color from the palette:

```typescript
import { getThemeColor } from '@pulse/engine';

const primaryBlue = getThemeColor('primary-blue');
const silverMist = getThemeColor('silver-mist');
```

## Available Theme Properties

- `lineColor`: Color of the chart line
- `strokeWidth`: Width of the chart line
- `tooltipBackgroundColor`: Background color of tooltips
- `tooltipBorderColor`: Border color of tooltips
- `tooltipTextColor`: Primary text color in tooltips
- `tooltipSecondaryTextColor`: Secondary text color in tooltips
- `axisColor`: Color of axis lines
- `axisLabelColor`: Color of axis labels
- `gridColor`: Color of grid lines (for future use)
- `backgroundColor`: Background color (for future use)
- `labelTextColor`: Color of chart labels
- `labelTextSelectedColor`: Color of selected chart labels

## Color Mapping

The themes use the following Nubra color mappings:

### Light Theme
- Line: `primary-blue` (#586FED)
- Tooltip Background: `titan-white` with 95% opacity
- Tooltip Border: `silver-mist`
- Tooltip Text: `black`
- Tooltip Secondary Text: `dim-gray`
- Axis: `silver-mist`
- Axis Labels: `black`
- Labels: `black`

### Dark Theme
- Line: `cornflower-blue` (#6E83FB)
- Tooltip Background: `cod-gray` with 95% opacity
- Tooltip Border: `french-gray`
- Tooltip Text: `white`
- Tooltip Secondary Text: `white-light-70%`
- Axis: `french-gray`
- Axis Labels: `white-light-70%`
- Labels: `white-light-70%` / `white`


