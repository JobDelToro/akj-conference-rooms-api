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
  // Creating a booking for user 22222222-2222-2222-2222-222222222222
  await query(`
    INSERT INTO bookings (id, user_id, title, description, start_time, end_time, status, created_at, updated_at)
    VALUES 
      ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Team Sync', 'Weekly team synchronization meeting', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '1 hour', 'confirmed', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `);

  console.log('    Inserted 1 booking');
}
