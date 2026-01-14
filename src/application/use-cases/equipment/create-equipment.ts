import { Equipment } from "@/domain/entity/equipment/Equipment.ts";
import type { EquipmentRepository } from "@/domain/repository/EquipmentRepository.ts";

export class CreateEquipmentUseCase {
    constructor(private readonly equipmentRepository: EquipmentRepository) {}

    async execute(equipment: Equipment): Promise<Equipment> {
        try {
            const newEquipment = await this.equipmentRepository.create(equipment);
            return newEquipment;
        } catch (error: any) {
            throw new Error("Failed to create equipment", error);
        }
    }
}
