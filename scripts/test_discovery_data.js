
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SERPER_API_KEY = process.env.SERPER_API_KEY;

if (!SERPER_API_KEY) {
    console.error('Missing SERPER_API_KEY');
    process.exit(1);
}

async function searchSerper(query) {
    const url = 'https://google.serper.dev/places';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: query, gl: 'eg', hl: 'ar', num: 1 }) // Fetch only 1
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
    console.log('🧪 Starting Data Quality Test...');

    const query = 'مطاعم في السويس'; // Test Query
    console.log(`\n🔍 Searching: ${query}...`);

    try {
        const data = await searchSerper(query);
        const places = data.places || [];
        
        if (places.length === 0) {
            console.error('❌ No results found to test.');
            return;
        }

        const place = places[0];
        console.log(`   Found place: ${place.title}`);

        // Deep Fetch Simulation
        console.log('   📸 Fetching Deep Images...');
        const photoQuery = `${place.title} ${place.address || 'Suez'}`;
        const extraPhotos = await fetchPhotos(photoQuery);
        
        const allImages = new Set();
        if (place.thumbnailUrl) allImages.add(place.thumbnailUrl);
        extraPhotos.forEach(p => allImages.add(p));
        const imagesArray = Array.from(allImages);

        // Construct Data
        const googlePlaceId = place.placeId || place.cid;
        const googleMapsUrl = place.placeId 
            ? `https://www.google.com/maps/place/?q=place_id:${place.placeId}` 
            : `https://www.google.com/maps/place/?q=${encodeURIComponent(place.title + ' ' + place.address)}`;

        const richData = {
            name: place.title,
            address: place.address,
            phone: place.phoneNumber || 'N/A',
            website: place.website || 'N/A',
            rating: place.rating,
            review_count: place.reviewCount || place.ratingCount,
            google_maps_url: googleMapsUrl,
            images_count: imagesArray.length,
            images_preview: imagesArray,
            description: place.description || place.snippet,
            original_category: place.category
        };

        console.log('\n------------------------------------------------');
        console.log('📋 FINAL DATA PREVIEW (What will be saved)');
        console.log('------------------------------------------------');
        console.log(JSON.stringify(richData, null, 2));
        console.log('------------------------------------------------');
        
        if (imagesArray.length === 0) console.warn('⚠️ WARNING: No images found!');
        if (!richData.google_maps_url) console.warn('⚠️ WARNING: No Map URL!');
        if (!richData.description) console.warn('⚠️ WARNING: No Description!');

    } catch (e) {
        console.error(`Error processing test:`, e.message);
    }
}

main();
