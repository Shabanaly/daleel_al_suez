import { createClient } from '@/lib/supabase/server'

export interface Area {
    id: string
    name: string
    slug: string
    created_at: string
}

export async function getAreas() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name')

    if (error) {
        throw new Error(`Error fetching areas: ${error.message}`)
    }

    return data as Area[]
}
