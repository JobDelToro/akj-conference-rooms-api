import { Employee } from '@/domain/entity/employee/Employee.ts';

export interface IEmployeeRepository {
    create(employee: Partial<Employee>): Promise<Employee>;
    findById(id: string | number): Promise<Employee | null>;
    findByUserId(userId: string | number): Promise<Employee | null>;
    findAll(): Promise<Employee[]>;
    update(id: string | number, employee: Partial<Employee>): Promise<Employee>;
    delete(id: string | number): Promise<void>;
}
