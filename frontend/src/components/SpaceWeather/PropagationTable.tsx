'use client';

import React from 'react';
import { PropagationForecast, getBandConditionColor } from '@/lib/space-weather/types';
import { clsx } from 'clsx';

interface PropagationTableProps {
  forecasts: PropagationForecast[];
}

const PropagationTable: React.FC<PropagationTableProps> = ({ forecasts }) => {
  const getConditionLabel = (condition: 'good' | 'fair' | 'poor') => {
    switch (condition) {
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      case 'poor':
        return 'Poor';
    }
  };

  const getConditionEmoji = (condition: 'good' | 'fair' | 'poor') => {
    switch (condition) {
      case 'good':
        return '✅';
      case 'fair':
        return '⚠️';
      case 'poor':
        return '❌';
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 border-b border-gray-700">
        <div>Band</div>
        <div className="text-center">Day</div>
        <div className="text-center">Night</div>
      </div>
      
      {forecasts.map((forecast) => (
        <div
          key={forecast.band}
          className="grid grid-cols-3 gap-2 items-center py-2 px-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
        >
          <div className="font-mono font-semibold text-blue-300">
            {forecast.band}
          </div>
          
          <div className="text-center">
            <div
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: `${getBandConditionColor(forecast.day)}20`,
                color: getBandConditionColor(forecast.day),
              }}
            >
              <span>{getConditionEmoji(forecast.day)}</span>
              <span>{getConditionLabel(forecast.day)}</span>
            </div>
          </div>
          
          <div className="text-center">
            <div
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: `${getBandConditionColor(forecast.night)}20`,
                color: getBandConditionColor(forecast.night),
              }}
            >
              <span>{getConditionEmoji(forecast.night)}</span>
              <span>{getConditionLabel(forecast.night)}</span>
            </div>
          </div>
        </div>
      ))}
      
      <div className="pt-2 mt-2 border-t border-gray-700/50">
        <div className="text-xs text-gray-500 italic">
          Based on current Kp index and solar conditions
        </div>
      </div>
    </div>
  );
};

export default PropagationTable;
