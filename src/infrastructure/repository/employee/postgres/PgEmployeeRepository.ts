
import { Employee } from "@/domain/entity/employee/Employee.ts";
import type { EmployeeRepository } from "../../../repository/EmployeeRepository.ts";

export class PgEmployeeRepository implements EmployeeRepository {

    create(employee: Employee): Promise<Employee> {
        throw new Error("Method not implemented.");
    }
    update(employee: Employee): Promise<Employee> {
        throw new Error("Method not implemented.");
    }
    delete(employeeId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    findById(employeeId: string): Promise<Employee | null> {
        throw new Error("Method not implemented.");
    }
    findAll(): Promise<Employee[] | null> {
        throw new Error("Method not implemented.");
    }
}
