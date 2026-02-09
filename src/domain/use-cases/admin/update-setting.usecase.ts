import { ISettingsRepository } from "../../interfaces/settings-repository.interface";

export class UpdateSettingUseCase {
    constructor(private settingsRepository: ISettingsRepository) { }

    async execute(key: string, value: string, client?: unknown): Promise<void> {
        return this.settingsRepository.updateSetting(key, value, client);
    }
}
