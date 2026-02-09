import { AuditLog } from "../../entities/audit-log";
import { IUserRepository } from "../../interfaces/user-repository.interface";

export class GetUserLogsUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(userId: string, client?: unknown): Promise<AuditLog[]> {
        return this.userRepository.getUserLogs(userId, client);
    }
}
