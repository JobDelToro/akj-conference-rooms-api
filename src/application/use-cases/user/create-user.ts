import { User } from "@/domain/entity/user/User.ts";
import type { UserRepository } from "@/domain/repository/UserRepository.ts";

export class CreateUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(user: User): Promise<User> {
        try {
            const existingUser = await this.userRepository.findByEmail(user.email);
            if (existingUser) {
                throw new Error("User already exists");
            }
            const newUser = await this.userRepository.create(user);
            return newUser;
        } catch (error: any) {
            throw new Error("Failed to create user", error);
        }
    }
}
