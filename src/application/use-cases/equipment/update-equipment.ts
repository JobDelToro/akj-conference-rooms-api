import { Equipment } from "@/domain/entity/equipment/Equipment.ts";
import type { EquipmentRepository } from "@/domain/repository/EquipmentRepository.ts";

export class UpdateEquipmentUseCase {
    constructor(private readonly equipmentRepository: EquipmentRepository) {}

    async execute(id: string | number, equipment: Partial<Equipment>): Promise<Equipment> {
        try {
            const currEquipment = await this.equipmentRepository.findById(id);
            if (!currEquipment) {
                throw new Error("Equipment not found");
            }
            const updatedEquipment = await this.equipmentRepository.update(id, equipment);
            return updatedEquipment;
        } catch (error: any) {
            throw new Error("Failed to update equipment", error);
        }
    }
}
