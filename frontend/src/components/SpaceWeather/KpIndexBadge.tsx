'use client';

import React from 'react';
import { KpIndex } from '@/lib/space-weather/types';
import { clsx } from 'clsx';

interface KpIndexBadgeProps {
  kpIndex: KpIndex;
  size?: 'small' | 'medium' | 'large';
}

const KpIndexBadge: React.FC<KpIndexBadgeProps> = ({ kpIndex, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-12 h-12 text-lg',
    medium: 'w-16 h-16 text-2xl',
    large: 'w-24 h-24 text-4xl',
  };

  const getConditionEmoji = (condition: KpIndex['condition']) => {
    switch (condition) {
      case 'quiet':
        return '😌';
      case 'unsettled':
        return '😐';
      case 'active':
        return '⚡';
      case 'storm':
        return '🌩️';
      case 'severe-storm':
        return '💥';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={clsx(
          'rounded-full flex items-center justify-center font-bold border-4 shadow-lg',
          sizeClasses[size]
        )}
        style={{
          backgroundColor: `${kpIndex.color}20`,
          borderColor: kpIndex.color,
          color: kpIndex.color,
        }}
      >
        <div className="flex flex-col items-center">
          <span className="text-xs opacity-70">Kp</span>
          <span>{kpIndex.value}</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl">{getConditionEmoji(kpIndex.condition)}</div>
        <div className="text-xs text-gray-400 capitalize mt-1">
          {kpIndex.condition.replace('-', ' ')}
        </div>
      </div>
    </div>
  );
};

export default KpIndexBadge;
