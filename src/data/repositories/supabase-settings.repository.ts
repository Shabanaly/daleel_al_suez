import { createClient } from "@/lib/supabase/client";
import { ISettingsRepository } from "@/domain/interfaces/settings-repository.interface";
import { Setting } from "@/domain/entities/setting";

export class SupabaseSettingsRepository implements ISettingsRepository {
    private supabase = createClient();

    async getSettingsByGroup(group: string): Promise<Setting[]> {
        const { data, error } = await this.supabase
            .from('settings')
            .select('*')
            .eq('group', group)
            .order('key');

        if (error) throw new Error(error.message);
        return data.map(this.mapToEntity);
    }

    async getAllSettings(): Promise<Setting[]> {
        const { data, error } = await this.supabase
            .from('settings')
            .select('*')
            .order('group');

        if (error) throw new Error(error.message);
        return data.map(this.mapToEntity);
    }

    async getPublicSettings(): Promise<Record<string, any>> {
        const { data, error } = await this.supabase
            .from('settings')
            .select('*')
            .eq('is_public', true);

        if (error) {
            console.error("Error fetching public settings:", error);
            return {};
        }

        // Convert to Key-Value map with parsed types
        const settingsMap: Record<string, any> = {};
        data.forEach(item => {
            let parsedValue = item.value;
            if (item.type === 'boolean') parsedValue = item.value === 'true';
            if (item.type === 'json') {
                try { parsedValue = JSON.parse(item.value); } catch (e) { console.error(`Failed to parse scalar setting ${item.key}`); }
            }
            settingsMap[item.key] = parsedValue;
        });
        return settingsMap;
    }

    async updateSetting(key: string, value: string, client?: any): Promise<void> {
        // Use injected client (for server actions) or default (browser)
        const supabaseClient = client || this.supabase;

        const { error } = await supabaseClient
            .from('settings')
            .update({ value, updated_at: new Date().toISOString() })
            .eq('key', key);

        if (error) throw new Error(error.message);
    }

    private mapToEntity(data: any): Setting {
        return {
            key: data.key,
            value: data.value,
            group: data.group,
            type: data.type,
            label: data.label,
            description: data.description,
            isPublic: data.is_public,
            updatedAt: new Date(data.updated_at)
        };
    }
}
