import { Booking } from "@/domain/entity/booking/Booking.ts";
import type { BookingRepository } from "@/domain/repository/BookingRepository.ts";

export class UpdateBookingUseCase {
    constructor(private readonly bookingRepository: BookingRepository) {}

    async execute(id: string | number, booking: Partial<Booking>): Promise<Booking> {
        try {
            const currBooking = await this.bookingRepository.findById(id);
            if (!currBooking) {
                throw new Error("Booking not found");
            }
            const updatedBooking = await this.bookingRepository.update(id, booking);
            return updatedBooking;
        } catch (error: any) {
            throw new Error("Failed to update booking", error);
        }
    }
}