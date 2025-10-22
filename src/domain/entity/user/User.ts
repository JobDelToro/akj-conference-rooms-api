import { Entity } from "@/domain/entity/Entity.ts";
import type { Employee } from "@/domain/entity/employee/Employee.ts";

export class User extends Entity<User & Employee> {
    id!: string;
    email!: string;
    password!: string;
    role!: string;
    status!: 'active' | 'inactive' | 'pending' | 'blocked' | 'deleted';
    createdAt!: Date;
    updatedAt!: Date;
};
