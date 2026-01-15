import { Booking } from "@/domain/entity/booking/Booking.ts";
import type { BookingRepository } from "@/domain/repository/BookingRepository.ts";

export class CreateBookingUseCase {
    constructor(private readonly bookingRepository: BookingRepository) {}

    async execute(booking: Booking): Promise<Booking> {
        try {
            const newBooking = await this.bookingRepository.create(booking);
            return newBooking;
        } catch (error: any) {
            throw new Error("Failed to create booking", error);
        }
    }
}
