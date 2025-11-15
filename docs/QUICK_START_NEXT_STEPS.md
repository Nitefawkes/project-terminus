# Quick Start: Next Immediate Steps

**For developers ready to contribute to Project Terminus**

---

## 🎯 Where We Are

✅ **What's Working:**
- Frontend map with real-time terminator
- Space weather data (Kp index, solar wind, aurora)
- ISS tracking with ground track
- Beautiful UI with kiosk mode

❌ **What's Missing:**
- Backend is scaffolded but not implemented
- No database, no API endpoints
- No user authentication or data persistence
- No OSINT heat map features

---

## 🚀 Your First Tasks (This Week)

### 1. Environment Setup (30 minutes)

Create environment configuration files:

#### `frontend/.env.example`
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional: Analytics
NEXT_PUBLIC_SENTRY_DSN=

# Optional: Custom tile server
NEXT_PUBLIC_TILE_SERVER_URL=
```

#### `backend/.env.example`
```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=project_terminus

# Redis
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your-refresh-secret-here-change-in-production
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# External APIs (optional)
N2YO_API_KEY=
NOAA_API_KEY=
```

Copy these to `.env.local` and `.env` respectively and fill in real values.

### 2. Database Schema Design (1-2 hours)

Create the database schema file:

#### `backend/src/database/schema.sql`
```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false
);

-- User preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    map_style VARCHAR(50) DEFAULT 'dark',
    default_zoom DECIMAL(4,2) DEFAULT 2.0,
    default_center GEOGRAPHY(POINT, 4326),
    enabled_layers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- User pins (custom locations)
CREATE TABLE pins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index on pins
CREATE INDEX idx_pins_location ON pins USING GIST(location);

-- Create index on user email
CREATE INDEX idx_users_email ON users(email);

-- Create index on user_preferences user_id
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Create index on pins user_id
CREATE INDEX idx_pins_user_id ON pins(user_id);
```

### 3. Implement User Entity (30 minutes)

#### `backend/src/modules/users/entities/user.entity.ts`
```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { UserPreferences } from './user-preferences.entity';
import { Pin } from './pin.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  @Exclude()
  passwordHash: string;

  @Column()
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @OneToOne(() => UserPreferences, (prefs) => prefs.user)
  preferences: UserPreferences;

  @OneToMany(() => Pin, (pin) => pin.user)
  pins: Pin[];
}
```

#### `backend/src/modules/users/entities/user-preferences.entity.ts`
```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'map_style', default: 'dark' })
  mapStyle: string;

  @Column({ name: 'default_zoom', type: 'decimal', default: 2.0 })
  defaultZoom: number;

  @Column({ name: 'default_center', type: 'geography', nullable: true })
  defaultCenter: string;

  @Column({ name: 'enabled_layers', type: 'jsonb', default: [] })
  enabledLayers: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.preferences)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

#### `backend/src/modules/users/entities/pin.entity.ts`
```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Point } from 'geojson';

@Entity('pins')
export class Pin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: Point;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.pins)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### 4. Create Initial Migration (15 minutes)

Run:
```bash
cd backend
npm run migration:generate -- InitialSchema
```

This will create a migration file based on your entities.

### 5. Update Users Module (15 minutes)

#### `backend/src/modules/users/users.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { Pin } from './entities/pin.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPreferences, Pin])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## 📚 Additional Resources

### Learning Resources
- **NestJS Docs:** https://docs.nestjs.com/
- **TypeORM Docs:** https://typeorm.io/
- **PostGIS Tutorial:** https://postgis.net/workshops/postgis-intro/
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8725

### Recommended Tools
- **Database Client:** DBeaver, pgAdmin, or TablePlus
- **API Testing:** Insomnia or Postman
- **Redis Client:** RedisInsight or Medis

### Code Quality Tools
```bash
# Backend
cd backend
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install --save-dev prettier eslint-config-prettier

# Frontend already has these configured
```

---

## 🐛 Common Issues & Solutions

### Issue: TypeORM can't find entities
**Solution:** Make sure entities are in `src/modules/*/entities/*.entity.ts` and `autoLoadEntities: true` is set in TypeORM config.

### Issue: PostGIS functions not working
**Solution:** Ensure PostGIS extension is enabled: `CREATE EXTENSION IF NOT EXISTS postgis;`

### Issue: CORS errors in development
**Solution:** Add CORS configuration to `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
});
```

### Issue: Database connection refused
**Solution:** Check Docker is running: `docker-compose up -d postgres`

---

## ✅ Checklist for Week 1

- [ ] Environment files created and configured
- [ ] Database schema designed and documented
- [ ] User entities implemented
- [ ] Initial migration created and tested
- [ ] Users module structure in place
- [ ] Database running with PostGIS
- [ ] Redis running and accessible

Once you complete these tasks, you'll be ready to move on to implementing the Auth module!

---

## 🆘 Need Help?

1. Check the [REPO_REVIEW.md](./REPO_REVIEW.md) for context
2. Review the [TASKS.md](../TASKS.md) for full task breakdown
3. Read the [CONTRIBUTING.md](./CONTRIBUTING.md) guide
4. Open a GitHub discussion for questions

---

**Good luck, and happy coding! 🚀**

