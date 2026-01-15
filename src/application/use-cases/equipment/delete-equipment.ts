import type { EquipmentRepository } from "@/domain/repository/EquipmentRepository.ts";

export class DeleteEquipmentUseCase {
    constructor(private readonly equipmentRepository: EquipmentRepository) {}

    async execute(id: string | number): Promise<void> {
        try {
            const equipment = await this.equipmentRepository.findById(id);
            if (!equipment) {
                throw new Error("Equipment not found");
            }
            await this.equipmentRepository.delete(id);
        } catch (error: any) {
            throw new Error("Failed to delete equipment", error);
        }
    }
}
