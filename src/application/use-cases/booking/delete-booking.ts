import type { BookingRepository } from "@/domain/repository/BookingRepository.ts";

export class DeleteBookingUseCase {
    constructor(private readonly bookingRepository: BookingRepository) {}

    async execute(id: string): Promise<void> {
        try {
            const booking = await this.bookingRepository.findById(id);
            if (!booking) {
                throw new Error("Booking not found");
            }
            await this.bookingRepository.delete(id);
        } catch (error: any) {
            throw new Error("Failed to delete booking", error);
        }
    }
}