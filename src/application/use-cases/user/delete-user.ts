import type { UserRepository } from "@/domain/repository/UserRepository.ts";

export class DeleteUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(id: string | number): Promise<void> {
        try {
            const user = await this.userRepository.findById(id);
            if (!user) {
                throw new Error("User not found");
            }
            await this.userRepository.delete(id);
        } catch (error: any) {
            throw new Error("Failed to delete user", error);
        }
    }
}