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
