# 🚀 START HERE - Project Terminus Quick Launch

**Welcome! This guide will get you up and running in 10 minutes.**

---

## 📋 What We've Built

✅ **Backend Foundation** (COMPLETE)
- User authentication with JWT
- User management APIs
- Database schema with PostgreSQL + PostGIS
- Full CRUD for user pins and preferences

✅ **Frontend Core** (COMPLETE)
- Beautiful map with real-time terminator
- Space weather integration
- ISS tracking
- Kiosk mode

🔄 **Next Step:** Connect frontend to backend!

---

## ⚡ Quick Start (3 Steps)

### Step 1: Set Up Environment (2 minutes)

You need to create `.env` files manually:

#### Frontend Environment
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Backend Environment
Create `backend/.env`:
```env
# Server
NODE_ENV=development
PORT=3001

# Database (matches docker-compose.yml)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=project_terminus

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-long
REFRESH_TOKEN_SECRET=your-refresh-secret-key-change-in-production-min-32-chars

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Step 2: Start Services (3 minutes)

Open 3 terminal windows:

#### Terminal 1: Database
```bash
docker-compose up -d postgres redis
```

Wait for database to initialize (~30 seconds). Check with:
```bash
docker-compose ps
```

#### Terminal 2: Backend
```bash
cd backend
npm install  # First time only
npm run start:dev
```

Wait for: `🚀 Project Terminus API is running on: http://localhost:3001`

#### Terminal 3: Frontend
```bash
cd frontend
npm install  # First time only
npm run dev
```

Wait for: `Ready - started server on 0.0.0.0:3000`

### Step 3: Test It! (2 minutes)

1. **Frontend:** Open http://localhost:3000
   - You should see the beautiful map with terminator!

2. **Backend API:** Open http://localhost:3001/api/docs
   - Swagger UI with all API endpoints

3. **Test Authentication:**
   ```bash
   # Register a user
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "name": "Test User"
     }'
   ```

   You'll get back an `access_token` - save it!

4. **Test Authenticated Endpoint:**
   ```bash
   # Get profile (replace YOUR_TOKEN with the access_token from above)
   curl -X GET http://localhost:3001/api/users/profile \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

## 🎯 You're Ready!

### What Works Now
- ✅ Map with real-time terminator
- ✅ Space weather data
- ✅ ISS tracking
- ✅ Backend authentication
- ✅ User management APIs

### What's Next
The frontend needs to be connected to the backend APIs. See the **Development Path** below.

---

## 📚 Documentation Guide

**For Quick Setup:**
- 📄 `START_HERE.md` ← You are here!
- 📄 `IMPLEMENTATION_STATUS.md` - What's done and what's next

**For Development:**
- 📄 `TASKS.md` - Detailed task list
- 📄 `backend/SETUP.md` - Backend setup guide
- 📄 `docs/QUICK_START_NEXT_STEPS.md` - Code examples

**For Understanding:**
- 📄 `docs/REPO_REVIEW.md` - Complete project analysis
- 📄 `README.md` - Original project overview
- 📄 `docs/API.md` - API documentation

---

## 🛠️ Development Path

### Option A: Frontend Integration (Recommended)
**Time:** 4-6 hours  
**Goal:** Users can register, login, and manage pins

1. Create API client (`frontend/src/lib/api/client.ts`)
2. Build login/register pages
3. Add authentication context
4. Connect pin management to backend
5. Test end-to-end flow

**Start with:** `docs/QUICK_START_NEXT_STEPS.md` has code examples!

### Option B: Backend Expansion
**Time:** 1-2 weeks  
**Goal:** Add OSINT and WebSocket features

1. Implement WebSocket gateway
2. Create Maps module
3. Start OSINT integration
4. Add comprehensive tests

### Option C: Testing & Quality
**Time:** 3-5 days  
**Goal:** Ensure stability and quality

1. Write unit tests for services
2. Add integration tests
3. Set up E2E testing
4. Add monitoring

---

## 🐛 Troubleshooting

### Database Won't Start
```bash
# Check if port 5432 is already in use
docker-compose down
docker-compose up -d postgres redis
docker-compose logs postgres
```

### Backend Won't Connect to Database
1. Make sure database is running: `docker-compose ps`
2. Check `.env` file has correct credentials
3. Wait 30 seconds for database to fully initialize

### Port 3000 or 3001 Already in Use
```bash
# macOS/Linux
lsof -i :3000
lsof -i :3001

# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill the process or change ports in .env
```

### JWT Token Errors
Make sure JWT_SECRET and REFRESH_TOKEN_SECRET in `backend/.env` are at least 32 characters.

---

## 📊 Project Status

| Component | Status | Next Step |
|-----------|--------|-----------|
| Frontend Core | ✅ 70% | Connect to backend |
| Backend Foundation | ✅ 90% | Add WebSocket |
| Database | ✅ 100% | Add migrations |
| Authentication | ✅ 100% | Frontend integration |
| OSINT Features | ⚪ 0% | Research data sources |
| Testing | ⚪ 0% | Write unit tests |

**Overall Progress:** 60% complete

---

## 🆘 Need Help?

1. **Quick Questions:** Check `IMPLEMENTATION_STATUS.md`
2. **Setup Issues:** See `backend/SETUP.md`
3. **Code Examples:** See `docs/QUICK_START_NEXT_STEPS.md`
4. **Understanding Architecture:** See `docs/REPO_REVIEW.md`

---

## ✅ Success Checklist

After following this guide, you should have:
- [ ] Database running in Docker
- [ ] Backend API at http://localhost:3001
- [ ] Frontend at http://localhost:3000
- [ ] Swagger docs at http://localhost:3001/api/docs
- [ ] Successfully registered a test user
- [ ] Received a JWT token
- [ ] Made an authenticated API call

If you have all ✅ - **congratulations, you're ready to develop!** 🎉

---

## 🚀 Next Command to Run

```bash
# Start developing the frontend API integration
cd frontend/src/lib
mkdir -p api
# Then create api/client.ts following docs/QUICK_START_NEXT_STEPS.md
```

**Happy coding!** 🌍

