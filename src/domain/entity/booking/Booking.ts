import { Entity } from "@/domain/entity/Entity.ts";

export class Booking extends Entity<Booking> {
    conferenceRoomId!: string;
    userId!: string;
    startTime!: Date;
    endTime!: Date;
    createdAt!: Date;
    updatedAt!: Date;
    title!: string;
    description?: string;
    status!: 'pending' | 'confirmed' | 'cancelled';
}