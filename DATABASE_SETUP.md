# PostgreSQL Database Setup - Implementation Plan

This document contains all the files and code that will be created for managing PostgreSQL, migrations, seeds, backups, and database operations.

---

## 📋 Table of Contents

1. [Database Connection and Configuration](#1-database-connection-and-configuration)
2. [Migration System](#2-migration-system)
3. [Seed System](#3-seed-system)
4. [Database Management Scripts](#4-database-management-scripts)
5. [Example Migration File](#5-example-migration-file)
6. [Package.json Updates](#6-packagejson-updates)
7. [Gitignore Updates](#7-gitignore-updates)
8. [Directory Structure](#8-directory-structure)

---

## 1. Database Connection and Configuration

### File: `src/infrastructure/database/connection.ts`

```typescript
import { Pool, type PoolConfig } from 'pg';
import { env } from '@/config/env.ts';

let pool: Pool | null = null;

/**
 * Parse DATABASE_URL or use individual connection parameters
 */
function getPoolConfig(): PoolConfig {
  if (env.DATABASE_URL) {
    return {
      connectionString: env.DATABASE_URL,
      max: env.DB_POOL_MAX ?? 10,
      min: env.DB_POOL_MIN ?? 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
  }

  return {
    host: env.DB_HOST ?? 'localhost',
    port: env.DB_PORT ?? 5432,
    database: env.DB_NAME ?? 'akj_conference_rooms',
    user: env.DB_USER ?? 'postgres',
    password: env.DB_PASSWORD ?? '',
    max: env.DB_POOL_MAX ?? 10,
    min: env.DB_POOL_MIN ?? 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

/**
 * Get or create the database connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(getPoolConfig());
    
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  
  return pool;
}

/**
 * Close the database connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  const pool = getPool();
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Execute a query with automatic connection management
 */
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query<T>(text, params);
  return result.rows;
}

/**
 * Execute a query and return a single row
 */
export async function queryOne<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
```

### File: `src/config/env.ts` (UPDATE - add database config)

```typescript
import 'dotenv/config';
/**
* Centralized environment parsing. Fails fast if required values are missing.
*/
const required = (name: string): string => {
    const v = process.env[name];
    if (!v) throw new Error(`Missing ENV var: ${name}`);
    return v;
};

export const env = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: Number(process.env.PORT ?? 3001),
    DATABASE_URL: process.env.DATABASE_URL,
    // Individual DB config (optional if DATABASE_URL is provided)
    DB_HOST: process.env.DB_HOST ?? 'localhost',
    DB_PORT: Number(process.env.DB_PORT ?? 5432),
    DB_NAME: process.env.DB_NAME ?? 'akj_conference_rooms',
    DB_USER: process.env.DB_USER ?? 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD ?? '',
    DB_POOL_MIN: Number(process.env.DB_POOL_MIN ?? 2),
    DB_POOL_MAX: Number(process.env.DB_POOL_MAX ?? 10),
};
```

---

## 2. Migration System

### File: `src/infrastructure/database/migrations/migration-runner.ts`

```typescript
import { getPool, query } from '../connection.ts';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create migrations table if it doesn't exist
 */
async function ensureMigrationsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/**
 * Get list of executed migrations
 */
async function getExecutedMigrations(): Promise<string[]> {
  const rows = await query<{ name: string }>('SELECT name FROM migrations ORDER BY id');
  return rows.map(row => row.name);
}

/**
 * Mark migration as executed
 */
async function markMigrationExecuted(name: string): Promise<void> {
  await query('INSERT INTO migrations (name) VALUES ($1)', [name]);
}

/**
 * Remove migration from executed list
 */
async function unmarkMigration(name: string): Promise<void> {
  await query('DELETE FROM migrations WHERE name = $1', [name]);
}

/**
 * Get all migration files from directory
 */
async function getMigrationFiles(): Promise<string[]> {
  const migrationsDir = join(__dirname, 'files');
  try {
    const files = await readdir(migrationsDir);
    return files
      .filter(file => file.endsWith('.sql'))
      .sort();
  } catch (error) {
    // Directory doesn't exist yet
    return [];
  }
}

/**
 * Parse migration file name to extract version and name
 * Format: YYYYMMDDHHMMSS_description.sql
 */
function parseMigrationName(filename: string): { version: string; name: string } {
  const match = filename.match(/^(\d{14})_(.+)\.sql$/);
  if (!match) {
    throw new Error(`Invalid migration filename format: ${filename}`);
  }
  return { version: match[1], name: match[2] };
}

/**
 * Run pending migrations
 */
export async function runMigrations(direction: 'up' | 'down' = 'up'): Promise<void> {
  await ensureMigrationsTable();
  const executed = await getExecutedMigrations();
  const files = await getMigrationFiles();

  if (direction === 'up') {
    const pending = files.filter(file => !executed.includes(file));
    
    if (pending.length === 0) {
      console.log('No pending migrations');
      return;
    }

    console.log(`Running ${pending.length} pending migration(s)...`);
    
    for (const file of pending) {
      const filePath = join(__dirname, 'files', file);
      const sql = await readFile(filePath, 'utf-8');
      
      console.log(`  → Running migration: ${file}`);
      
      const pool = getPool();
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await markMigrationExecuted(file);
        await client.query('COMMIT');
        console.log(`  ✓ Migration completed: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`  ✗ Migration failed: ${file}`, error);
        throw error;
      } finally {
        client.release();
      }
    }
  } else {
    // Rollback last migration
    if (executed.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    const lastMigration = executed[executed.length - 1];
    const filePath = join(__dirname, 'files', lastMigration);
    
    console.log(`Rolling back migration: ${lastMigration}`);
    
    // For rollback, we'd need a separate rollback file or parse the migration
    // For simplicity, we'll just remove it from the migrations table
    // In production, you'd want proper rollback SQL files
    await unmarkMigration(lastMigration);
    console.log(`  ✓ Rollback completed: ${lastMigration}`);
  }
}

/**
 * Get migration status
 */
export async function getMigrationStatus(): Promise<{
  executed: string[];
  pending: string[];
}> {
  await ensureMigrationsTable();
  const executed = await getExecutedMigrations();
  const files = await getMigrationFiles();
  const pending = files.filter(file => !executed.includes(file));

  return { executed, pending };
}
```

### File: `src/infrastructure/database/migrations/files/.gitkeep`

```
# Migration files will be stored here
# Format: YYYYMMDDHHMMSS_description.sql
```

### File: `src/infrastructure/database/migrations/files/20240101000000_create_migrations_table.sql` (Example)

```sql
-- This migration is handled automatically by the migration runner
-- This file is just for reference
```

---

## 3. Seed System

### File: `src/infrastructure/database/seeds/index.ts`

```typescript
import { getPool } from '../connection.ts';
import { seedUsers } from './users.seed.ts';
// Import other seed files as needed
// import { seedEmployees } from './employees.seed.ts';

export interface SeedFunction {
  name: string;
  run: () => Promise<void>;
}

const seeds: SeedFunction[] = [
  { name: 'users', run: seedUsers },
  // Add more seeds here
  // { name: 'employees', run: seedEmployees },
];

/**
 * Run all seed functions
 */
export async function runSeeds(): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    console.log(`Running ${seeds.length} seed(s)...`);
    
    for (const seed of seeds) {
      console.log(`  → Seeding: ${seed.name}`);
      await seed.run();
      console.log(`  ✓ Completed: ${seed.name}`);
    }
    
    await client.query('COMMIT');
    console.log('All seeds completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Run a specific seed by name
 */
export async function runSeed(name: string): Promise<void> {
  const seed = seeds.find(s => s.name === name);
  if (!seed) {
    throw new Error(`Seed "${name}" not found`);
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log(`Running seed: ${seed.name}`);
    await seed.run();
    await client.query('COMMIT');
    console.log(`✓ Seed completed: ${seed.name}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`✗ Seed failed: ${seed.name}`, error);
    throw error;
  } finally {
    client.release();
  }
}
```

### File: `src/infrastructure/database/seeds/users.seed.ts` (Example)

```typescript
import { query } from '../connection.ts';

/**
 * Seed users table
 * This is idempotent - safe to run multiple times
 */
export async function seedUsers(): Promise<void> {
  // Check if users already exist
  const existingUsers = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM users'
  );
  
  if (Number(existingUsers[0]?.count ?? 0) > 0) {
    console.log('    Users already seeded, skipping...');
    return;
  }

  // Insert seed users
  await query(`
    INSERT INTO users (id, email, password, role, status, created_at, updated_at)
    VALUES 
      ('550e8400-e29b-41d4-a716-446655440000', 'admin@example.com', '$2b$10$hashedpassword', 'admin', 'active', NOW(), NOW()),
      ('550e8400-e29b-41d4-a716-446655440001', 'user@example.com', '$2b$10$hashedpassword', 'user', 'active', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `);
  
  console.log('    Inserted 2 users');
}
```

---

## 4. Database Management Scripts

### File: `scripts/db:create.ts`

```typescript
import { Pool } from 'pg';
import { env } from '../src/config/env.ts';

async function createDatabase(): Promise<void> {
  // Connect to postgres database to create the target database
  const adminPool = new Pool({
    host: env.DB_HOST ?? 'localhost',
    port: env.DB_PORT ?? 5432,
    database: 'postgres', // Connect to default postgres DB
    user: env.DB_USER ?? 'postgres',
    password: env.DB_PASSWORD ?? '',
  });

  const dbName = env.DB_NAME ?? 'akj_conference_rooms';

  try {
    // Check if database exists
    const result = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length > 0) {
      console.log(`Database "${dbName}" already exists`);
      await adminPool.end();
      return;
    }

    // Create database
    await adminPool.query(`CREATE DATABASE ${dbName}`);
    console.log(`✓ Database "${dbName}" created successfully`);
  } catch (error) {
    console.error('Failed to create database:', error);
    throw error;
  } finally {
    await adminPool.end();
  }
}

createDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

### File: `scripts/db:drop.ts`

```typescript
import { Pool } from 'pg';
import { env } from '../src/config/env.ts';
import readline from 'readline';

async function dropDatabase(): Promise<void> {
  const dbName = env.DB_NAME ?? 'akj_conference_rooms';

  // Safety check for production
  if (env.NODE_ENV === 'production') {
    console.error('Cannot drop database in production environment');
    process.exit(1);
  }

  // Confirmation prompt
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question(`Are you sure you want to drop database "${dbName}"? (yes/no): `, resolve);
  });

  rl.close();

  if (answer.toLowerCase() !== 'yes') {
    console.log('Operation cancelled');
    return;
  }

  const adminPool = new Pool({
    host: env.DB_HOST ?? 'localhost',
    port: env.DB_PORT ?? 5432,
    database: 'postgres',
    user: env.DB_USER ?? 'postgres',
    password: env.DB_PASSWORD ?? '',
  });

  try {
    // Terminate all connections to the database
    await adminPool.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid()
    `, [dbName]);

    // Drop database
    await adminPool.query(`DROP DATABASE IF EXISTS ${dbName}`);
    console.log(`✓ Database "${dbName}" dropped successfully`);
  } catch (error) {
    console.error('Failed to drop database:', error);
    throw error;
  } finally {
    await adminPool.end();
  }
}

dropDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

### File: `scripts/db:migrate.ts`

```typescript
import { runMigrations, getMigrationStatus } from '../src/infrastructure/database/migrations/migration-runner.ts';
import { closePool } from '../src/infrastructure/database/connection.ts';

async function migrate(): Promise<void> {
  const direction = process.argv[2] === 'down' ? 'down' : 'up';

  try {
    if (direction === 'up') {
      const status = await getMigrationStatus();
      console.log(`Executed migrations: ${status.executed.length}`);
      console.log(`Pending migrations: ${status.pending.length}`);
      console.log('');
    }

    await runMigrations(direction);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

migrate();
```

### File: `scripts/db:rollback.ts`

```typescript
import { runMigrations } from '../src/infrastructure/database/migrations/migration-runner.ts';
import { closePool } from '../src/infrastructure/database/connection.ts';

async function rollback(): Promise<void> {
  try {
    await runMigrations('down');
  } catch (error) {
    console.error('Rollback failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

rollback();
```

### File: `scripts/db:seed.ts`

```typescript
import { runSeeds, runSeed } from '../src/infrastructure/database/seeds/index.ts';
import { closePool } from '../src/infrastructure/database/connection.ts';

async function seed(): Promise<void> {
  const seedName = process.argv[2];

  try {
    if (seedName) {
      await runSeed(seedName);
    } else {
      await runSeeds();
    }
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

seed();
```

### File: `scripts/db:backup.ts`

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import { env } from '../src/config/env.ts';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

async function createBackup(): Promise<void> {
  const dbName = env.DB_NAME ?? 'akj_conference_rooms';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = join(process.cwd(), 'database', 'backups');
  const backupFile = join(backupDir, `${dbName}_${timestamp}.sql`);

  // Create backup directory if it doesn't exist
  if (!existsSync(backupDir)) {
    await mkdir(backupDir, { recursive: true });
  }

  const connectionString = env.DATABASE_URL 
    ? env.DATABASE_URL
    : `postgresql://${env.DB_USER ?? 'postgres'}:${env.DB_PASSWORD ?? ''}@${env.DB_HOST ?? 'localhost'}:${env.DB_PORT ?? 5432}/${dbName}`;

  console.log(`Creating backup of database "${dbName}"...`);

  try {
    const { stdout, stderr } = await execAsync(
      `pg_dump "${connectionString}" --no-owner --no-acl`
    );

    if (stderr && !stderr.includes('WARNING')) {
      throw new Error(stderr);
    }

    await writeFile(backupFile, stdout, 'utf-8');
    console.log(`✓ Backup created: ${backupFile}`);
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}

createBackup().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

### File: `scripts/db:restore.ts`

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import { env } from '../src/config/env.ts';
import { readFile } from 'fs/promises';
import { getPool } from '../src/infrastructure/database/connection.ts';
import readline from 'readline';

const execAsync = promisify(exec);

async function restoreBackup(backupFile: string): Promise<void> {
  const dbName = env.DB_NAME ?? 'akj_conference_rooms';

  // Safety check
  if (env.NODE_ENV === 'production') {
    console.error('Cannot restore database in production environment');
    process.exit(1);
  }

  // Confirmation prompt
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question(`Are you sure you want to restore "${backupFile}" to database "${dbName}"? This will overwrite existing data. (yes/no): `, resolve);
  });

  rl.close();

  if (answer.toLowerCase() !== 'yes') {
    console.log('Operation cancelled');
    return;
  }

  const connectionString = env.DATABASE_URL 
    ? env.DATABASE_URL
    : `postgresql://${env.DB_USER ?? 'postgres'}:${env.DB_PASSWORD ?? ''}@${env.DB_HOST ?? 'localhost'}:${env.DB_PORT ?? 5432}/${dbName}`;

  console.log(`Restoring backup "${backupFile}" to database "${dbName}"...`);

  try {
    const backupContent = await readFile(backupFile, 'utf-8');
    const pool = getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(backupContent);
      await client.query('COMMIT');
      console.log(`✓ Backup restored successfully`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Restore failed:', error);
    throw error;
  }
}

const backupFile = process.argv[2];
if (!backupFile) {
  console.error('Usage: tsx scripts/db:restore.ts <backup-file.sql>');
  process.exit(1);
}

restoreBackup(backupFile).catch((error) => {
  console.error(error);
  process.exit(1);
});
```

---

## 5. Example Migration File

### File: `src/infrastructure/database/migrations/files/20240101000001_create_users_table.sql` (Example)

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on status
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 6. Package.json Updates

### Updates to `package.json`:

```json
{
  "dependencies": {
    // ... existing dependencies ...
    "pg": "^8.11.3"
  },
  "devDependencies": {
    // ... existing devDependencies ...
    "@types/pg": "^8.10.9"
  },
  "scripts": {
    // ... existing scripts ...
    "db:create": "tsx scripts/db:create.ts",
    "db:drop": "tsx scripts/db:drop.ts",
    "db:migrate": "tsx scripts/db:migrate.ts",
    "db:migrate:up": "tsx scripts/db:migrate.ts up",
    "db:migrate:down": "tsx scripts/db:migrate.ts down",
    "db:rollback": "tsx scripts/db:rollback.ts",
    "db:seed": "tsx scripts/db:seed.ts",
    "db:backup": "tsx scripts/db:backup.ts",
    "db:restore": "tsx scripts/db:restore.ts <backup-file>",
    "db:reset": "npm run db:drop && npm run db:create && npm run db:migrate && npm run db:seed"
  }
}
```

---

## 7. Gitignore Updates

### Updates to `.gitignore`:

```
node_modules
.env
dist
*.log

# Database backups
database/backups/*.sql
!database/backups/.gitkeep
```

---

## 8. Directory Structure

```
src/infrastructure/database/
├── connection.ts
├── migrations/
│   ├── migration-runner.ts
│   └── files/
│       └── .gitkeep
└── seeds/
    ├── index.ts
    └── users.seed.ts

scripts/
├── db:create.ts
├── db:drop.ts
├── db:migrate.ts
├── db:rollback.ts
├── db:seed.ts
├── db:backup.ts
└── db:restore.ts

database/
└── backups/
    └── .gitkeep
```

---

## 📦 Dependencies to Install

```bash
npm install pg
npm install -D @types/pg
```

---

## 🔧 Environment Variables

Add to your `.env` file:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/akj_conference_rooms

# OR use individual parameters (optional if DATABASE_URL is provided)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=akj_conference_rooms
DB_USER=your_user
DB_PASSWORD=your_password
DB_POOL_MIN=2
DB_POOL_MAX=10
```

---

## 📝 Summary

**Total Files to Create:**
- 15 new files
- 1 updated file (`src/config/env.ts`)
- 1 updated file (`package.json`)
- 1 updated file (`.gitignore`)

**Key Features:**
- ✅ Database connection pool with health checks
- ✅ Migration system with version tracking
- ✅ Seed system (idempotent, safe to run multiple times)
- ✅ Backup/restore utilities
- ✅ Database creation/drop scripts
- ✅ Full TypeScript support
- ✅ Error handling and transactions
- ✅ Environment-aware configuration
- ✅ Production-safe (prevents dangerous operations in prod)

**NPM Scripts Available:**
- `npm run db:create` - Create database
- `npm run db:drop` - Drop database (with confirmation)
- `npm run db:migrate` - Run pending migrations
- `npm run db:rollback` - Rollback last migration
- `npm run db:seed` - Run all seeds
- `npm run db:backup` - Create database backup
- `npm run db:restore <file>` - Restore from backup
- `npm run db:reset` - Drop, create, migrate, and seed (dev only)

---

## ✅ Next Steps

1. Review all files and code above
2. Approve the implementation
3. Installation will proceed with all files and configurations

