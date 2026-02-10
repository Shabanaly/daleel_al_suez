import { IUserRepository, UserStats } from "@/domain/interfaces/user-repository.interface";
import { User } from "@/domain/entities/user";
import { AuditLog } from "@/domain/entities/audit-log";
import { createClient } from "@/lib/supabase/client";

interface SupabaseProfile {
    id: string;
    email: string;
    role: 'user' | 'admin';
    full_name: string;
    avatar_url?: string;
    created_at: string;
}

interface SupabaseAuditLog {
    id: string;
    action: string;
    details: Record<string, unknown>;
    target_id: string;
    created_at: string;
}

export class SupabaseUserRepository implements IUserRepository {
    private defaultClient = createClient();

    async getCurrentUser(client?: unknown): Promise<User | null> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.defaultClient;

        // 1. Get Auth User
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return null;
        }

        // 2. Get Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
            return null;
        }

        return {
            id: user.id,
            email: user.email!,
            role: profile.role || 'user',
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
            createdAt: profile.created_at
        };
    }

    async getUserRole(userId: string, client?: unknown): Promise<string> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.defaultClient;
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (error) return 'user';
        return data.role;
    }

    async getUsers(client?: unknown): Promise<User[]> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.defaultClient;
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return [];
        const profiles = data as SupabaseProfile[];

        return profiles.map((p) => ({
            id: p.id,
            email: p.email,
            role: p.role,
            fullName: p.full_name,
            avatarUrl: p.avatar_url,
            createdAt: p.created_at
        }));
    }

    async getUserStats(userId: string, client?: unknown): Promise<UserStats> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.defaultClient;

        const { count: placesCount } = await supabase
            .from('places')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', userId);

        const { count: reviewsCount } = await supabase
            .from('reviews')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        return {
            placesCount: placesCount || 0,
            reviewsCount: reviewsCount || 0
        };
    }

    async getUserLogs(userId: string, client?: unknown): Promise<AuditLog[]> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.defaultClient;
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) return [];
        const logs = data as SupabaseAuditLog[];

        return logs.map((log) => ({
            id: log.id,
            action: log.action,
            details: log.details,
            targetId: log.target_id,
            createdAt: log.created_at
        }));
    }

    async updateUserRole(userId: string, newRole: string, client?: unknown): Promise<void> {
        const supabase = (client as import('@supabase/supabase-js').SupabaseClient) || this.defaultClient;
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) throw error;
    }
}
