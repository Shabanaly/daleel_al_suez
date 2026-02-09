export interface AuditLog {
    id: string;
    action: string;
    details: Record<string, unknown>;
    targetId?: string;
    createdAt: string;
}
