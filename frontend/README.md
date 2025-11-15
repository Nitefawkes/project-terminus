# Project Terminus 🌍

**Living World Clock & Intelligence Dashboard**

A web-native geospatial platform featuring real-time day/night terminator visualization, space weather data, and extensible map layers. Built to replace hardware-centric solutions like Geochron with a modern, accessible web application.

## ✨ Features

### MVP (Current)
- 🌓 **Real-time Day/Night Terminator** - Animated solar terminator with smooth transitions
- ⏰ **World Clock** - UTC and local time display with multiple timezone support
- 🗺️ **Interactive Map** - Powered by MapLibre GL (open source)
- 🖥️ **Kiosk Mode** - Fullscreen display perfect for TVs and wall-mounted screens
- 🎨 **Clean UI** - Modern, responsive interface with dark theme
- 🔌 **Layer SDK** - Extensible architecture for adding new data overlays

### Planned Features
- 🛰️ **Satellite Tracking** - ISS and other satellites in real-time
- ☀️ **Space Weather** - Kp index, aurora oval, solar wind data, HF/VHF propagation
- 📡 **Ham Radio Tools** - Propagation forecasts, band conditions
- 📰 **RSS Feeds** - Geo-located news and events
- 🌐 **Custom Layers** - Community-contributed data overlays
- 💾 **Cloud Sync** - Save preferences across devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (we recommend using [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm))
- npm or yarn package manager

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── Map/              # MapContainer with terminator
│   │   ├── TimeDisplay/      # World clock component
│   │   └── LayerPanel/       # Layer toggle UI
│   ├── lib/                  # Core utilities
│   │   ├── terminator.ts    # Solar terminator calculation
│   │   ├── time.ts          # Time utilities
│   │   └── layers/          # Layer SDK
│   ├── store/               # Zustand state management
│   │   └── appStore.ts      # Global app state
│   └── types/               # TypeScript definitions
├── public/                   # Static assets
└── package.json
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (React 18)
- **Mapping**: MapLibre GL JS (open source)
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Time Calculations**: SunCalc, date-fns
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## 📚 Key Concepts

### Layer SDK

The Layer SDK enables easy addition of new data overlays without modifying core code:

```typescript
// Define a layer in your manifest
{
  id: 'my-custom-layer',
  name: 'Custom Data',
  type: 'geojson',
  source: {
    url: '/api/my-data.geojson',
    ttl: 300 // Cache for 5 minutes
  },
  style: {
    renderer: 'circles',
    paint: {
      'circle-color': '#ff0000',
      'circle-radius': 6
    }
  }
}
```

### Time System

All times are calculated client-side with support for:
- UTC (primary display)
- Local time (auto-detected)
- Multiple timezones
- Solar time (for ham radio operators)

### Terminator Calculation

The day/night terminator is calculated using the SunCalc library with binary search for precision. It updates every 60 seconds to provide smooth, accurate visualization.

## 🎨 Kiosk Mode

Perfect for wall displays and TVs:
- Press the fullscreen button to enter kiosk mode
- Minimal UI with large time display
- Automatic terminator updates
- Press the minimize button to exit

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and customize:

```bash
# Optional custom tile server
NEXT_PUBLIC_TILE_SERVER_URL=https://your-tiles.com/{z}/{x}/{y}.png

# Backend API (when ready)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Map Styles

The default map uses OpenStreetMap tiles. You can customize by:
1. Modifying the `style` object in `MapContainer.tsx`
2. Using your own tile server
3. Adding multiple style presets

## 🗺️ Roadmap

### Sprint 1 (Weeks 1-2) ✅
- [x] Next.js project setup
- [x] MapLibre GL integration
- [x] Day/night terminator
- [x] Time display system
- [x] Layer SDK foundation
- [x] Kiosk mode

### Sprint 2 (Weeks 3-4)
- [ ] Space weather data integration
- [ ] ISS tracking
- [ ] Satellite pass predictions
- [ ] HF/VHF propagation overlay
- [ ] User location detection

### Sprint 3 (Weeks 5-6)
- [ ] RSS feed integration
- [ ] RSS-to-GeoJSON bridge
- [ ] Event ticker panel
- [ ] Custom RSS feed support
- [ ] Geocoding service

### Sprint 4 (Weeks 7-8)
- [ ] Mobile optimization
- [ ] Performance tuning
- [ ] User preferences storage
- [ ] Share/embed functionality
- [ ] Public beta launch

## 🤝 Contributing

We welcome contributions! The Layer SDK makes it easy to add new data sources:

1. Fork the repository
2. Create a new layer manifest
3. Test your layer
4. Submit a pull request

## 📝 License

[MIT License](LICENSE)

## 🙏 Acknowledgments

- OpenStreetMap contributors for map tiles
- MapLibre GL for the mapping engine
- SunCalc for solar position calculations
- The ham radio and OSINT communities for inspiration

## 📧 Contact

Project Terminus - Building the future of geospatial intelligence

---

**Status**: 🚧 Active Development (MVP Phase)
**Version**: 0.1.0
**Last Updated**: September 2025
