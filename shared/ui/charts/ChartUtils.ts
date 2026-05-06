/**
 * Shared configurations and utilities for Recharts
 */

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--background))',
  borderRadius: '12px',
  border: '1px solid hsl(var(--border))',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  fontSize: '12px',
  padding: '8px 12px',
};

export const CHART_AXIS_STYLE = {
  fontSize: 11,
  fill: 'hsl(var(--muted-foreground))',
  fontWeight: 500,
};

export const CHART_GRID_STYLE = {
  stroke: 'hsl(var(--border))',
  strokeOpacity: 0.4,
  strokeDasharray: '3 3',
};

/**
 * Formats a date string for chart axis (e.g., "5 May")
 */
export const formatChartDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      day: 'numeric', 
      month: 'short' 
    });
  } catch (e) {
    return dateStr;
  }
};

export const CHART_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#22c55e', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
];
