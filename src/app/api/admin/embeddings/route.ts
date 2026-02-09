import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { embed } from 'ai'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: Request) {
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
        slug,
        name,
        description,
        address,
        phone,
        whatsapp,
        website,
        rating,
        review_count,
        google_maps_url,
        opens_at,
        closes_at,
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
        const errors: { place: string; error: string }[] = []

        // 3. Process Each Place
        // Batch processing would be better for scaling, but for ~100 places sequential is fine.
        const adminSupabase = createServiceRoleClient() // Use Service Role to bypass RLS for admin tasks

        for (const place of places) {
            // Force recompile hint: V2-768DIMS-FIX
            // Construct rich text for embedding context
            const categoryObj = place.categories as unknown as { name: string } | { name: string }[] | null
            const categoryName = Array.isArray(categoryObj) ? (categoryObj[0] as { name: string } | undefined)?.name : (categoryObj as { name: string } | null)?.name || ''

            const content = `[بيانات المكان]
الاسم: ${place.name}
الفئة: ${categoryName}
الرابط (Slug): ${place.slug}
العنوان: ${place.address}
الهاتف: ${place.phone || 'غير متاح'}
واتساب: ${place.whatsapp || 'غير متاح'}
الموقع الإلكتروني: ${place.website || 'غير متاح'}
ساعات العمل: ${place.opens_at && place.closes_at ? `${place.opens_at} - ${place.closes_at}` : 'غير محددة'}
التقييم: ${place.rating || 0}/5 (${place.review_count || 0} تقييم)
الرابط الخريطة: ${place.google_maps_url || 'غير متاح'}
الوصف: ${place.description || 'لا يوجد وصف'}`.trim()

            try {
                // Generate Embedding using Google Gemini
                // Note: gemini-embedding-001 generates 3072 dimensions by default
                // We reduce it to 768 to match our database schema
                const { embedding } = await embed({
                    model: google.textEmbeddingModel('gemini-embedding-001'),
                    value: content,
                    providerOptions: {
                        google: {
                            outputDimensionality: 768,
                            taskType: 'RETRIEVAL_DOCUMENT'
                        }
                    }
                })

                // Delete existing document for this place to avoid duplicates
                await adminSupabase
                    .from('documents')
                    .delete()
                    .filter('metadata->>place_id', 'eq', place.id)

                // Store in Database
                const { error: insertError } = await adminSupabase
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

            } catch (err) {
                const message = err instanceof Error ? err.message : String(err)
                console.error(`Error generating embedding for ${place.name}:`, err)
                errors.push({ place: place.name, error: message })
                // Continue to next place
            }
        }

        return NextResponse.json({
            processed: processedCount,
            message: `Processed ${processedCount} places successfully.`,
            errors: errors.length > 0 ? errors : undefined
        })

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error('Embeddings API Error:', error)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
