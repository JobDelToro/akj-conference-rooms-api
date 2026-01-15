import { Booking } from "@/domain/entity/booking/Booking.ts";
import type { BookingRepository } from "@/domain/repository/BookingRepository.ts";

export class FindBookingByIdUseCase {
    constructor(private readonly bookingRepository: BookingRepository) {}

    async execute(id: string): Promise<Booking | null> {
        try {
            const booking = await this.bookingRepository.findById(id);
            if (!booking) {
                throw new Error("Booking not found");
            }
            return booking;
        } catch (error: any) {
            throw new Error("Failed to find booking", error);
        }
    }
}