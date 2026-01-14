import { Employee } from "@/domain/entity/employee/Employee.ts";
import type { EmployeeRepository } from "@/domain/repository/EmployeeRepository.ts";

export class FindEmployeeByUserIdUseCase {
    constructor(private readonly employeeRepository: EmployeeRepository) {}

    async execute(userId: string | number): Promise<Employee> {
        try {
            const employee = await this.employeeRepository.findByUserId(userId);
            if (!employee) {
                throw new Error("Employee not found for this user");
            }
            return employee;
        } catch (error: any) {
            throw new Error("Failed to find employee by user id", error);
        }
    }
}
