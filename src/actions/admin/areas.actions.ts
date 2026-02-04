'use server'

import { getAreas } from '@/services/admin/areas.service'

export async function fetchAreas() {
    try {
        const areas = await getAreas()
        return { success: true, data: areas }
    } catch (error) {
        console.error('Error in fetchAreas:', error)
        return { success: false, error: 'Failed to fetch areas' }
    }
}
