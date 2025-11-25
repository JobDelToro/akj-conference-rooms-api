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
  // Note: Using explicit UUIDs to ensure relationships work in other seeds
  await query(`
    INSERT INTO users (id, email, password, role, status, created_at, updated_at)
    VALUES 
      ('11111111-1111-1111-1111-111111111111', 'admin@example.com', '$2b$10$hashedpassword', 'admin', 'active', NOW(), NOW()),
      ('22222222-2222-2222-2222-222222222222', 'user@example.com', '$2b$10$hashedpassword', 'user', 'active', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `);

  console.log('    Inserted 2 users');
}
