# Project Terminus: Global Intelligence Dashboard with OSINT Heat Map

A next-generation global intelligence dashboard that transforms passive world map viewing into an interactive OSINT (Open Source Intelligence) exploration platform.

## 🌍 Overview

Project Terminus is designed to be the portable, affordable, and extensible alternative to expensive hardware-bound solutions like Geochron. It delivers high-quality aesthetic appeal in a web browser while adding powerful, interactive OSINT capabilities, shifting the paradigm from passive viewing to active exploration.

### Key Features

- **Live World Map**: Real-time day/night terminator visualization
- **OSINT Heat Map**: Dynamic multi-domain intelligence overlays
- **Satellite Tracking**: Real-time ISS and satellite position tracking
- **Interactive Analysis**: Click-to-explore functionality with contextual data
- **Multi-Platform**: Runs in any modern web browser
- **Extensible**: Plugin architecture for custom data layers

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 14 with React 18
- **Mapping**: Mapbox GL JS for high-performance visualization
- **State Management**: Zustand for efficient state handling
- **Styling**: Tailwind CSS for responsive design
- **TypeScript**: Full type safety throughout the application

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with PostGIS extension for geospatial data
- **Real-time**: WebSockets for live data updates
- **API**: RESTful API with GraphQL support
- **Authentication**: JWT-based auth with refresh tokens

### Infrastructure
- **Containerization**: Docker for consistent deployments
- **Frontend Hosting**: Vercel/Netlify
- **Backend Hosting**: Railway/Render/AWS
- **CI/CD**: GitHub Actions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+ with PostGIS extension
- Docker (optional, for local development)
- Mapbox account and API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nitefawkes/project-terminus.git
   cd project-terminus
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment templates
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   
   # Configure your environment variables
   # - Mapbox API key
   # - Database connection strings
   # - Authentication secrets
   ```

4. **Database Setup**
   ```bash
   # Start PostgreSQL with PostGIS (using Docker)
   docker-compose up -d postgres
   
   # Run migrations
   cd backend
   npm run migration:run
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run start:dev
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

Visit `http://localhost:3000` to see the application.

## 📋 Development Roadmap

### MVP (8 weeks)
- [x] **Sprint 1**: Living Map with day/night terminator
- [ ] **Sprint 2**: Essential overlays & ISS tracking
- [ ] **Sprint 3**: OSINT heat map integration
- [ ] **Sprint 4**: User authentication & personalization

### Phase 1: Core Enhancement (3-6 months)
- Multi-domain OSINT integration
- Historical data playback
- Advanced weather layers
- Custom dashboard creation

### Phase 2: Monetization (6-12 months)
- Freemium tier implementation
- Pro/Intel subscription plans
- Advanced analytics features
- Team collaboration tools

### Phase 3: Platform Expansion (12+ months)
- Public API launch
- Plugin marketplace
- Embedded maps
- Mobile applications

## 🛠️ Project Structure

```
project-terminus/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js 14 app router
│   │   ├── components/      # React components
│   │   │   ├── Map/         # Map-related components
│   │   │   ├── OSINT/       # OSINT visualization components
│   │   │   └── UI/          # Shared UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # State management
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
├── backend/                 # NestJS backend application
│   └── src/
│       ├── modules/         # Feature modules
│       │   ├── auth/        # Authentication
│       │   ├── maps/        # Map data services
│       │   ├── osint/       # OSINT data processing
│       │   ├── satellites/  # Satellite tracking
│       │   └── users/       # User management
│       └── common/          # Shared utilities
├── database/                # Database configuration
│   ├── migrations/          # Database migrations
│   └── seeds/               # Seed data
├── docker/                  # Docker configurations
├── docs/                    # Documentation
└── scripts/                 # Deployment scripts
```

## 🔧 Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Frontend | Next.js 14, React 18 | Modern web framework |
| Mapping | Mapbox GL JS | High-performance mapping |
| Backend | NestJS, TypeScript | Scalable API framework |
| Database | PostgreSQL, PostGIS | Geospatial data storage |
| State | Zustand | Lightweight state management |
| Styling | Tailwind CSS | Utility-first CSS |
| Real-time | WebSockets | Live data updates |
| Container | Docker | Consistent deployments |

## 📊 Data Sources

- **Satellite Data**: N2YO API, CelesTrak
- **OSINT Events**: ACLED, GDELT
- **Weather**: OpenWeatherMap, Open-Meteo
- **Geopolitical**: Various open data sources
- **Time Zones**: TimeZoneDB API

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the Geochron Digital 4K
- Built with open source technologies
- Community-driven development

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/Nitefawkes/project-terminus/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Nitefawkes/project-terminus/discussions)

---

**Project Terminus** - Transforming global awareness through interactive intelligence.
