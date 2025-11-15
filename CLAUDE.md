# CLAUDE.md - AI Assistant Guide for Project Terminus

**Last Updated:** 2025-11-15
**Project Status:** MVP Phase - 60% Complete

---

## 🎯 Project Overview

**Project Terminus** is a full-stack web application that provides a global intelligence dashboard with OSINT (Open Source Intelligence) heat map capabilities. It serves as a modern, affordable alternative to hardware solutions like Geochron Digital 4K, offering:

- Real-time day/night terminator visualization
- Space weather monitoring (Kp index, solar wind, aurora tracking)
- Satellite tracking (ISS and others)
- Interactive geospatial analysis platform
- Extensible OSINT heat map overlays

**Current State:** The project has a functional frontend (70% complete) with map visualization and space weather features, and a robust backend API (90% complete) with authentication and user management. The next major milestone is integrating frontend with backend.

---

## 📁 Repository Structure

```
project-terminus/
├── frontend/                    # Next.js 14 React application
│   ├── src/
│   │   ├── app/                # Next.js app router (pages)
│   │   ├── components/         # React components (Map, SpaceWeather, LayerPanel, etc.)
│   │   ├── lib/                # Utilities (terminator calc, space-weather APIs, layers SDK)
│   │   └── store/              # Zustand state management (appStore.ts)
│   ├── package.json
│   ├── tsconfig.json           # Path aliases: @/*, @/components/*, etc.
│   ├── tailwind.config.js      # Custom color scheme, dark mode
│   └── next.config.js
│
├── backend/                     # NestJS API
│   ├── src/
│   │   ├── main.ts             # Bootstrap with Swagger
│   │   ├── app.module.ts       # Main module
│   │   └── modules/
│   │       ├── auth/           # JWT authentication (COMPLETE)
│   │       └── users/          # User management (COMPLETE)
│   ├── package.json
│   ├── tsconfig.json           # Path aliases: @/*, @/modules/*, etc.
│   └── SETUP.md
│
├── database/
│   ├── init.sql                # PostgreSQL + PostGIS schema
│   └── seeds/                  # Seed data
│
├── docs/                        # Comprehensive documentation
│   ├── API.md                  # Complete API specification
│   ├── REPO_REVIEW.md          # Architecture analysis
│   ├── QUICK_START_NEXT_STEPS.md  # Code examples
│   └── CONTRIBUTING.md         # Development guidelines
│
├── docker-compose.yml          # PostgreSQL, Redis, backend, frontend
├── package.json                # Monorepo workspace config
├── README.md                   # Project overview
├── START_HERE.md              # 10-minute quick start
├── IMPLEMENTATION_STATUS.md   # Progress tracking
├── TASKS.md                   # Detailed task list
└── LICENSE                    # MIT License
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.4 | React framework with App Router, SSR |
| React | 18.3.1 | UI library |
| TypeScript | 5.5.2 | Type safety |
| MapLibre GL | 4.0+ | Open-source mapping (replaces Mapbox) |
| Zustand | 4.5.2 | Lightweight state management |
| Tailwind CSS | 3.4.4 | Utility-first CSS |
| SunCalc | 1.9.0 | Solar terminator calculations |
| date-fns | 3.6+ | Date/time utilities |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 10.3.9 | Progressive Node.js framework |
| TypeScript | 5.5.2 | Type safety |
| TypeORM | 0.3.20 | ORM for PostgreSQL |
| PostgreSQL | 15+ | Database with PostGIS extension |
| JWT + Passport | Latest | Authentication |
| bcrypt | 5.1.1 | Password hashing |
| Socket.io | 4.7.5 | WebSocket support (planned) |
| Swagger | 7.3.1 | API documentation |

### Infrastructure
- **Docker Compose**: PostgreSQL 15, Redis 7
- **Node.js**: 18+ required
- **npm**: 8+ required
- **Workspaces**: npm workspaces for monorepo

---

## 🏗️ Architecture Patterns

### Frontend Architecture

#### 1. Component Organization
```typescript
// Components use 'use client' directive for client-side features
'use client';

// Dynamic imports to avoid SSR issues with map libraries
const MapContainer = dynamic(() => import('@/components/Map/MapContainer'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});
```

#### 2. State Management (Zustand)
- Global app state in `frontend/src/store/appStore.ts`
- Manages: time/date, map styles, layer visibility, UI panels, kiosk mode
- Simple, performant alternative to Redux

#### 3. Layer SDK Pattern
- Extensible architecture for map overlays
- Layer manifests define capabilities
- Type-safe layer definitions in `frontend/src/lib/layers/`

#### 4. Path Aliases (tsconfig.json)
```typescript
import MapContainer from '@/components/Map/MapContainer';
import { useAppStore } from '@/store/appStore';
import { calculateTerminator } from '@/lib/terminator';
```

### Backend Architecture

#### 1. NestJS Modular Design
```
modules/
├── auth/
│   ├── auth.service.ts      # Business logic
│   ├── auth.controller.ts   # REST endpoints
│   ├── guards/              # JWT auth guard
│   ├── strategies/          # Passport JWT strategy
│   └── dto/                 # Data Transfer Objects with validation
└── users/
    ├── users.service.ts
    ├── users.controller.ts
    ├── entities/            # TypeORM entities
    └── dto/
```

#### 2. Authentication Flow
- JWT-based with refresh tokens
- Bcrypt password hashing (10 rounds)
- Guards on protected routes: `@UseGuards(JwtAuthGuard)`
- Passport strategies for validation

#### 3. Database Pattern
- TypeORM entities with decorators
- PostGIS for geospatial queries
- UUID primary keys
- Automatic timestamps via triggers
- Foreign key constraints

#### 4. DTO Validation
```typescript
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
```

---

## 🔧 Development Workflows

### Initial Setup

1. **Environment Configuration**
   ```bash
   # Create frontend/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:3001

   # Create backend/.env (see START_HERE.md for full template)
   NODE_ENV=development
   PORT=3001
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=postgres
   DATABASE_NAME=project_terminus
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   REFRESH_TOKEN_SECRET=your-refresh-secret-min-32-chars
   CORS_ORIGIN=http://localhost:3000
   ```

2. **Start Infrastructure**
   ```bash
   docker-compose up -d postgres redis
   # Wait 30 seconds for database initialization
   ```

3. **Install Dependencies**
   ```bash
   # Root level installs both workspaces
   npm install

   # Or individually
   cd frontend && npm install
   cd backend && npm install
   ```

4. **Run Development Servers**
   ```bash
   # Option A: Run both (from root)
   npm run dev

   # Option B: Run separately
   cd backend && npm run start:dev    # Port 3001
   cd frontend && npm run dev         # Port 3000
   ```

### Common Development Tasks

#### Adding a New Backend Module
```bash
cd backend
nest generate module modules/your-module
nest generate service modules/your-module
nest generate controller modules/your-module
```

#### Adding a New Frontend Component
```typescript
// frontend/src/components/YourComponent/index.tsx
'use client';

import { FC } from 'react';

interface YourComponentProps {
  // Props
}

export const YourComponent: FC<YourComponentProps> = ({ }) => {
  return (
    <div className="your-tailwind-classes">
      {/* Component content */}
    </div>
  );
};
```

#### Database Migrations
```bash
cd backend
npm run migration:generate -- -n YourMigrationName
npm run migration:run
npm run migration:revert  # If needed
```

#### Running Tests
```bash
# Frontend
cd frontend
npm run test
npm run lint

# Backend
cd backend
npm run test              # Unit tests
npm run test:e2e         # E2E tests
npm run test:cov         # Coverage report
```

---

## 📝 Coding Conventions

### TypeScript Standards
- **Strict mode enabled**: All type errors must be resolved
- **Explicit types**: Avoid `any`, use proper interfaces/types
- **Naming conventions**:
  - Files: `kebab-case.ts` or `PascalCase.tsx` for components
  - Interfaces: `PascalCase` with `I` prefix optional
  - Classes: `PascalCase`
  - Functions/variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`

### Frontend Conventions
```typescript
// 1. Component structure
'use client';  // Only when needed (client-side features)

import { FC, useState, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';

interface ComponentProps {
  prop: string;
}

export const Component: FC<ComponentProps> = ({ prop }) => {
  const [state, setState] = useState<string>('');
  const { globalState } = useAppStore();

  useEffect(() => {
    // Effects
  }, []);

  return <div>{/* JSX */}</div>;
};

// 2. Tailwind classes
// Use utility classes, dark mode variants
<div className="bg-gray-900 text-white dark:bg-black">

// 3. Dynamic imports for heavy libraries
const HeavyComponent = dynamic(() => import('./Heavy'), { ssr: false });
```

### Backend Conventions
```typescript
// 1. Service structure
@Injectable()
export class YourService {
  constructor(
    private repository: Repository<Entity>,
    private otherService: OtherService,
  ) {}

  async findOne(id: string): Promise<Entity> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException('Entity not found');
    }
    return entity;
  }
}

// 2. Controller structure
@Controller('your-route')
@ApiTags('your-route')
export class YourController {
  constructor(private yourService: YourService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  @ApiResponse({ status: 200, description: 'Success' })
  async findOne(@Param('id') id: string): Promise<Entity> {
    return this.yourService.findOne(id);
  }
}

// 3. Protected routes
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@Request() req) {
  return req.user;
}
```

### Git Commit Messages
Follow conventional commits:
```
feat(scope): add new feature
fix(scope): resolve bug
docs(scope): update documentation
refactor(scope): refactor code
test(scope): add tests
chore(scope): update dependencies

Examples:
feat(map): add satellite tracking overlay
fix(osint): resolve heat map rendering issue
docs(api): update endpoint documentation
```

---

## 🧪 Testing Practices

### Frontend Testing (To Be Implemented)
```typescript
// Use Jest + React Testing Library
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Backend Testing
```typescript
// Unit tests
describe('YourService', () => {
  let service: YourService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [YourService],
    }).compile();

    service = module.get<YourService>(YourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

// E2E tests
it('/auth/login (POST)', () => {
  return request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: 'test@example.com', password: 'password123' })
    .expect(200)
    .expect((res) => {
      expect(res.body.access_token).toBeDefined();
    });
});
```

---

## 🔐 Security Considerations

### Backend Security
- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Secrets**: Minimum 32 characters, stored in `.env`
- **CORS**: Configured for frontend origin only
- **Validation**: All DTOs use class-validator
- **Guards**: JWT guards on all protected routes
- **SQL Injection**: TypeORM prevents via parameterization

### Frontend Security
- **API Keys**: Never commit to Git, use `.env.local`
- **XSS Prevention**: React escapes by default
- **HTTPS**: Use in production
- **Token Storage**: Tokens in httpOnly cookies (when implemented)

---

## 🚀 Deployment

### Environment Variables Checklist

**Frontend Production:**
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

**Backend Production:**
```env
NODE_ENV=production
PORT=3001
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_USERNAME=your-db-user
DATABASE_PASSWORD=strong-password
DATABASE_NAME=project_terminus
REDIS_HOST=your-redis-host
REDIS_PORT=6379
JWT_SECRET=strong-random-secret-min-32-chars
REFRESH_TOKEN_SECRET=another-strong-secret-min-32-chars
CORS_ORIGIN=https://your-frontend-domain.com
```

### Build Commands
```bash
# Frontend (Next.js)
cd frontend
npm run build
npm run start  # Production server

# Backend (NestJS)
cd backend
npm run build
node dist/main.js  # Production server
```

### Docker Deployment
```bash
docker-compose up -d  # All services
```

---

## 📊 Current Implementation Status

### ✅ Completed (Backend - 90%)
- User authentication (register, login, refresh tokens)
- User management (CRUD, profile, preferences)
- Pin management (location markers)
- Database schema with migrations
- Swagger API documentation
- JWT guards and Passport strategies

### ✅ Completed (Frontend - 70%)
- MapLibre GL integration
- Day/night terminator visualization
- Space weather data (NOAA API integration)
- Kp index and aurora oval display
- ISS tracking with ground track
- HF/VHF propagation forecasting
- Responsive dark UI with Tailwind
- Kiosk fullscreen mode
- Layer SDK architecture

### ⚠️ In Progress / Not Started
- Frontend-Backend API integration (0%)
- Authentication pages (login/register UI) (0%)
- WebSocket real-time updates (infrastructure ready, 0%)
- OSINT heat map features (0%)
- Comprehensive testing (10%)
- Advanced satellite tracking (planned)
- Historical data playback (planned)

---

## 🎯 Development Priorities

### Immediate Next Steps (Week 1-2)
1. **Frontend API Client**: Create `frontend/src/lib/api/client.ts` with axios
2. **Auth Pages**: Build login/register forms
3. **Auth Context**: Implement authentication state management
4. **Connect Pins**: Wire up pin management to backend API

### Short-term (Week 3-4)
1. **WebSocket Gateway**: Implement real-time updates
2. **Testing**: Add unit and integration tests
3. **Maps Module**: Create backend module for map data

### Medium-term (Month 2+)
1. **OSINT Integration**: Research and integrate data sources (ACLED, GDELT)
2. **Heat Map**: Implement visualization layer
3. **Advanced Features**: Historical playback, custom dashboards

---

## 📚 Key Files Reference

### Critical Backend Files
| File | Purpose | Lines |
|------|---------|-------|
| `backend/src/main.ts` | App bootstrap, Swagger setup | ~50 |
| `backend/src/app.module.ts` | DI configuration, imports | ~30 |
| `backend/src/modules/auth/auth.service.ts` | JWT auth logic | 145 |
| `backend/src/modules/users/users.service.ts` | User management | ~150 |
| `database/init.sql` | DB schema definition | ~130 |

### Critical Frontend Files
| File | Purpose | Lines |
|------|---------|-------|
| `frontend/src/app/page.tsx` | Main entry point | 35 |
| `frontend/src/components/Map/MapContainer.tsx` | Map implementation | ~400 |
| `frontend/src/store/appStore.ts` | Global state | ~100 |
| `frontend/src/lib/terminator.ts` | Terminator calculation | ~100 |

### Configuration Files
| File | Purpose |
|------|---------|
| `docker-compose.yml` | Infrastructure setup |
| `package.json` (root) | Monorepo workspace config |
| `frontend/tsconfig.json` | TS config with path aliases |
| `backend/tsconfig.json` | TS config for NestJS |
| `frontend/tailwind.config.js` | Custom colors, themes |

---

## 🐛 Common Gotchas & Solutions

### 1. Database Connection Issues
**Problem**: Backend can't connect to PostgreSQL
**Solution**:
- Ensure Docker containers are running: `docker-compose ps`
- Wait 30 seconds after `docker-compose up` for DB initialization
- Check `.env` credentials match `docker-compose.yml`

### 2. JWT Token Errors
**Problem**: "Invalid token" or "Unauthorized"
**Solution**:
- JWT secrets must be 32+ characters
- Check `.env` has `JWT_SECRET` and `REFRESH_TOKEN_SECRET`
- Ensure no trailing spaces in `.env` values

### 3. MapLibre SSR Issues
**Problem**: "window is not defined" errors
**Solution**:
- Always use dynamic imports with `ssr: false` for map components
- Add `'use client'` directive to components using browser APIs

### 4. Port Already in Use
**Problem**: Ports 3000, 3001, 5432, or 6379 in use
**Solution**:
```bash
# Find process
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Stop Docker services
docker-compose down
```

### 5. TypeScript Path Aliases Not Working
**Problem**: Imports like `@/components/*` fail
**Solution**:
- Restart TypeScript server in IDE
- Check `tsconfig.json` has correct `baseUrl` and `paths`
- Ensure IDE is using workspace TypeScript version

### 6. CORS Errors
**Problem**: API requests blocked by CORS
**Solution**:
- Check `backend/.env` has `CORS_ORIGIN=http://localhost:3000`
- Ensure backend is running before making requests
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`

---

## 💡 Best Practices for AI Assistants

### When Adding Features
1. **Read existing code first**: Check similar implementations in the codebase
2. **Follow established patterns**: Match existing file structure and naming
3. **Update documentation**: Add to relevant `.md` files
4. **Add TypeScript types**: Never use `any`, create proper interfaces
5. **Test your changes**: Write tests for new functionality
6. **Update IMPLEMENTATION_STATUS.md**: Track progress

### When Fixing Bugs
1. **Reproduce the issue**: Understand the problem fully
2. **Check existing issues**: May already be documented in TASKS.md
3. **Root cause analysis**: Don't just patch symptoms
4. **Add tests**: Prevent regression
5. **Document the fix**: Update comments if needed

### When Refactoring
1. **Get approval first**: Discuss major refactors
2. **Maintain backward compatibility**: Don't break existing APIs
3. **Update all references**: Use IDE find/replace
4. **Test thoroughly**: Ensure nothing breaks
5. **Update type definitions**: Keep types in sync

### Code Review Checklist
- [ ] TypeScript types are correct and specific
- [ ] No `any` types without justification
- [ ] Error handling is comprehensive
- [ ] Security considerations addressed
- [ ] Tests added for new features
- [ ] Documentation updated
- [ ] Follows existing patterns
- [ ] No console.logs in production code
- [ ] Environment variables used for secrets
- [ ] CORS and authentication properly configured

---

## 📞 Documentation Map

| Document | Purpose | When to Read |
|----------|---------|-------------|
| `README.md` | Project overview | First time contributors |
| `START_HERE.md` | Quick 10-min setup | Getting started |
| `CLAUDE.md` | AI assistant guide | You are here! |
| `IMPLEMENTATION_STATUS.md` | Current progress | Planning work |
| `TASKS.md` | Detailed task list | Finding tasks |
| `docs/API.md` | API specification | Backend development |
| `docs/REPO_REVIEW.md` | Architecture analysis | Understanding design |
| `docs/CONTRIBUTING.md` | Contribution guide | Before PRs |
| `backend/SETUP.md` | Backend setup | Backend development |

---

## 🔄 Recent Updates & Migration Notes

### 2025-11-15: MapLibre Migration
- **Changed**: Migrated from Mapbox GL to MapLibre GL JS
- **Reason**: Open-source, no API key required for base maps
- **Impact**: Update any map-related components to use MapLibre
- **Documentation**: See frontend/src/components/Map/MapContainer.tsx

### Authentication Status
- **Backend**: Fully implemented with JWT + refresh tokens
- **Frontend**: Not yet connected - needs API client and auth pages
- **Database**: Schema complete with users, preferences, pins tables

---

## 🎓 Learning Resources

### Understanding the Codebase
1. Start with `README.md` for high-level overview
2. Read `START_HERE.md` to get it running
3. Review `docs/REPO_REVIEW.md` for architecture deep-dive
4. Explore `frontend/src/app/page.tsx` to see entry point
5. Study `backend/src/modules/auth/` for backend patterns

### Technology References
- **Next.js 14**: https://nextjs.org/docs
- **NestJS**: https://docs.nestjs.com
- **MapLibre GL**: https://maplibre.org/maplibre-gl-js/docs/
- **Zustand**: https://github.com/pmndrs/zustand
- **TypeORM**: https://typeorm.io
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## ✅ Pre-Flight Checklist for AI Assistants

Before starting development:
- [ ] Read this CLAUDE.md thoroughly
- [ ] Review IMPLEMENTATION_STATUS.md for current state
- [ ] Check TASKS.md for planned work
- [ ] Understand the technology stack
- [ ] Know the file structure and conventions
- [ ] Understand authentication flow
- [ ] Review existing patterns in similar code
- [ ] Check environment setup is complete
- [ ] Verify all services are running
- [ ] Read relevant documentation in docs/

---

## 🚦 Status Indicators

**Overall Project:** 🟡 MVP Phase - 60% Complete

| Component | Status | Indicator |
|-----------|--------|-----------|
| Frontend Core | Active Development | 🟢 70% |
| Backend API | Feature Complete | 🟢 90% |
| Database | Complete | 🟢 100% |
| Frontend-Backend Integration | Not Started | 🔴 0% |
| Testing | Minimal | 🔴 10% |
| OSINT Features | Planned | ⚪ 0% |
| Documentation | Excellent | 🟢 100% |

---

**Last Review:** 2025-11-15
**Maintainer:** Nitefawkes
**License:** MIT

---

*This document is actively maintained. When making significant changes to the codebase, please update this guide accordingly.*
