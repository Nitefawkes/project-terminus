# Database Management

This directory contains database-related files for Project Terminus, including TypeORM migrations and seed data.

## Directory Structure

```
database/
├── data-source.ts          # TypeORM DataSource configuration for migrations
├── migrations/             # Database migration files
│   └── *.ts               # Migration files (timestamped)
└── seeds/                  # Seed data (future)
    └── *.ts               # Seed files
```

## Migration Management

### Overview

Project Terminus uses TypeORM migrations to manage database schema changes. This ensures:
- **Version Control**: All schema changes are tracked in git
- **Reproducibility**: Database structure is consistent across environments
- **Rollback Capability**: Migrations can be reverted if needed
- **Production Safety**: No auto-sync in production environments

### Development vs Production

**Development Environment:**
- Uses `synchronize: true` in `app.module.ts` for rapid development
- Schema changes are automatically applied
- Migrations can be generated from entity changes

**Production Environment:**
- Uses `synchronize: false` (CRITICAL for data safety)
- All schema changes must use migrations
- Migrations are run manually or via CI/CD

### Available Commands

```bash
# Generate a new migration from entity changes
npm run migration:generate -- src/database/migrations/MigrationName

# Run all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert
```

### Creating Migrations

#### Option 1: Generate from Entity Changes (Recommended)

1. Make changes to your entities (e.g., `*.entity.ts` files)
2. Generate migration:
   ```bash
   npm run migration:generate -- src/database/migrations/DescriptiveNameHere
   ```
3. Review the generated migration file
4. Edit if necessary (add data migrations, custom logic)
5. Run the migration:
   ```bash
   npm run migration:run
   ```

#### Option 2: Create Manual Migration

1. Create a new file in `src/database/migrations/`:
   ```bash
   touch src/database/migrations/$(date +%s)000-DescriptiveName.ts
   ```
2. Implement `up()` and `down()` methods
3. Run the migration

### Migration File Naming

Format: `{timestamp}-{DescriptiveName}.ts`

Examples:
- `1732320000000-AddUserIdToRssFeeds.ts`
- `1732400000000-CreateIndexesForPerformance.ts`
- `1732500000000-AddWebSocketSupport.ts`

### Migration Best Practices

#### 1. Always Provide Down Migration
```typescript
export class ExampleMigration implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add changes
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes (reverse order!)
  }
}
```

#### 2. Handle Existing Data
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  // Add column as nullable first
  await queryRunner.addColumn('table', new TableColumn({
    name: 'new_column',
    type: 'varchar',
    isNullable: true,
  }));

  // Migrate existing data
  await queryRunner.query(`
    UPDATE table SET new_column = 'default_value' WHERE new_column IS NULL
  `);

  // Make non-nullable
  await queryRunner.changeColumn('table', 'new_column', new TableColumn({
    name: 'new_column',
    type: 'varchar',
    isNullable: false,
  }));
}
```

#### 3. Use Transactions
TypeORM migrations run in transactions by default. Don't disable unless necessary.

#### 4. Test Migrations
```bash
# Run migration
npm run migration:run

# Verify database state
# ... check your data ...

# Revert migration
npm run migration:revert

# Verify rollback worked
# ... check your data ...

# Run again
npm run migration:run
```

#### 5. Add Indexes Carefully
```typescript
// Good: Add index after column exists
await queryRunner.createIndex('table', new TableIndex({
  name: 'IDX_table_column',
  columnNames: ['column'],
}));

// In down migration, drop indexes before dropping columns
await queryRunner.dropIndex('table', 'IDX_table_column');
await queryRunner.dropColumn('table', 'column');
```

### Example Migration: Adding User Scoping

See `1732320000000-AddUserIdToRssFeeds.ts` for a complete example that:
- Adds a new column (user_id)
- Handles existing data
- Changes column to non-nullable
- Adds foreign key constraint
- Creates index for performance
- Provides complete rollback

### Running Migrations in Different Environments

#### Development (Auto-sync enabled)
```bash
# Option 1: Just rely on auto-sync
npm run start:dev

# Option 2: Disable auto-sync and use migrations
# Edit app.module.ts: synchronize: false
npm run migration:run
npm run start:dev
```

#### Production (Auto-sync MUST be disabled)
```bash
# Before deploying new code
npm run migration:run

# Start application
npm run start:prod
```

#### Docker Container
```dockerfile
# In your Dockerfile or docker-compose.yml
CMD ["sh", "-c", "npm run migration:run && npm run start:prod"]
```

### Checking Migration Status

TypeORM stores migration history in the `migrations` table:

```sql
-- See what migrations have been run
SELECT * FROM migrations;

-- See migration order
SELECT * FROM migrations ORDER BY timestamp;
```

### Common Issues and Solutions

#### Issue: Migration fails partway through
**Solution:** Fix the migration file and re-run. TypeORM tracks completed migrations.

#### Issue: Need to change a migration that's already run
**Solution:**
1. Revert the migration: `npm run migration:revert`
2. Edit the migration file
3. Re-run: `npm run migration:run`

**If in production:** Create a new migration instead of modifying the old one.

#### Issue: Auto-sync and migrations conflict
**Solution:** Choose one approach per environment:
- Development: Auto-sync OR migrations (not both)
- Production: Migrations only (never auto-sync)

#### Issue: Foreign key constraint violations
**Solution:** Ensure correct order:
1. Create referenced table first
2. Create referencing table
3. Add foreign key constraint

When dropping:
1. Drop foreign key constraint first
2. Drop columns
3. Drop tables

### Data Migrations

For complex data transformations:

```typescript
export class MigrateUserData implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fetch existing data
    const users = await queryRunner.query('SELECT * FROM users');

    // Transform data
    for (const user of users) {
      const transformedData = transformLogic(user);
      await queryRunner.query(
        `UPDATE users SET new_column = $1 WHERE id = $2`,
        [transformedData, user.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert data transformation
  }
}
```

### Seeds (Future)

For test data and initial application data:

```bash
# Run seeds
npm run seed:run
```

**Note:** Seeds are NOT yet implemented. They should be created in `src/database/seeds/` when needed.

## Current Migrations

### 1732320000000-AddUserIdToRssFeeds
**Purpose:** Add user scoping to RSS feeds for multi-tenant security

**Changes:**
- Adds `user_id` column to `rss_feeds` table
- Creates foreign key to `users` table with CASCADE delete
- Adds index on `user_id` for query performance

**Data Migration Strategy:**
- Deletes any feeds without a user (should be none in clean setup)
- In existing deployments, may need to assign feeds to a default user

**Breaking Change:** Yes - requires all feeds to have an owner

**Required Actions:**
1. Backup database before running
2. Run migration: `npm run migration:run`
3. Verify all feeds have valid user_id
4. Test multi-user scenarios

## Database Backup and Recovery

### Before Running Migrations

```bash
# PostgreSQL backup
pg_dump -h localhost -U postgres -d project_terminus > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore if needed
psql -h localhost -U postgres -d project_terminus < backup_20231123_120000.sql
```

### Automated Backups (Recommended for Production)

```bash
# Add to crontab for daily backups
0 2 * * * pg_dump -h localhost -U postgres -d project_terminus | gzip > /backups/project_terminus_$(date +\%Y\%m\%d).sql.gz
```

## Migration Checklist

Before running migrations in production:

- [ ] Database backup created
- [ ] Migration tested in development
- [ ] Migration tested in staging (if available)
- [ ] Down migration tested (rollback works)
- [ ] Data migration strategy documented
- [ ] Team notified of potential downtime
- [ ] Monitoring in place to detect issues

## Resources

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [PostgreSQL Migration Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)
- [Database Schema Versioning](https://www.liquibase.com/database-schema-change-management)

## Support

For migration issues or questions:
1. Check this README
2. Review existing migrations for examples
3. Consult TypeORM documentation
4. Ask in team chat or create an issue
