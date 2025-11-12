import { User } from "@/domain/entity/user/User.ts";
import type { UserRepository } from "../../../repository/UserRepository.ts";

export class PgUserRepository implements UserRepository {

    create(user: User): Promise<User> {
        throw new Error("Method not implemented.");
    }
    update(user: User): Promise<User> {
        throw new Error("Method not implemented.");
    }
    delete(userId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    findById(userId: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    findAll(): Promise<User[] | null> {
        throw new Error("Method not implemented.");
    }
}