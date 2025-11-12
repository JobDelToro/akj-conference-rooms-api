
import { Booking } from "@/domain/entity/booking/Booking.ts";
import type { BookingRepository } from "../../../repository/BookingRepository.ts";


export class PgBookingRepository implements BookingRepository {

    create(booking: Booking): Promise<Booking> {
        throw new Error("Method not implemented.");
    }
    update(booking: Booking): Promise<Booking> {
        throw new Error("Method not implemented.");
    }
    delete(bookingId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    findById(bookingId: string): Promise<Booking | null> {
        throw new Error("Method not implemented.");
    }
    findAll(): Promise<Booking[] | null> {
        throw new Error("Method not implemented.");
    }
}
