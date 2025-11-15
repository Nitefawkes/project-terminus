'use client';

import React from 'react';
import { useAppStore } from '@/store/appStore';
import { getUTCTime, getUTCDate, getLocalTime, getLocalTimezoneName } from '@/lib/time';
import { Clock } from 'lucide-react';

const TimeDisplay: React.FC = () => {
  const { currentTime, kioskMode } = useAppStore();

  const utcTime = getUTCTime(currentTime);
  const utcDate = getUTCDate(currentTime);
  const localTime = getLocalTime(currentTime);
  const localTz = getLocalTimezoneName();

  if (kioskMode) {
    // Minimal display for kiosk mode
    return (
      <div className="terminus-time-kiosk">
        <div className="text-4xl font-mono font-bold text-white">{utcTime}</div>
        <div className="text-lg text-gray-400 mt-1">UTC</div>
      </div>
    );
  }

  return (
    <div className="terminus-time-panel">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
        <Clock className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wide">
          World Time
        </h3>
      </div>

      {/* UTC Time - Primary */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          Universal Time Coordinated
        </div>
        <div className="text-3xl font-mono font-bold text-white tracking-tight">
          {utcTime}
        </div>
        <div className="text-sm text-gray-400 mt-1">{utcDate}</div>
      </div>

      {/* Local Time */}
      <div className="pt-3 border-t border-gray-700/50">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          Local Time
        </div>
        <div className="text-xl font-mono font-semibold text-blue-300">
          {localTime}
        </div>
        <div className="text-xs text-gray-500 mt-1">{localTz}</div>
      </div>

      {/* Solar Time Info (for ham operators) */}
      <div className="mt-4 pt-3 border-t border-gray-700/50">
        <div className="text-xs text-gray-500 italic">
          Solar time calculation available when location set
        </div>
      </div>
    </div>
  );
};

export default TimeDisplay;
