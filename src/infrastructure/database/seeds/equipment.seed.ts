import { query } from '../connection.ts';

/**
 * Seed equipment table
 * This is idempotent - safe to run multiple times
 */
export async function seedEquipment(): Promise<void> {
  // Check if equipment already exist
  const existingEquipment = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM equipment'
  );

  if (Number(existingEquipment[0]?.count ?? 0) > 0) {
    console.log('    Equipment already seeded, skipping...');
    return;
  }

  // Insert seed equipment
  await query(`
    INSERT INTO equipment (id, name, description, type, status, created_at, updated_at)
    VALUES 
      ('33333333-3333-3333-3333-333333333331', 'Projector 4K', 'High resolution projector for main hall', 'Projector', 'available', NOW(), NOW()),
      ('33333333-3333-3333-3333-333333333332', 'Whiteboard', 'Large magnetic whiteboard', 'Whiteboard', 'available', NOW(), NOW()),
      ('33333333-3333-3333-3333-333333333333', 'Conference Phone', 'Polycom conference phone', 'Audio', 'maintenance', NOW(), NOW()),
      ('33333333-3333-3333-3333-333333333334', 'HDMI Cable', '3m HDMI cable', 'Accessory', 'broken', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `);

  console.log('    Inserted 4 equipment items');
}
