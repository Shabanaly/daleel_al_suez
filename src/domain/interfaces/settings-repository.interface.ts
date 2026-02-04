import { Setting } from "../entities/setting";

export interface ISettingsRepository {
    getSettingsByGroup(group: string): Promise<Setting[]>;
    getAllSettings(): Promise<Setting[]>;
    getPublicSettings(): Promise<Record<string, any>>; // Returns key-parsedValue map for frontend
    updateSetting(key: string, value: string, client?: any): Promise<void>;
}
