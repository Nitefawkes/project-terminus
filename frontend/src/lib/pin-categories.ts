/**
 * Pin Categories Configuration
 * Defines available pin categories with colors and icons
 */

import { Home, Briefcase, Star, MapPin, AlertCircle, Heart, Bookmark, Target } from 'lucide-react';

export interface PinCategory {
  id: string;
  name: string;
  color: string;
  icon: any;
  description: string;
}

export const PIN_CATEGORIES: PinCategory[] = [
  {
    id: 'home',
    name: 'Home',
    color: '#10b981', // green
    icon: Home,
    description: 'Home locations',
  },
  {
    id: 'work',
    name: 'Work',
    color: '#3b82f6', // blue
    icon: Briefcase,
    description: 'Work and office locations',
  },
  {
    id: 'important',
    name: 'Important',
    color: '#ef4444', // red
    icon: AlertCircle,
    description: 'Critical or important locations',
  },
  {
    id: 'favorite',
    name: 'Favorite',
    color: '#f59e0b', // amber
    icon: Star,
    description: 'Favorite places',
  },
  {
    id: 'bookmark',
    name: 'Bookmark',
    color: '#8b5cf6', // purple
    icon: Bookmark,
    description: 'Bookmarked locations',
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#ec4899', // pink
    icon: Heart,
    description: 'Personal locations',
  },
  {
    id: 'target',
    name: 'Target',
    color: '#f97316', // orange
    icon: Target,
    description: 'Target or goal locations',
  },
  {
    id: 'general',
    name: 'General',
    color: '#6b7280', // gray
    icon: MapPin,
    description: 'General purpose pins',
  },
];

export const DEFAULT_CATEGORY = 'general';

/**
 * Get category by ID
 */
export function getCategoryById(id: string): PinCategory | undefined {
  return PIN_CATEGORIES.find((cat) => cat.id === id);
}

/**
 * Get category color
 */
export function getCategoryColor(categoryId?: string): string {
  const category = categoryId ? getCategoryById(categoryId) : null;
  return category?.color || getCategoryById(DEFAULT_CATEGORY)!.color;
}

/**
 * Get category name
 */
export function getCategoryName(categoryId?: string): string {
  const category = categoryId ? getCategoryById(categoryId) : null;
  return category?.name || getCategoryById(DEFAULT_CATEGORY)!.name;
}
