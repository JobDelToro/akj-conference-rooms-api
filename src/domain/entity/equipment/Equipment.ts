import { Entity } from "@/domain/entity/Entity.ts";

export class Equipment extends Entity<Equipment> {
    equipmentId!: string;
    name!: string;
    description?: string;
    type!: string;
    status!: 'available' | 'maintenance' | 'broken';
    createdAt!: Date;
    updatedAt!: Date;
}
