import { Equipment } from '@/domain/entity/equipment/Equipment.ts';

export interface EquipmentRepository {
    create(equipment: Partial<Equipment>): Promise<Equipment>;
    findById(id: string | number): Promise<Equipment | null>;
    findAll(): Promise<Equipment[]>;
    findByStatus(status: Equipment['status']): Promise<Equipment[]>;
    update(id: string | number, equipment: Partial<Equipment>): Promise<Equipment>;
    delete(id: string | number): Promise<void>;
}
