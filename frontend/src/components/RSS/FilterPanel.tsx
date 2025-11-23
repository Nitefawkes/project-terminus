'use client';

import React, { useState, useEffect } from 'react';
import { ItemQuery, FeedType } from '@/lib/api/rss-types';
import {
  TimeRangePreset,
  TIME_RANGE_OPTIONS,
  getTimeRangeFromPreset,
  formatTimeRange,
  detectTimeRangePreset,
} from '@/lib/filters/time-ranges';
import {
  Filter,
  X,
  Calendar,
  MapPin,
  Star,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface FilterPanelProps {
  filters: ItemQuery;
  onFiltersChange: (filters: ItemQuery) => void;
  onClose?: () => void;
}

export function FilterPanel({ filters, onFiltersChange, onClose }: FilterPanelProps) {
  const [expanded, setExpanded] = useState({
    timeRange: true,
    status: false,
    geospatial: false,
  });

  const [timeRangePreset, setTimeRangePreset] = useState<TimeRangePreset>(
    detectTimeRangePreset(filters.since, filters.until)
  );

  const [customRange, setCustomRange] = useState({
    since: filters.since || '',
    until: filters.until || '',
  });

  const [geoFilter, setGeoFilter] = useState({
    nearLat: filters.nearLat || 0,
    nearLng: filters.nearLng || 0,
    radiusKm: filters.radiusKm || 50,
  });

  // Update filters when time range preset changes
  useEffect(() => {
    if (timeRangePreset !== 'custom' && timeRangePreset !== 'all') {
      const range = getTimeRangeFromPreset(timeRangePreset);
      onFiltersChange({
        ...filters,
        since: range.since,
        until: range.until,
      });
    } else if (timeRangePreset === 'all') {
      const { since, until, ...rest } = filters;
      onFiltersChange(rest);
    }
  }, [timeRangePreset]);

  function handleCustomRangeChange(field: 'since' | 'until', value: string) {
    setCustomRange((prev) => ({ ...prev, [field]: value }));
    onFiltersChange({
      ...filters,
      [field]: value || undefined,
    });
    setTimeRangePreset('custom');
  }

  function handleStatusFilterChange(field: 'read' | 'starred', value?: boolean) {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  }

  function handleGeoFilterApply() {
    if (geoFilter.nearLat && geoFilter.nearLng && geoFilter.radiusKm) {
      onFiltersChange({
        ...filters,
        nearLat: geoFilter.nearLat,
        nearLng: geoFilter.nearLng,
        radiusKm: geoFilter.radiusKm,
      });
    }
  }

  function handleGeoFilterClear() {
    const { nearLat, nearLng, radiusKm, ...rest } = filters;
    onFiltersChange(rest);
    setGeoFilter({ nearLat: 0, nearLng: 0, radiusKm: 50 });
  }

  function handleClearAll() {
    onFiltersChange({});
    setTimeRangePreset('all');
    setCustomRange({ since: '', until: '' });
    setGeoFilter({ nearLat: 0, nearLng: 0, radiusKm: 50 });
  }

  const hasActiveFilters =
    filters.since ||
    filters.until ||
    filters.read !== undefined ||
    filters.starred !== undefined ||
    filters.nearLat !== undefined;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <RotateCcw size={14} />
              Clear All
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Time Range Filter */}
        <div>
          <button
            onClick={() => setExpanded((prev) => ({ ...prev, timeRange: !prev.timeRange }))}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-600 dark:text-gray-300" />
              <span className="font-medium text-gray-900 dark:text-white">Time Range</span>
            </div>
            {expanded.timeRange ? (
              <ChevronUp size={18} className="text-gray-400" />
            ) : (
              <ChevronDown size={18} className="text-gray-400" />
            )}
          </button>

          {expanded.timeRange && (
            <div className="p-4 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {TIME_RANGE_OPTIONS.filter((opt) => opt.value !== 'custom').map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTimeRangePreset(option.value as TimeRangePreset)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      timeRangePreset === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    title={option.description}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {timeRangePreset === 'custom' && (
                <div className="mt-3 space-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Since
                    </label>
                    <input
                      type="datetime-local"
                      value={customRange.since ? new Date(customRange.since).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleCustomRangeChange('since', e.target.value ? new Date(e.target.value).toISOString() : '')}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Until
                    </label>
                    <input
                      type="datetime-local"
                      value={customRange.until ? new Date(customRange.until).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleCustomRangeChange('until', e.target.value ? new Date(e.target.value).toISOString() : '')}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {(filters.since || filters.until) && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Showing: {formatTimeRange(filters.since, filters.until)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Filters */}
        <div>
          <button
            onClick={() => setExpanded((prev) => ({ ...prev, status: !prev.status }))}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Eye size={18} className="text-gray-600 dark:text-gray-300" />
              <span className="font-medium text-gray-900 dark:text-white">Status</span>
            </div>
            {expanded.status ? (
              <ChevronUp size={18} className="text-gray-400" />
            ) : (
              <ChevronDown size={18} className="text-gray-400" />
            )}
          </button>

          {expanded.status && (
            <div className="p-4 pt-0 space-y-2">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.read === false}
                    onChange={(e) =>
                      handleStatusFilterChange('read', e.target.checked ? false : undefined)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <EyeOff size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Unread only</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.starred === true}
                    onChange={(e) =>
                      handleStatusFilterChange('starred', e.target.checked ? true : undefined)
                    }
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Starred only</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Geospatial Filter */}
        <div>
          <button
            onClick={() => setExpanded((prev) => ({ ...prev, geospatial: !prev.geospatial }))}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-gray-600 dark:text-gray-300" />
              <span className="font-medium text-gray-900 dark:text-white">Location</span>
            </div>
            {expanded.geospatial ? (
              <ChevronUp size={18} className="text-gray-400" />
            ) : (
              <ChevronDown size={18} className="text-gray-400" />
            )}
          </button>

          {expanded.geospatial && (
            <div className="p-4 pt-0 space-y-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Show items within a radius of a specific location
              </p>

              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    value={geoFilter.nearLat}
                    onChange={(e) =>
                      setGeoFilter((prev) => ({ ...prev, nearLat: parseFloat(e.target.value) }))
                    }
                    step="0.000001"
                    min="-90"
                    max="90"
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                    placeholder="e.g., 40.7128"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    value={geoFilter.nearLng}
                    onChange={(e) =>
                      setGeoFilter((prev) => ({ ...prev, nearLng: parseFloat(e.target.value) }))
                    }
                    step="0.000001"
                    min="-180"
                    max="180"
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                    placeholder="e.g., -74.0060"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Radius (km)
                  </label>
                  <input
                    type="number"
                    value={geoFilter.radiusKm}
                    onChange={(e) =>
                      setGeoFilter((prev) => ({ ...prev, radiusKm: parseFloat(e.target.value) }))
                    }
                    min="1"
                    max="20000"
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                    placeholder="e.g., 50"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleGeoFilterApply}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
                {filters.nearLat !== undefined && (
                  <button
                    onClick={handleGeoFilterClear}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {filters.nearLat !== undefined && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Active: {filters.radiusKm}km radius around ({filters.nearLat.toFixed(4)}, {filters.nearLng?.toFixed(4)})
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
