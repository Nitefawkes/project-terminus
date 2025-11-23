# Database Migration Guide

**Date:** 2025-11-23
**Status:** ✅ Migration Infrastructure Ready
**Priority:** High (Required for Production)

## Overview

This guide explains the database migration setup for Project Terminus, including how to run the userId migration and manage future schema changes.

## Why Migrations?

Project Terminus currently uses **TypeORM auto-sync** in development for rapid iteration. However, this approach:
- ❌ Is not safe for production (can cause data loss)
- ❌ Doesn't provide rollback capability
- ❌ Doesn't track schema changes in version control
- ❌ Can't handle complex data migrations

**Migrations solve all these problems** by providing:
- ✅ Version-controlled schema changes
- ✅ Reproducible database structure
- ✅ Safe rollback capability
- ✅ Data migration support
- ✅ Production-ready deployments

## Current Status

### Migration Infrastructure ✅

| Component | Status | Location |
|-----------|--------|----------|
| Data Source Config | ✅ Created | `backend/src/database/data-source.ts` |
| Migrations Directory | ✅ Created | `backend/src/database/migrations/` |
| Migration Scripts | ✅ Available | `package.json` |
| Initial Migration | ✅ Created | `AddUserIdToRssFeeds` |

### Development Environment

**Current Setup:**
- Auto-sync: **ENABLED** (for development)
- Migration tracking: **AVAILABLE** (but not required)

**What this means:**
- Schema changes happen automatically when you run the app
- You CAN run migrations manually if you want
- Both approaches work in development

### Production Environment

**Required Setup:**
- Auto-sync: **DISABLED** (MUST be false)
- Migration tracking: **REQUIRED**

**What this means:**
- Schema changes ONLY happen via migrations
- You MUST run migrations before deploying
- Auto-sync would be dangerous

## The UserID Migration

### What It Does

The `AddUserIdToRssFeeds` migration implements multi-tenant security by:

1. **Adding `user_id` column** to `rss_feeds` table
2. **Creating foreign key** to `users` table (CASCADE delete)
3. **Adding index** on `user_id` for performance
4. **Handling existing data** (deletes feeds without users)

### When to Run It

**Development (Auto-sync enabled):**
- Migration is **OPTIONAL** - auto-sync will add the column automatically
- Run it if you want to practice the migration workflow
- Useful for testing the migration before production

**Production (Auto-sync disabled):**
- Migration is **REQUIRED** - must run before deploying code
- Critical for proper database schema
- Must be run before starting new application code

### How to Run It

#### Step 1: Backup Database (Production Only)

```bash
# Create backup
pg_dump -h localhost -U postgres -d project_terminus > backup_before_userid_migration.sql

# Verify backup exists
ls -lh backup_before_userid_migration.sql
```

#### Step 2: Run Migration

```bash
cd backend

# Run all pending migrations
npm run migration:run
```

**Expected Output:**
```
query: SELECT * FROM "migrations" "migrations" ORDER BY "id" DESC
query: BEGIN TRANSACTION
query: ALTER TABLE "rss_feeds" ADD "user_id" uuid
query: DELETE FROM rss_feeds WHERE user_id IS NULL
query: ALTER TABLE "rss_feeds" ALTER COLUMN "user_id" SET NOT NULL
query: ALTER TABLE "rss_feeds" ADD CONSTRAINT "FK_rss_feeds_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
query: CREATE INDEX "IDX_rss_feeds_user_id" ON "rss_feeds" ("user_id")
query: INSERT INTO "migrations"("timestamp", "name") VALUES ($1, $2) -- PARAMETERS: [1732320000000,"AddUserIdToRssFeeds1732320000000"]
query: COMMIT
Migration AddUserIdToRssFeeds1732320000000 has been executed successfully.
```

#### Step 3: Verify Migration

```bash
# Connect to database
psql -h localhost -U postgres -d project_terminus

# Check the column exists
\d rss_feeds

# Should show:
# Column  | Type | Nullable | Default
# user_id | uuid | not null |

# Check foreign key exists
\d rss_feeds

# Should show:
# Foreign-key constraints:
#   "FK_rss_feeds_user" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

# Check index exists
\di

# Should show:
# IDX_rss_feeds_user_id

# Exit psql
\q
```

#### Step 4: Start Application

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

### If Something Goes Wrong

#### Rollback Migration

```bash
npm run migration:revert
```

**Expected Output:**
```
query: SELECT * FROM "migrations" "migrations" ORDER BY "id" DESC
query: BEGIN TRANSACTION
query: DROP INDEX "IDX_rss_feeds_user_id"
query: ALTER TABLE "rss_feeds" DROP CONSTRAINT "FK_rss_feeds_user"
query: ALTER TABLE "rss_feeds" DROP COLUMN "user_id"
query: DELETE FROM "migrations" WHERE "timestamp" = $1 AND "name" = $2
query: COMMIT
Migration AddUserIdToRssFeeds1732320000000 has been reverted successfully.
```

#### Restore from Backup

```bash
# Stop application
# Drop database
dropdb -h localhost -U postgres project_terminus

# Recreate database
createdb -h localhost -U postgres project_terminus

# Enable PostGIS
psql -h localhost -U postgres -d project_terminus -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Restore backup
psql -h localhost -U postgres -d project_terminus < backup_before_userid_migration.sql
```

## Migration Workflow

### For Developers

When making schema changes:

**Option 1: Auto-sync (Development)**
1. Modify entity files
2. Run `npm run start:dev`
3. Schema updates automatically
4. Document changes for production migration

**Option 2: Migrations (Recommended for significant changes)**
1. Modify entity files
2. Generate migration: `npm run migration:generate -- src/database/migrations/DescriptiveName`
3. Review and edit generated migration
4. Run migration: `npm run migration:run`
5. Test thoroughly
6. Commit migration file to git

### For Production Deployments

**Before deploying new code:**

```bash
# 1. Backup production database
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migrations
npm run migration:run

# 3. Verify migration succeeded
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT * FROM migrations;"

# 4. Deploy application code
# ... your deployment process ...

# 5. Verify application works
curl https://your-api.com/health
```

## Available Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run migration:generate` | Generate migration from entities | After changing entity files |
| `npm run migration:run` | Run all pending migrations | Before starting app (production) |
| `npm run migration:revert` | Rollback last migration | If migration fails or needs changes |

## Migration Files

### Current Migrations

1. **1732320000000-AddUserIdToRssFeeds.ts**
   - Status: ✅ Ready to run
   - Purpose: Add user scoping to RSS feeds
   - Breaking: Yes (requires userId on all feeds)

### Future Migrations

Create new migrations for:
- Adding WebSocket support
- Performance indexes
- New feature modules
- Data transformations

## Database Configuration

### Development Environment

**File:** `backend/src/app.module.ts`

```typescript
TypeOrmModule.forRoot({
  // ...
  synchronize: process.env.NODE_ENV === 'development', // Auto-sync ON
  // ...
})
```

**To disable auto-sync and use migrations:**
```typescript
TypeOrmModule.forRoot({
  // ...
  synchronize: false, // Migrations only
  // ...
})
```

### Production Environment

**File:** `backend/src/app.module.ts`

```typescript
TypeOrmModule.forRoot({
  // ...
  synchronize: false, // NEVER auto-sync in production
  // ...
})
```

## Data Migration Strategy

### Handling Existing RSS Feeds

The `AddUserIdToRssFeeds` migration handles existing data:

**Current Strategy:**
```typescript
// Delete any feeds without a user (clean setup)
await queryRunner.query('DELETE FROM rss_feeds WHERE user_id IS NULL');
```

**Alternative Strategies (if you have existing feeds):**

```typescript
// Option 1: Assign to first/admin user
const users = await queryRunner.query('SELECT id FROM users LIMIT 1');
if (users.length > 0) {
  await queryRunner.query(
    `UPDATE rss_feeds SET user_id = '${users[0].id}' WHERE user_id IS NULL`
  );
}

// Option 2: Assign to specific user
await queryRunner.query(
  `UPDATE rss_feeds SET user_id = 'ADMIN-USER-UUID-HERE' WHERE user_id IS NULL`
);

// Option 3: Delete orphaned feeds (current implementation)
await queryRunner.query('DELETE FROM rss_feeds WHERE user_id IS NULL');
```

**To modify the strategy:**
1. Edit `backend/src/database/migrations/1732320000000-AddUserIdToRssFeeds.ts`
2. Change the data migration section (commented with TODO)
3. Run the migration

## Testing Migrations

### Test in Development

```bash
# 1. Backup your dev database
pg_dump -h localhost -U postgres -d project_terminus > dev_backup.sql

# 2. Run migration
npm run migration:run

# 3. Test application
npm run start:dev
# ... test all functionality ...

# 4. Test rollback
npm run migration:revert

# 5. Verify rollback worked
npm run start:dev
# ... verify old schema works ...

# 6. Run migration again
npm run migration:run

# 7. If all good, commit migration
git add src/database/migrations/
git commit -m "Add userId migration for RSS feeds"
```

### Test with Fresh Database

```bash
# Drop database
dropdb -h localhost -U postgres project_terminus

# Recreate
createdb -h localhost -U postgres project_terminus
psql -h localhost -U postgres -d project_terminus -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Run migrations
npm run migration:run

# Start app (will create all tables via auto-sync OR migrations)
npm run start:dev
```

## Troubleshooting

### Migration says "No pending migrations"

**Cause:** Migration already ran, or TypeORM doesn't see the migration file

**Solution:**
```bash
# Check migrations table
psql -h localhost -U postgres -d project_terminus -c "SELECT * FROM migrations;"

# If migration is listed but you need to re-run it:
npm run migration:revert  # Revert it first
npm run migration:run     # Run it again
```

### Foreign key constraint violation

**Cause:** Trying to add foreign key to non-existent records

**Solution:** The migration handles this by:
1. Making column nullable first
2. Deleting/updating records without valid foreign key
3. Making column non-nullable
4. Adding foreign key constraint

### Column already exists

**Cause:** Auto-sync created the column, then migration tried to add it

**Solution:**
```bash
# Option 1: Drop the column manually
psql -h localhost -U postgres -d project_terminus -c "ALTER TABLE rss_feeds DROP COLUMN user_id;"
npm run migration:run

# Option 2: Mark migration as run without executing
# (Advanced - only if column is identical to migration)
```

### Migration fails partway through

**Cause:** SQL error in migration

**Solution:**
1. Migrations run in transactions (automatically rolled back)
2. Fix the migration file
3. Run again: `npm run migration:run`

## Production Deployment Checklist

Before running migrations in production:

- [ ] **Backup created** - Full database backup exists
- [ ] **Tested in development** - Migration works locally
- [ ] **Tested in staging** - Migration works in staging (if available)
- [ ] **Rollback tested** - Down migration works
- [ ] **Data strategy** - Existing data handling documented
- [ ] **Downtime planned** - Team/users notified if needed
- [ ] **Monitoring ready** - Logs and alerts configured
- [ ] **Rollback plan** - Backup restore process documented

## Next Steps

1. ✅ Migration infrastructure created
2. ✅ Initial migration created (userId)
3. ⏳ Test migration in development
4. ⏳ Run migration in production (when deploying)
5. ⏳ Create migrations for future schema changes

## Resources

- **Migration Files:** `backend/src/database/migrations/`
- **Data Source:** `backend/src/database/data-source.ts`
- **Detailed Guide:** `backend/src/database/README.md`
- **TypeORM Docs:** https://typeorm.io/migrations

## Support

For migration questions:
1. Check this guide
2. Review `backend/src/database/README.md`
3. Check existing migration files for examples
4. Consult TypeORM documentation

---

**Summary:** Migration infrastructure is ready. Run `npm run migration:run` before deploying to production!
