import { Entity } from "@/domain/entity/Entity.ts";

export class Employee extends Entity<Employee> {
    id!: string;
    user_id!: string;
    last_name!: string;
    name!: string;
    email!: string;
    phone!: string;
    address!: string;
    position!: string;
    created_at!: Date;
    updated_at!: Date;
}
