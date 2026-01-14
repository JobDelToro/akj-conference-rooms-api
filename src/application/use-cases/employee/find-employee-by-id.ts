import { Employee } from "@/domain/entity/employee/Employee.ts";
import type { EmployeeRepository } from "@/domain/repository/EmployeeRepository.ts";

export class FindEmployeeByIdUseCase {
    constructor(private readonly employeeRepository: EmployeeRepository) {}

    async execute(id: string | number): Promise<Employee> {
        try {
            const employee = await this.employeeRepository.findById(id);
            if (!employee) {
                throw new Error("Employee not found");
            }
            return employee;
        } catch (error: any) {
            throw new Error("Failed to find employee", error);
        }
    }
}
