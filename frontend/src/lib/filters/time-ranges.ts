// Time range filtering utilities

export type TimeRangePreset =
  | '1h'
  | '6h'
  | '12h'
  | '24h'
  | '7d'
  | '30d'
  | 'custom'
  | 'all';

export interface TimeRange {
  since?: string;
  until?: string;
}

export interface TimeRangeOption {
  value: TimeRangePreset;
  label: string;
  description: string;
}

export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  {
    value: 'all',
    label: 'All Time',
    description: 'Show all items',
  },
  {
    value: '1h',
    label: 'Last Hour',
    description: 'Items from the last hour',
  },
  {
    value: '6h',
    label: 'Last 6 Hours',
    description: 'Items from the last 6 hours',
  },
  {
    value: '12h',
    label: 'Last 12 Hours',
    description: 'Items from the last 12 hours',
  },
  {
    value: '24h',
    label: 'Last 24 Hours',
    description: 'Items from the last 24 hours',
  },
  {
    value: '7d',
    label: 'Last 7 Days',
    description: 'Items from the last 7 days',
  },
  {
    value: '30d',
    label: 'Last 30 Days',
    description: 'Items from the last 30 days',
  },
  {
    value: 'custom',
    label: 'Custom Range',
    description: 'Select custom date range',
  },
];

/**
 * Convert time range preset to actual dates
 */
export function getTimeRangeFromPreset(preset: TimeRangePreset): TimeRange {
  const now = new Date();

  switch (preset) {
    case '1h':
      return {
        since: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        until: now.toISOString(),
      };

    case '6h':
      return {
        since: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        until: now.toISOString(),
      };

    case '12h':
      return {
        since: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        until: now.toISOString(),
      };

    case '24h':
      return {
        since: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        until: now.toISOString(),
      };

    case '7d':
      return {
        since: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        until: now.toISOString(),
      };

    case '30d':
      return {
        since: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        until: now.toISOString(),
      };

    case 'all':
    default:
      return {};
  }
}

/**
 * Format time range for display
 */
export function formatTimeRange(since?: string, until?: string): string {
  if (!since && !until) {
    return 'All time';
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffHours * 60);
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      const hours = Math.floor(diffHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  if (since && !until) {
    return `Since ${formatDate(since)}`;
  }

  if (!since && until) {
    return `Until ${new Date(until).toLocaleDateString()}`;
  }

  return `${formatDate(since)} - ${until ? new Date(until).toLocaleDateString() : 'now'}`;
}

/**
 * Detect which preset matches the given time range
 */
export function detectTimeRangePreset(since?: string, until?: string): TimeRangePreset {
  if (!since && !until) {
    return 'all';
  }

  // Check if matches any preset
  const presets: TimeRangePreset[] = ['1h', '6h', '12h', '24h', '7d', '30d'];

  for (const preset of presets) {
    const range = getTimeRangeFromPreset(preset);
    if (range.since && since) {
      const presetTime = new Date(range.since).getTime();
      const sinceTime = new Date(since).getTime();

      // Allow 5 minute tolerance
      if (Math.abs(presetTime - sinceTime) < 5 * 60 * 1000) {
        return preset;
      }
    }
  }

  return 'custom';
}
