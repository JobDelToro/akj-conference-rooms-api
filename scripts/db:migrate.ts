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
