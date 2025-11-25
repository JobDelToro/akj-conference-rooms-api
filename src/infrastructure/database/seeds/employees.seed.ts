import { query } from '../connection.ts';

/**
 * Seed employees table
 */
export async function seedEmployees(): Promise<void> {
    // Check if employees already exist
    const existingEmployees = await query<{ count: string }>(
        'SELECT COUNT(*) as count FROM employees'
    );

    if (Number(existingEmployees[0]?.count ?? 0) > 0) {
        console.log('    Employees already seeded, skipping...');
        return;
    }

    // Insert seed employees
    // Linking to the user with ID 2 created in users.seed.ts
    await query(`
    INSERT INTO employees (id, user_id, name, last_name, email, phone, address, position, created_at, updated_at)
    VALUES 
      (1, 2, 'John', 'Doe', 'user@example.com', '555-0123', '123 Main St', 'Developer', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING
  `);

    // Update the sequence
    await query(`SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees))`);

    console.log('    Inserted 1 employee');
}
