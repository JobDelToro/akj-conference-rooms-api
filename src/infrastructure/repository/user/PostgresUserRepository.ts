import type { IUserRepository } from '@/domain/repository/UserRepository.ts';
import { User } from '@/domain/entity/user/User.ts';
import { query, queryOne } from '@/infrastructure/database/connection.ts';

export class PostgresUserRepository implements IUserRepository {
    async create(user: Partial<User>): Promise<User> {
        const sql = `
            INSERT INTO users (email, password, role, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING id, email, password, role, status, created_at as "createdAt", updated_at as "updatedAt"
        `;
        const params = [user.email, user.password, user.role, user.status];
        const result = await queryOne<User>(sql, params);

        if (!result) throw new Error('Failed to create user');
        return result;
    }

    async findById(id: string | number): Promise<User | null> {
        const sql = `
            SELECT id, email, password, role, status, created_at as "createdAt", updated_at as "updatedAt"
            FROM users
            WHERE id = $1
        `;
        return queryOne<User>(sql, [id]);
    }

    async findByEmail(email: string): Promise<User | null> {
        const sql = `
            SELECT id, email, password, role, status, created_at as "createdAt", updated_at as "updatedAt"
            FROM users
            WHERE email = $1
        `;
        return queryOne<User>(sql, [email]);
    }

    async findAll(): Promise<User[]> {
        const sql = `
            SELECT id, email, password, role, status, created_at as "createdAt", updated_at as "updatedAt"
            FROM users
        `;
        return query<User>(sql);
    }

    async update(id: string | number, user: Partial<User>): Promise<User> {
        // Dynamic update query builder could be better, but keeping it simple for now
        // This assumes we are updating specific fields. 
        // For a robust implementation, we might want to check which fields are present.

        // A simple approach for now:
        const sql = `
            UPDATE users 
            SET email = COALESCE($2, email),
                password = COALESCE($3, password),
                role = COALESCE($4, role),
                status = COALESCE($5, status),
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, email, password, role, status, created_at as "createdAt", updated_at as "updatedAt"
        `;

        const params = [id, user.email, user.password, user.role, user.status];
        const result = await queryOne<User>(sql, params);

        if (!result) throw new Error('User not found or failed to update');
        return result;
    }

    async delete(id: string | number): Promise<void> {
        const sql = `DELETE FROM users WHERE id = $1`;
        await query(sql, [id]);
    }
}
