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
