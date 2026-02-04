import { Setting } from "../../entities/setting";
import { ISettingsRepository } from "../../interfaces/settings-repository.interface";

export class GetSettingsUseCase {
    constructor(private settingsRepository: ISettingsRepository) { }

    async execute(group?: string): Promise<Setting[]> {
        if (group) {
            return this.settingsRepository.getSettingsByGroup(group);
        }
        return this.settingsRepository.getAllSettings();
    }
}
