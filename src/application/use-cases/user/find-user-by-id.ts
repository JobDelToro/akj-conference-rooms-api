import { User } from "@/domain/entity/user/User.ts";
import type { UserRepository } from "@/domain/repository/UserRepository.ts";

export class FindUserByIdUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(id: string | number): Promise<User> {
        try {
            const user = await this.userRepository.findById(id);
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        } catch (error: any) {
            throw new Error("Failed to find user", error);
        }
    }
}
