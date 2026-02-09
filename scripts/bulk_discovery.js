const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERPER_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function searchSerper(query) {
    const url = 'https://google.serper.dev/places';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: query, gl: 'eg', hl: 'ar' })
    });
    return await response.json();
}

async function fetchPhotos(query) {
    try {
        const response = await fetch('https://google.serper.dev/images', {
            method: 'POST',
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: query,
                gl: 'eg',
                hl: 'ar',
                num: 5
            })
        });

        if (!response.ok) return [];
        const data = await response.json();
        return (data.images || []).map(img => img.imageUrl);
    } catch (error) {
        console.error('Error fetching photos:', error.message);
        return [];
    }
}

async function main() {
    console.log('Starting Advanced Bulk Discovery Script...');

    // 1. Get Categories
    const { data: categories, error } = await supabase.from('categories').select('id, name');
    if (error) {
        console.error('Error fetching categories:', error);
        return;
    }
    console.log(`Found ${categories.length} categories.`);

    let totalAdded = 0;

    for (const cat of categories) {
        const query = `${cat.name} في السويس`;
        console.log(`\n🔍 Searching: ${query}...`);

        try {
            const data = await searchSerper(query);
            const places = data.places || [];
            console.log(`   Found ${places.length} raw results.`);

            for (const place of places) {
                const googlePlaceId = place.placeId || place.cid;
                if (!googlePlaceId) {
                    continue;
                }

                // Deep Fetch: Get extra images
                const photoQuery = `${place.title} ${place.address || 'Suez'}`;
                const extraPhotos = await fetchPhotos(photoQuery);
                
                // Combine thumbnail with extra photos
                const allImages = new Set();
                if (place.thumbnailUrl) allImages.add(place.thumbnailUrl);
                extraPhotos.forEach(p => allImages.add(p));
                const imagesArray = Array.from(allImages);

                // Construct Rich Data
                const googleMapsUrl = place.placeId 
                    ? `https://www.google.com/maps/place/?q=place_id:${place.placeId}` 
                    : `https://www.google.com/maps/place/?q=${encodeURIComponent(place.title + ' ' + place.address)}`;

                const importedData = {
                    google_place_id: String(googlePlaceId),
                    name: place.title,
                    address: place.address,
                    rating: place.rating,
                    review_count: place.reviewCount || place.ratingCount,
                    website: place.website,
                    phone: place.phoneNumber,
                    google_maps_url: googleMapsUrl,
                    // Map simple fields
                    google_types: [place.category],
                    local_category_id: cat.id, 
                    status: 'auto_pending',
                    confidence_score: (place.rating || 0) > 4 ? 0.9 : 0.6,
                    source: 'bulk_script_v3', // Version 3
                    images: imagesArray,
                    description: place.description || place.snippet 
                };

                // Insert into imported_places
                const { error: insertError } = await supabase
                    .from('imported_places')
                    .upsert(importedData, { onConflict: 'google_place_id' });
                
                if (!insertError) {
                    process.stdout.write('+');
                    totalAdded++;
                } else {
                    console.error(`\n[Error] ${place.title}:`, insertError.message);
                }
            }
        } catch (e) {
            console.error(`Error processing ${query}:`, e.message);
        }
    }

    console.log(`\n\n✅ Advanced Bulk Discovery Complete. Updated ${totalAdded} places.`);
}

main();
