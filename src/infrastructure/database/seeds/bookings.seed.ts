import { query } from '../connection.ts';

/**
 * Seed bookings table
 */
export async function seedBookings(): Promise<void> {
    // Check if bookings already exist
    const existingBookings = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM bookings'
    );

    if (Number(existingBookings[0]?.count ?? 0) > 0) {
        console.log('    Bookings already seeded, skipping...');
        return;
    }

    // Insert seed bookings
    // Creating a booking for user 2
    await query(`
    INSERT INTO bookings (id, user_id, title, description, start_time, end_time, status, created_at, updated_at)
    VALUES 
      (1, 2, 'Team Sync', 'Weekly team synchronization meeting', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '1 hour', 'confirmed', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `);

    // Update the sequence
    await query(`SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings))`);

    console.log('    Inserted 1 booking');
}
