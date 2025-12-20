import { User } from '@/domain/entity/user/User.ts';

export interface IUserRepository {
    create(user: Partial<User>): Promise<User>;
    findById(id: string | number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    update(id: string | number, user: Partial<User>): Promise<User>;
    delete(id: string | number): Promise<void>;
}
