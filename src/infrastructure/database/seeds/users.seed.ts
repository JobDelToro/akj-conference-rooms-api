import { query } from '../connection.ts';

/**
 * Seed users table
 * This is idempotent - safe to run multiple times
 */
export async function seedUsers(): Promise<void> {
    // Check if users already exist
    const existingUsers = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM users'
    );

    if (Number(existingUsers[0]?.count ?? 0) > 0) {
        console.log('    Users already seeded, skipping...');
        return;
    }

    // Insert seed users
    // Note: Using integer IDs because the table uses SERIAL
    await query(`
    INSERT INTO users (id, email, password, role, status, created_at, updated_at)
    VALUES 
      (1, 'admin@example.com', '$2b$10$hashedpassword', 'admin', 'active', NOW(), NOW()),
      (2, 'user@example.com', '$2b$10$hashedpassword', 'user', 'active', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `);

    // Update the sequence to avoid collisions with future auto-incremented IDs
    await query(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))`);

    console.log('    Inserted 2 users');
}
