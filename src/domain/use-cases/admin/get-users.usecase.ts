import { User } from "../../entities/user";
import { IUserRepository } from "../../interfaces/user-repository.interface";

export class GetUsersUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(client?: unknown): Promise<User[]> {
        return this.userRepository.getUsers(client);
    }
}
