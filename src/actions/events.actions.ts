'use server'

import { getEventByIdUseCase } from "@/di/modules";
import { SuezEvent } from "@/domain/entities/suez-event";

export async function getEventAction(id: string): Promise<SuezEvent | null> {
    try {
        return await getEventByIdUseCase.execute(id);
    } catch (error) {
        console.error('Error fetching event:', error);
        return null;
    }
}
