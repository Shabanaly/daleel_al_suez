import { ISettingsRepository } from "../../interfaces/settings-repository.interface";

export class UpdateSettingUseCase {
    constructor(private settingsRepository: ISettingsRepository) { }

    async execute(key: string, value: string, client?: any): Promise<void> {
        return this.settingsRepository.updateSetting(key, value, client);
    }
}
