
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fetchImages(query) {
    try {
        const response = await fetch('https://google.serper.dev/images', {
            method: 'POST',
            headers: {
                'X-API-KEY': process.env.SERPER_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: query,
                gl: 'eg',
                hl: 'ar',
                num: 10
            })
        });

        if (!response.ok) return [];
        const data = await response.json();
        if (!data.images || !Array.isArray(data.images)) return [];

        return data.images.slice(0, 5).map(img => img.imageUrl);
    } catch (error) {
        console.error('Error fetching images:', error);
        return [];
    }
}

async function run() {
    console.log('Starting image fix migration...');
    
    // Get pending/auto_pending imported places with <= 1 image
    const { data: places, error } = await supabase
        .from('imported_places')
        .select('*')
        .in('status', ['pending', 'auto_pending'])
        .order('created_at', { ascending: true }) // Oldest first
        .limit(50);

    if (error) {
        console.error('Error fetching places:', error);
        return;
    }

    const targets = places.filter(p => !p.images || p.images.length <= 1);
    console.log(`Found ${targets.length} places to process out of ${places.length} fetched.`);

    for (const place of targets) {
        console.log(`Processing: ${place.name}...`);
        
        const query = `${place.name} ${place.address || ''} Suez`;
        const newImages = await fetchImages(query);

        if (newImages.length > 0) {
            // Combine with existing (unique)
            const existing = place.images || [];
            const combined = Array.from(new Set([...existing, ...newImages]));

            const { error: updateError } = await supabase
                .from('imported_places')
                .update({ images: combined })
                .eq('id', place.id);

            if (updateError) {
                console.error(`Failed to update ${place.name}:`, updateError);
            } else {
                console.log(`Updated ${place.name}: ${combined.length} images.`);
            }
        } else {
            console.log(`No new images found for ${place.name}.`);
        }

        // Delay 500ms
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('Migration batch finished.');
}

run();
