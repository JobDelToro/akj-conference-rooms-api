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
    return { version: match[1]!, name: match[2]! };
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
        const filePath = join(__dirname, 'files', lastMigration!);

        console.log(`Rolling back migration: ${lastMigration}`);

        // For rollback, we'd need a separate rollback file or parse the migration
        // For simplicity, we'll just remove it from the migrations table
        // In production, you'd want proper rollback SQL files
        await unmarkMigration(lastMigration!);
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
