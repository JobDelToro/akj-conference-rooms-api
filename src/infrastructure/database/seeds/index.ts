import { getPool } from '../connection.ts';
import { seedUsers } from './users.seed.ts';
import { seedEmployees } from './employees.seed.ts';
import { seedBookings } from './bookings.seed.ts';
import { seedEquipment } from './equipment.seed.ts';

export interface SeedFunction {
    name: string;
    run: () => Promise<void>;
}

const seeds: SeedFunction[] = [
    { name: 'users', run: seedUsers },
    { name: 'employees', run: seedEmployees },
    { name: 'bookings', run: seedBookings },
    { name: 'equipment', run: seedEquipment },
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
