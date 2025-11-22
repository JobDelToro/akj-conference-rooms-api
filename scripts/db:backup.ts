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
