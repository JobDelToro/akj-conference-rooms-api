import { Entity } from "@/domain/entity/Entity.ts";

export class Employee extends Entity<Employee> {
    lastName!: string;
    name!: string;
    email!: string;
    phone!: string;
    address!: string;
    position!: string;
}
