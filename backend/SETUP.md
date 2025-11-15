# Backend Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ with PostGIS extension
- Docker (optional, recommended)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Then edit `.env` and set your values:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=project_terminus

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 3. Start Database with Docker

```bash
# From project root
docker-compose up -d postgres redis
```

This will start:
- PostgreSQL with PostGIS on port 5432
- Redis on port 6379

### 4. Initialize Database

The database will be automatically initialized with the schema from `database/init.sql` when Docker starts.

To manually run the initialization:

```bash
# Connect to PostgreSQL
docker exec -it terminus-postgres psql -U postgres -d project_terminus

# Or use psql directly if you have it installed
psql -U postgres -d project_terminus -f ../database/init.sql
```

### 5. (Optional) Load Seed Data

For development, you can load test users:

```bash
docker exec -it terminus-postgres psql -U postgres -d project_terminus -f /docker-entrypoint-initdb.d/../seeds/dev-seed.sql
```

This creates three test users:
- `admin@terminus.dev` - password: `password123`
- `user@terminus.dev` - password: `password123`
- `demo@terminus.dev` - password: `password123`

### 6. Start the Backend Server

```bash
npm run start:dev
```

The API will be available at:
- API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/api/docs

## Testing the API

### Register a New User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `access_token` from the response.

### Get User Profile

```bash
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create a Pin

```bash
curl -X POST http://localhost:3001/api/users/pins \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Location",
    "description": "A favorite spot",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

## Available Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/preferences` - Update user preferences
- `GET /api/users/pins` - Get user's pins
- `POST /api/users/pins` - Create a new pin
- `DELETE /api/users/pins/:id` - Delete a pin

## Database Management

### View Tables

```bash
docker exec -it terminus-postgres psql -U postgres -d project_terminus -c "\dt"
```

### Check User Count

```bash
docker exec -it terminus-postgres psql -U postgres -d project_terminus -c "SELECT COUNT(*) FROM users;"
```

### Reset Database

```bash
# Stop containers
docker-compose down

# Remove volumes
docker-compose down -v

# Restart
docker-compose up -d postgres redis
```

## Troubleshooting

### Port Already in Use

If port 3001 is already in use:

```bash
# Find the process
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process or change PORT in .env
```

### Database Connection Error

1. Ensure PostgreSQL is running:
   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

3. Verify connection string in `.env`

### JWT Secret Error

Make sure `JWT_SECRET` and `REFRESH_TOKEN_SECRET` in `.env` are at least 32 characters long.

## Development Commands

```bash
# Start in development mode (with hot reload)
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:cov

# Lint code
npm run lint

# Format code
npm run format
```

## Next Steps

1. ✅ Backend foundation is complete
2. Connect frontend to these APIs
3. Implement WebSocket gateway for real-time updates
4. Add OSINT module
5. Add Maps module for satellite data

## Need Help?

- Check the [main README](../README.md)
- Review the [API documentation](../docs/API.md)
- Visit Swagger docs at http://localhost:3001/api/docs

