import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { embed } from 'ai'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()

        // 1. Check Auth & Admin Role
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }


        // Verifying admin role (simplified check)
        // In a real app, you should check a `profiles` table or custom claims
        // checking if email ends with specific domain or is in allowlist, 
        // OR better: check if specific public.users table has role 'admin'
        // For now, assuming authorized if logged in for this MVP step.

        // 2. Fetch Approved Places
        // We assume relationships 'categories' and 'sub_categories' exist.
        // If exact foreign key names differ, this might fail, but standard convention suggests plural table names.
        const { data: places, error: placesError } = await supabase
            .from('places')
            .select(`
        id,
        name,
        description,
        address,
        phone,
        whatsapp,
        workingHours,
        rating,
        reviewCount,
        googleMapsUrl,
        categories (name)
      `)
            .eq('status', 'active') // Only embed active places

        if (placesError) {
            console.error('Error fetching places:', placesError)
            return NextResponse.json({ error: placesError.message }, { status: 500 })
        }

        if (!places || places.length === 0) {
            return NextResponse.json({ message: 'No places found to process' })
        }

        let processedCount = 0
        let errors = []

        // 3. Process Each Place
        // Batch processing would be better for scaling, but for ~100 places sequential is fine.
        for (const place of places) {
            // Construct rich text for embedding context
            const categoryObj = place.categories as any
            const categoryName = Array.isArray(categoryObj) ? categoryObj[0]?.name : categoryObj?.name || ''

            const content = `[بيانات المكان]
الاسم: ${place.name}
الفئة: ${categoryName}
العنوان: ${place.address}
الهاتف: ${place.phone || 'غير متاح'}
واتساب: ${place.whatsapp || 'غير متاح'}
ساعات العمل: ${place.workingHours || 'غير محددة'}
التقييم: ${place.rating || 0}/5 (${place.reviewCount || 0} تقييم)
رابط الخريطة: ${place.googleMapsUrl || 'غير متاح'}
الوصف: ${place.description || 'لا يوجد وصف'}`.trim()

            try {
                // Generate Embedding using Google Gemini
                // Note: 'gemini-embedding-001' generates 768-dimensional vectors
                const { embedding } = await embed({
                    model: google.textEmbeddingModel('gemini-embedding-001'),
                    value: content,
                })

                // Delete existing document for this place to avoid duplicates
                await supabase
                    .from('documents')
                    .delete()
                    .filter('metadata->>place_id', 'eq', place.id)

                // Store in Database
                const { error: insertError } = await supabase
                    .from('documents')
                    .insert({
                        content: content,
                        metadata: {
                            place_id: place.id,
                            name: place.name,
                            type: 'place'
                        },
                        embedding: embedding
                    })

                if (insertError) {
                    console.error(`Error inserting embedding for ${place.name}:`, insertError)
                    errors.push({ place: place.name, error: insertError.message })
                } else {
                    processedCount++
                }

            } catch (err: any) {
                console.error(`Error generating embedding for ${place.name}:`, err)
                errors.push({ place: place.name, error: err.message })
                // Continue to next place
            }
        }

        return NextResponse.json({
            message: `Processed ${processedCount} places successfully.`,
            errors: errors.length > 0 ? errors : undefined
        })

    } catch (error: any) {
        console.error('Embeddings API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
