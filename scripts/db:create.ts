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
