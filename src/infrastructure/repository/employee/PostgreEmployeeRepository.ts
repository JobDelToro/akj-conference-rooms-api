import type { EmployeeRepository } from '@/domain/repository/EmployeeRepository.ts';
import { Employee } from '@/domain/entity/employee/Employee.ts';
import { query, queryOne } from '@/infrastructure/database/connection.ts';

export class PostgresEmployeeRepository implements EmployeeRepository {
    async create(employee: Partial<Employee> & { userId: string }): Promise<Employee> {
        const sql = `
            INSERT INTO employees (user_id, name, last_name, email, phone, address, position, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING id, user_id, name, last_name, email, phone, address, position, created_at, updated_at
        `;
        const params = [
            employee.user_id, // We need userId to link to the user
            employee.name,
            employee.last_name,
            employee.email,
            employee.phone,
            employee.address,
            employee.position
        ];
        const result = await queryOne<Employee>(sql, params);

        if (!result) throw new Error('Failed to create employee');
        return result;
    }

    async findById(id: string | number): Promise<Employee | null> {
        const sql = `
            SELECT id, user_id, name, last_name, email, phone, address, position, created_at, updated_at
            FROM employees
            WHERE id = $1
        `;
        return queryOne<Employee>(sql, [id]);
    }

    async findByUserId(userId: string | number): Promise<Employee | null> {
        const sql = `
            SELECT id, user_id, name, last_name, email, phone, address, position, created_at, updated_at
            FROM employees
            WHERE user_id = $1
        `;
        return queryOne<Employee>(sql, [userId]);
    }

    async findByEmail(email: string): Promise<Employee | null> {
        const sql = `
            SELECT id, user_id, name, last_name, email, phone, address, position, created_at, updated_at
            FROM employees
            WHERE email = $1
        `;
        return queryOne<Employee>(sql, [email]);
    }

    async findAll(): Promise<Employee[]> {
        const sql = `
            SELECT id, user_id, name, last_name, email, phone, address, position, created_at, updated_at
            FROM employees
        `;
        return query<Employee>(sql);
    }

    async update(id: string | number, employee: Partial<Employee>): Promise<Employee> {
        const sql = `
            UPDATE employees 
            SET name = COALESCE($2, name),
                last_name = COALESCE($3, last_name),
                email = COALESCE($4, email),
                phone = COALESCE($5, phone),
                address = COALESCE($6, address),
                position = COALESCE($7, position),
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, user_id, name, last_name, email, phone, address, position, created_at, updated_at
        `;

        const params = [
            id,
            employee.name,
            employee.last_name,
            employee.email,
            employee.phone,
            employee.address,
            employee.position
        ];
        const result = await queryOne<Employee>(sql, params);

        if (!result) throw new Error('Employee not found or failed to update');
        return result;
    }

    async delete(id: string | number): Promise<void> {
        const sql = `DELETE FROM employees WHERE id = $1`;
        await query(sql, [id]);
    }
}
