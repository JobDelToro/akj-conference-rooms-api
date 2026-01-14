import { Booking } from "@/domain/entity/booking/Booking.ts";
import type { BookingRepository } from "@/domain/repository/BookingRepository.ts";

export class FindBookingByUserIdUseCase {
    constructor(private readonly bookingRepository: BookingRepository) {}

    async execute(userId: string): Promise<Booking[] | null> {
        try {
            const bookings = await this.bookingRepository.findByUserId(userId);
            if (!bookings) {
                throw new Error("Bookings not found");
            }
            return bookings;
        } catch (error: any) {
            throw new Error("Failed to find booking", error);
        }
    }
}