import { User } from "@/domain/entity/user/User.ts";
import type { UserRepository } from "@/domain/repository/UserRepository.ts";

export class FindUserByEmailUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(email: string): Promise<User> {
        try {
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        } catch (error: any) {
            throw new Error("Failed to find user", error);
        }
    }
}