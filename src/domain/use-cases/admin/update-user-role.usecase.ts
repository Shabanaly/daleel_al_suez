import { IUserRepository } from "../../interfaces/user-repository.interface";

export class UpdateUserRoleUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(userId: string, newRole: string, client?: unknown): Promise<void> {
        return this.userRepository.updateUserRole(userId, newRole, client);
    }
}
