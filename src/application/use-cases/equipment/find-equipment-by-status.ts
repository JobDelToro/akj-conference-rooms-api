import { Equipment } from "@/domain/entity/equipment/Equipment.ts";
import type { EquipmentRepository } from "@/domain/repository/EquipmentRepository.ts";

export class FindEquipmentByStatusUseCase {
    constructor(private readonly equipmentRepository: EquipmentRepository) {}

    async execute(status: Equipment['status']): Promise<Equipment[]> {
        try {
            const equipments = await this.equipmentRepository.findByStatus(status);
            if (!equipments) {
                throw new Error("No equipments found with status: " + status);
            }
            return equipments;
        } catch (error: any) {
            throw new Error("Failed to find equipments by status", error);
        }
    }
}
