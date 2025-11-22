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
