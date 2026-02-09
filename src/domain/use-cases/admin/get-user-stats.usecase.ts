import { UserStats, IUserRepository } from "../../interfaces/user-repository.interface";

export class GetUserStatsUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(userId: string, client?: unknown): Promise<UserStats> {
        return this.userRepository.getUserStats(userId, client);
    }
}
