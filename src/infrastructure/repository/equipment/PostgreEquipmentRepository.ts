import type { EquipmentRepository } from '@/domain/repository/EquipmentRepository.ts';
import { Equipment } from '@/domain/entity/equipment/Equipment.ts';
import { query, queryOne } from '@/infrastructure/database/connection.ts';

export class PostgreEquipmentRepository implements EquipmentRepository {
    async create(equipment: Partial<Equipment>): Promise<Equipment> {
        const sql = `
            INSERT INTO equipment (name, description, type, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING id as "equipmentId", name, description, type, status, created_at as "createdAt", updated_at as "updatedAt"
        `;
        const params = [equipment.name, equipment.description, equipment.type, equipment.status];
        const result = await queryOne<Equipment>(sql, params);

        if (!result) throw new Error('Failed to create equipment');
        return result;
    }

    async findById(id: string | number): Promise<Equipment | null> {
        const sql = `
            SELECT id as "equipmentId", name, description, type, status, created_at as "createdAt", updated_at as "updatedAt"
            FROM equipment
            WHERE id = $1
        `;
        return queryOne<Equipment>(sql, [id]);
    }

    async findAll(): Promise<Equipment[]> {
        const sql = `
            SELECT id as "equipmentId", name, description, type, status, created_at as "createdAt", updated_at as "updatedAt"
            FROM equipment
        `;
        return query<Equipment>(sql);
    }

    async findByStatus(status: Equipment['status']): Promise<Equipment[]> {
        const sql = `
            SELECT id as "equipmentId", name, description, type, status, created_at as "createdAt", updated_at as "updatedAt"
            FROM equipment
            WHERE status = $1
        `;
        return query<Equipment>(sql, [status]);
    }

    async update(id: string | number, equipment: Partial<Equipment>): Promise<Equipment> {
        const sql = `
            UPDATE equipment 
            SET name = COALESCE($2, name),
                description = COALESCE($3, description),
                type = COALESCE($4, type),
                status = COALESCE($5, status),
                updated_at = NOW()
            WHERE id = $1
            RETURNING id as "equipmentId", name, description, type, status, created_at as "createdAt", updated_at as "updatedAt"
        `;

        const params = [id, equipment.name, equipment.description, equipment.type, equipment.status];
        const result = await queryOne<Equipment>(sql, params);

        if (!result) throw new Error('Equipment not found or failed to update');
        return result;
    }

    async delete(id: string | number): Promise<void> {
        const sql = `DELETE FROM equipment WHERE id = $1`;
        await query(sql, [id]);
    }
}
