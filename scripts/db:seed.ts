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
