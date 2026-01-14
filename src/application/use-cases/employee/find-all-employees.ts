import { Employee } from "@/domain/entity/employee/Employee.ts";
import type { EmployeeRepository } from "@/domain/repository/EmployeeRepository.ts";

export class FindAllEmployeesUseCase {
    constructor(private readonly employeeRepository: EmployeeRepository) {}

    async execute(): Promise<Employee[]> {
        try {
            const employees = await this.employeeRepository.findAll();
            if (!employees) {
                throw new Error("Failed to find employees");
            }
            return employees;
        } catch (error: any) {
            throw new Error("Failed to find employees", error);
        }
    }
}
