import { Equipment } from "@/domain/entity/equipment/Equipment.ts";
import type { EquipmentRepository } from "@/domain/repository/EquipmentRepository.ts";

export class FindEquipmentByIdUseCase {
    constructor(private readonly equipmentRepository: EquipmentRepository) {}

    async execute(id: string | number): Promise<Equipment> {
        try {
            const equipment = await this.equipmentRepository.findById(id);
            if (!equipment) {
                throw new Error("Equipment not found");
            }
            return equipment;
        } catch (error: any) {
            throw new Error("Failed to find equipment", error);
        }
    }
}
