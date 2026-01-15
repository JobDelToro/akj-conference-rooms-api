import type { EmployeeRepository } from "@/domain/repository/EmployeeRepository.ts";

export class DeleteEmployeeUseCase {
    constructor(private readonly employeeRepository: EmployeeRepository) {}

    async execute(id: string | number): Promise<void> {
        try {
            const employee = await this.employeeRepository.findById(id);
            if (!employee) {
                throw new Error("Employee not found");
            }
            await this.employeeRepository.delete(id);
        } catch (error: any) {
            throw new Error("Failed to delete employee", error);
        }
    }
}
