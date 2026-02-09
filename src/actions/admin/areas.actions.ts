'use server'

import { getAreasUseCase } from '@/di/modules'

export async function fetchAreas() {
    try {
        const areas = await getAreasUseCase.execute()
        return { success: true, data: areas }
    } catch (error) {
        console.error('Error in fetchAreas:', error)
        return { success: false, error: 'Failed to fetch areas' }
    }
}
