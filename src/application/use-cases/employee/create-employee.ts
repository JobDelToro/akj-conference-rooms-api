import { Employee } from "@/domain/entity/employee/Employee.ts";
import type { EmployeeRepository } from "@/domain/repository/EmployeeRepository.ts";

export class CreateEmployeeUseCase {
    constructor(private readonly employeeRepository: EmployeeRepository) {}

    async execute(employee: Employee): Promise<Employee> {
        try {
            const existingEmployee = await this.employeeRepository.findByEmail(employee.email);
            if (existingEmployee) {
                throw new Error("Employee with that email already exists");
            }
            const newEmployee = await this.employeeRepository.create(employee);
            if (!newEmployee) {
                throw new Error("Failed to create employee");
            }
            return newEmployee;
        } catch (error: any) {
            throw new Error("Failed to create employee", error);
        }
    }
}
