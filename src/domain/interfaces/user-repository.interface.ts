import { User } from "../entities/user";
import { AuditLog } from "../entities/audit-log";

export interface UserStats {
    placesCount: number;
    reviewsCount: number;
}

export interface IUserRepository {
    getCurrentUser(client?: unknown): Promise<User | null>;
    getUserRole(userId: string, client?: unknown): Promise<string>;
    getUsers(client?: unknown): Promise<User[]>;
    getUserStats(userId: string, client?: unknown): Promise<UserStats>;
    getUserLogs(userId: string, client?: unknown): Promise<AuditLog[]>;
    updateUserRole(userId: string, newRole: string, client?: unknown): Promise<void>;
}
// Note: client is kept as any for now to avoid dependency cycles in domain, 
// but we will use specific types in implementations and suppress any only where necessary.
