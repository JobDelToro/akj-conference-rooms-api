import { User } from "@/domain/entity/user/User.ts";
import type { UserRepository } from "@/domain/repository/UserRepository.ts";

export class FindAllUsersUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(): Promise<User[]> {
        try {
            const users = await this.userRepository.findAll();
            return users;
        } catch (error: any) {
            throw new Error("Failed to find users", error);
        }
    }
}
