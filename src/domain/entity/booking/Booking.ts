import { Entity } from "@/domain/entity/Entity.ts";

export class Booking extends Entity<Booking> {
    id!: string;
    user_id!: string;
    start_time!: Date;
    end_time!: Date;
    created_at!: Date;
    updated_at!: Date;
    title!: string;
    description?: string;
    status!: 'confirmed' | 'cancelled' | 'in_progress' | 'completed';
}
