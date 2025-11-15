# Contributing to Project Terminus

Thank you for your interest in contributing to Project Terminus! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+ with PostGIS extension
- Docker (recommended for local development)
- Git

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/project-terminus.git
   cd project-terminus
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   # Configure your environment variables
   ```

4. **Start Development Environment**
   ```bash
   # Using Docker (recommended)
   docker-compose up -d
   
   # Or manually
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages
Follow the conventional commits format:
```
type(scope): description

Examples:
feat(map): add satellite tracking overlay
fix(osint): resolve heat map rendering issue
docs(api): update endpoint documentation
```

## 🏗️ Project Structure

### Frontend (Next.js)
```
frontend/src/
├── app/                 # Next.js 14 app router
├── components/          # React components
│   ├── Map/            # Map-related components
│   ├── OSINT/          # OSINT visualization
│   └── UI/             # Shared UI components
├── hooks/              # Custom React hooks
├── store/              # State management
├── types/              # TypeScript definitions
└── utils/              # Utility functions
```

### Backend (NestJS)
```
backend/src/
├── modules/            # Feature modules
│   ├── auth/          # Authentication
│   ├── maps/          # Map services
│   ├── osint/         # OSINT data processing
│   ├── satellites/    # Satellite tracking
│   └── users/         # User management
├── common/            # Shared utilities
└── database/          # Database configuration
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test          # Run tests
npm run test:watch    # Watch mode
```

### Backend Testing
```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

## 🔍 Code Review Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following the style guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Use the PR template
   - Provide clear description
   - Link related issues
   - Add screenshots if applicable

## 📊 Data Sources Integration

When adding new data sources:

1. **Create Service Module**
   ```typescript
   // backend/src/modules/your-source/your-source.service.ts
   @Injectable()
   export class YourSourceService {
     async fetchData(): Promise<YourDataType> {
       // Implementation
     }
   }
   ```

2. **Add Type Definitions**
   ```typescript
   // frontend/src/types/your-source.ts
   export interface YourDataType {
     // Type definitions
   }
   ```

3. **Create Frontend Component**
   ```typescript
   // frontend/src/components/YourSource/index.tsx
   export const YourSourceComponent: React.FC = () => {
     // Component implementation
   };
   ```

## 🐛 Bug Reports

When reporting bugs, please include:
- **Environment**: OS, Browser, Node.js version
- **Steps to Reproduce**: Clear step-by-step instructions
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Console Logs**: Any error messages

## 💡 Feature Requests

For new features:
- **Use Case**: Why is this feature needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other approaches considered
- **Additional Context**: Any other relevant information

## 📝 Documentation

- Update README.md for significant changes
- Add JSDoc comments for functions and classes
- Update API documentation for backend changes
- Add inline comments for complex logic

## 🎯 Development Focus Areas

### Sprint 1: Living Map
- [ ] Map rendering with Mapbox GL JS
- [ ] Real-time day/night terminator
- [ ] Basic UI controls

### Sprint 2: Essential Overlays
- [ ] ISS tracking integration
- [ ] Layer toggle functionality
- [ ] Custom location pins

### Sprint 3: OSINT Integration
- [ ] ACLED/GDELT data ingestion
- [ ] Heat map visualization
- [ ] Event tooltips

### Sprint 4: Polish & Features
- [ ] User authentication
- [ ] Data persistence
- [ ] Responsive design

## 🤝 Community

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Report bugs and request features
- **Discord**: Join our development chat (link coming soon)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Project Terminus! 🌍
