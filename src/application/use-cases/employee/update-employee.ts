import { Employee } from "@/domain/entity/employee/Employee.ts";
import type { EmployeeRepository } from "@/domain/repository/EmployeeRepository.ts";

export class UpdateEmployeeUseCase {
    constructor(private readonly employeeRepository: EmployeeRepository) {}

    async execute(id: string | number, employee: Partial<Employee>): Promise<Employee> {
        try {
            const currEmployee = await this.employeeRepository.findById(id);
            if (!currEmployee) {
                throw new Error("Employee not found");
            }
            const updatedEmployee = await this.employeeRepository.update(id, employee);
            return updatedEmployee;
        } catch (error: any) {
            throw new Error("Failed to update employee", error);
        }
    }
}
