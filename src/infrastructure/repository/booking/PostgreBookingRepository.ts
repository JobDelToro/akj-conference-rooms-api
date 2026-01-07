import type { BookingRepository } from '@/domain/repository/BookingRepository.ts';
import { Booking } from '@/domain/entity/booking/Booking.ts';
import { query, queryOne } from '@/infrastructure/database/connection.ts';

export class PostgresBookingRepository implements BookingRepository {
    async create(booking: Partial<Booking>): Promise<Booking> {
        const sql = `
            INSERT INTO bookings (user_id, title, description, start_time, end_time, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING id, user_id, title, description, start_time, end_time, status, created_at, updated_at
        `;
        const params = [
            booking.user_id,
            booking.title,
            booking.description,
            booking.start_time,
            booking.end_time,
            booking.status
        ];
        const result = await queryOne<Booking>(sql, params);

        if (!result) throw new Error('Failed to create booking');
        return result;
    }

    async findById(id: string | number): Promise<Booking | null> {
        const sql = `
            SELECT id, user_id, title, description, start_time, end_time, status, created_at, updated_at
            FROM bookings
            WHERE id = $1
        `;
        return queryOne<Booking>(sql, [id]);
    }

    async findByUserId(userId: string | number): Promise<Booking[]> {
        const sql = `
            SELECT id, user_id, title, description, start_time, end_time, status, created_at, updated_at
            FROM bookings
            WHERE user_id = $1
        `;
        return query<Booking>(sql, [userId]);
    }

    async findAll(): Promise<Booking[]> {
        const sql = `
            SELECT id, user_id, title, description, start_time, end_time, status, created_at, updated_at
            FROM bookings
        `;
        return query<Booking>(sql);
    }

    async update(id: string | number, booking: Partial<Booking>): Promise<Booking> {
        const sql = `
            UPDATE bookings 
            SET title = COALESCE($2, title),
                description = COALESCE($3, description),
                start_time = COALESCE($4, start_time),
                end_time = COALESCE($5, end_time),
                status = COALESCE($6, status),
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, user_id, title, description, start_time, end_time, status, created_at, updated_at
        `;

        const params = [
            id,
            booking.title,
            booking.description,
            booking.start_time,
            booking.end_time,
            booking.status
        ];
        const result = await queryOne<Booking>(sql, params);

        if (!result) throw new Error('Booking not found or failed to update');
        return result;
    }

    async delete(id: string | number): Promise<void> {
        const sql = `DELETE FROM bookings WHERE id = $1`;
        await query(sql, [id]);
    }
}
