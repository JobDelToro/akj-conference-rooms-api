import { Booking } from "@/domain/entity/booking/Booking.ts";


export interface BookingRepository {
    create(booking: Booking): Promise<Booking>;
    update(booking: Booking): Promise<Booking>;
    delete(bookingId: string): Promise<void>;
    findById(bookingId: string): Promise<Booking | null>;
    findAll(): Promise<Booking[] | null>;
}
