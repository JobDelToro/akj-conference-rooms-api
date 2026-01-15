import { Booking } from "@/domain/entity/booking/Booking.ts";
import type { BookingRepository } from "@/domain/repository/BookingRepository.ts";

export class FindAllBookingsUseCase {
    constructor(private readonly bookingRepository: BookingRepository) {}

    async execute(): Promise<Booking[]> {
        try {
            const bookings = await this.bookingRepository.findAll();
            if (!bookings) throw new Error("No bookings found");
            return bookings;
        } catch (error: any) {
            throw new Error("Failed to find bookings", error);
        }
    }
}