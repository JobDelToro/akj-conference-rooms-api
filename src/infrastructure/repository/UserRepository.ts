import { User } from "@/domain/entity/user/User.ts";

export interface UserRepository {
    create(user: User): Promise<User>;
    update(user: User): Promise<User>;
    delete(userId: string): Promise<void>;
    findById(userId: string): Promise<User | null>;
    findAll(): Promise<User[] | null>;
}