
import { Employee } from "@/domain/entity/employee/Employee.ts";

export interface EmployeeRepository {
    create(employee: Employee): Promise<Employee>;
    update(employee: Employee): Promise<Employee>;
    delete(employeeId: string): Promise<void>;
    findById(employeeId: string): Promise<Employee | null>;
    findAll(): Promise<Employee[] | null>;
}