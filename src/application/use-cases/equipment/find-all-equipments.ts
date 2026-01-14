import { Equipment } from "@/domain/entity/equipment/Equipment.ts";
import type { EquipmentRepository } from "@/domain/repository/EquipmentRepository.ts";

export class FindAllEquipmentsUseCase {
    constructor(private readonly equipmentRepository: EquipmentRepository) {}

    async execute(): Promise<Equipment[]> {
        try {
            const equipments = await this.equipmentRepository.findAll();
            if (!equipments) {
                throw new Error("Failed to find equipments");
            }
            return equipments;
        } catch (error: any) {
            throw new Error("Failed to find equipments", error);
        }
    }
}
