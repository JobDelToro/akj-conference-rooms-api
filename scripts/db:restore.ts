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
