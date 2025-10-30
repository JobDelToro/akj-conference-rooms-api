import { Entity } from "@/domain/entity/Entity.ts";

export class Room extends Entity<Room> {
    roomId!: string;
    name!: string;
    capacity!: string;
    description?: string;
}