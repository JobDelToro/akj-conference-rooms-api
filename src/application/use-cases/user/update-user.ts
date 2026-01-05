import { User } from "@/domain/entity/user/User.ts";
import type { UserRepository } from "@/domain/repository/UserRepository.ts";

export class UpdateUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(id: string | number, user: Partial<User>): Promise<User> {
        try {
            const currUser = await this.userRepository.findById(id);
            if (!currUser) {
                throw new Error("User not found");
            }
            const updatedUser = await this.userRepository.update(id, user);
            return updatedUser;
        } catch (error: any) {
            throw new Error("Failed to update user", error);
        }
    }
}