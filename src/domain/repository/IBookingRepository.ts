import { Booking } from '@/domain/entity/booking/Booking.ts';

export interface IBookingRepository {
    create(booking: Partial<Booking>): Promise<Booking>;
    findById(id: string | number): Promise<Booking | null>;
    findByUserId(userId: string | number): Promise<Booking[]>;
    findAll(): Promise<Booking[]>;
    update(id: string | number, booking: Partial<Booking>): Promise<Booking>;
    delete(id: string | number): Promise<void>;
}
