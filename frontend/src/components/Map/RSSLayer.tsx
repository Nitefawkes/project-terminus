'use client';

import { useEffect, useRef } from 'react';
import maplibregl, { Map, Marker } from 'maplibre-gl';
import { RSSItem } from '@/lib/api/rss-types';
import { getFeedTypeConfig } from '@/lib/rss/feed-config';
import { formatDistanceToNow } from 'date-fns';

interface RSSLayerProps {
  map: Map | null;
  items: RSSItem[];
  onItemClick?: (item: RSSItem) => void;
}

export default function RSSLayer({ map, items, onItemClick }: RSSLayerProps) {
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for geocoded items
    items.forEach((item) => {
      if (!item.geocoded || item.latitude === null || item.longitude === null) {
        return;
      }

      const feedConfig = item.feed ? getFeedTypeConfig(item.feed.type) : null;
      const color = feedConfig?.color || '#6B7280';

      // Create marker element
      const el = document.createElement('div');
      el.className = 'rss-marker';
      el.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: ${color};
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s;
      `;

      // Add unread indicator
      if (!item.read) {
        const unreadDot = document.createElement('div');
        unreadDot.style.cssText = `
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #3B82F6;
          border: 1px solid white;
        `;
        el.appendChild(unreadDot);
      }

      // Hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Create popup
      const popupContent = createPopupContent(item, feedConfig?.color);
      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '320px',
      }).setHTML(popupContent);

      // Create marker
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([item.longitude, item.latitude])
        .setPopup(popup)
        .addTo(map);

      // Handle marker click
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onItemClick) {
          onItemClick(item);
        }
      });

      markersRef.current.push(marker);
    });

    // Cleanup on unmount
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [map, items, onItemClick]);

  return null; // This component doesn't render anything
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitize URL to prevent javascript: protocol attacks
 */
function sanitizeUrl(url: string): string {
  const urlLower = url.toLowerCase().trim();
  if (urlLower.startsWith('javascript:') || urlLower.startsWith('data:')) {
    return '#';
  }
  return url;
}

function createPopupContent(item: RSSItem, color?: string): string {
  const timeAgo = formatDistanceToNow(new Date(item.pubDate), { addSuffix: true });

  return `
    <div style="font-family: system-ui; padding: 4px;">
      <!-- Feed Type Indicator -->
      ${
        color
          ? `<div style="width: 100%; height: 3px; background-color: ${color}; margin-bottom: 8px; border-radius: 2px;"></div>`
          : ''
      }

      <!-- Feed Name -->
      ${
        item.feed
          ? `<div style="font-size: 11px; color: #9CA3AF; margin-bottom: 4px;">${escapeHtml(item.feed.name)}</div>`
          : ''
      }

      <!-- Title -->
      <div style="font-size: 14px; font-weight: 600; color: #F3F4F6; margin-bottom: 6px; line-height: 1.3;">
        ${escapeHtml(item.title)}
      </div>

      <!-- Description -->
      ${
        item.contentSnippet
          ? `<div style="font-size: 12px; color: #D1D5DB; margin-bottom: 8px; line-height: 1.4; max-height: 60px; overflow: hidden;">
            ${escapeHtml(item.contentSnippet.substring(0, 150))}${item.contentSnippet.length > 150 ? '...' : ''}
          </div>`
          : ''
      }

      <!-- Location -->
      ${
        item.location
          ? `<div style="font-size: 11px; color: #9CA3AF; margin-bottom: 4px;">
            📍 ${escapeHtml(item.location)}
          </div>`
          : ''
      }

      <!-- Metadata -->
      <div style="font-size: 11px; color: #6B7280; margin-bottom: 8px;">
        ${escapeHtml(timeAgo)}${item.author ? ` • ${escapeHtml(item.author)}` : ''}
      </div>

      <!-- Actions -->
      <div style="display: flex; gap: 6px; padding-top: 8px; border-top: 1px solid #374151;">
        <a
          href="${sanitizeUrl(item.link)}"
          target="_blank"
          rel="noopener noreferrer"
          style="
            flex: 1;
            padding: 6px 12px;
            background-color: #3B82F6;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            text-align: center;
            transition: background-color 0.2s;
          "
          onmouseover="this.style.backgroundColor='#2563EB'"
          onmouseout="this.style.backgroundColor='#3B82F6'"
        >
          Read Article
        </a>
      </div>
    </div>
  `;
}
