/**
 * Map Pin Management
 * Utilities for managing user pins on the map
 */

import maplibregl from 'maplibre-gl';
import { Pin } from '@/lib/api';
import { getCategoryColor, getCategoryName } from '@/lib/pin-categories';

// Store marker instances for cleanup
const pinMarkers = new Map<string, maplibregl.Marker>();

/**
 * Initialize pins layer on the map
 */
export function initializePinsLayer(map: maplibregl.Map) {
  // Add GeoJSON source for pins
  if (!map.getSource('user-pins')) {
    map.addSource('user-pins', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
  }
}

/**
 * Create a custom marker element for pins
 */
function createPinMarker(pin: Pin): HTMLDivElement {
  const color = getCategoryColor(pin.category);

  const el = document.createElement('div');
  el.className = 'custom-pin-marker';
  el.style.cssText = `
    width: 30px;
    height: 30px;
    background-color: ${color};
    border: 2px solid #ffffff;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    transition: transform 0.2s ease;
  `;

  // Add hover effect
  el.onmouseenter = () => {
    el.style.transform = 'rotate(-45deg) scale(1.1)';
  };
  el.onmouseleave = () => {
    el.style.transform = 'rotate(-45deg) scale(1)';
  };

  // Add inner dot
  const innerDot = document.createElement('div');
  innerDot.style.cssText = `
    width: 10px;
    height: 10px;
    background-color: #ffffff;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `;
  el.appendChild(innerDot);

  return el;
}

/**
 * Create a popup for a pin
 */
function createPinPopup(pin: Pin, onDelete?: (id: string) => void): maplibregl.Popup {
  const categoryName = getCategoryName(pin.category);
  const categoryColor = getCategoryColor(pin.category);

  const deleteButton = onDelete
    ? `<button
        class="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
        onclick="window.deletePin('${pin.id}')"
      >
        Delete Pin
      </button>`
    : '';

  const popupContent = `
    <div class="pin-popup" style="min-width: 150px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <div style="width: 12px; height: 12px; background-color: ${categoryColor}; border-radius: 50%;"></div>
        <span style="font-size: 11px; color: #9ca3af; text-transform: uppercase;">${categoryName}</span>
      </div>
      <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #ffffff;">
        ${pin.name}
      </h3>
      ${
        pin.description
          ? `<p style="font-size: 12px; color: #d1d5db; margin-bottom: 8px;">${pin.description}</p>`
          : ''
      }
      <p style="font-size: 11px; color: #9ca3af; margin-bottom: 8px;">
        ${pin.latitude.toFixed(4)}°, ${pin.longitude.toFixed(4)}°
      </p>
      ${deleteButton}
    </div>
  `;

  return new maplibregl.Popup({
    offset: 25,
    closeButton: true,
    closeOnClick: false,
    className: 'pin-popup-container',
  }).setHTML(popupContent);
}

/**
 * Add or update pins on the map
 */
export function updatePins(
  map: maplibregl.Map,
  pins: Pin[],
  onPinClick?: (pin: Pin) => void,
  onPinDelete?: (id: string) => void
) {
  // Set up global delete function
  if (onPinDelete && typeof window !== 'undefined') {
    (window as any).deletePin = onPinDelete;
  }

  // Remove existing markers that are no longer in the pins array
  const currentPinIds = new Set(pins.map((p) => p.id));
  pinMarkers.forEach((marker, id) => {
    if (!currentPinIds.has(id)) {
      marker.remove();
      pinMarkers.delete(id);
    }
  });

  // Add or update markers
  pins.forEach((pin) => {
    let marker = pinMarkers.get(pin.id);

    if (!marker) {
      // Create new marker
      const el = createPinMarker(pin);
      const popup = createPinPopup(pin, onPinDelete);

      marker = new maplibregl.Marker({ element: el })
        .setLngLat([pin.longitude, pin.latitude])
        .setPopup(popup);

      if (onPinClick) {
        el.addEventListener('click', () => onPinClick(pin));
      }

      marker.addTo(map);
      pinMarkers.set(pin.id, marker);
    } else {
      // Update existing marker position
      marker.setLngLat([pin.longitude, pin.latitude]);

      // Update popup content
      const popup = createPinPopup(pin, onPinDelete);
      marker.setPopup(popup);
    }
  });

  // Update GeoJSON source
  const source = map.getSource('user-pins') as maplibregl.GeoJSONSource;
  if (source) {
    source.setData({
      type: 'FeatureCollection',
      features: pins.map((pin) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [pin.longitude, pin.latitude],
        },
        properties: {
          id: pin.id,
          name: pin.name,
          description: pin.description || '',
        },
      })),
    });
  }
}

/**
 * Add a new pin at clicked location
 */
export function addPinAtLocation(
  map: maplibregl.Map,
  lngLat: maplibregl.LngLat,
  onCreate: (lng: number, lat: number) => void
) {
  onCreate(lngLat.lng, lngLat.lat);
}

/**
 * Cleanup all pin markers
 */
export function cleanupPins() {
  pinMarkers.forEach((marker) => marker.remove());
  pinMarkers.clear();
}
