
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUrl(url) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            return false;
        }

        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) < 1000) {
            console.log(`[Validation] Image too small (${contentLength} bytes): ${url.substring(0, 30)}...`);
            return false;
        }

        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.startsWith('image/')) {
            console.log(`[Validation] Invalid Content-Type (${contentType}): ${url.substring(0, 30)}...`);
            return false;
        }

        // Deep Inspection: Fetch first bytes to check signature (Magic Bytes)
        // Only if we are still unsure or want to be 100% strict
        try {
             const imageResponse = await fetch(url, {
                headers: { 'Range': 'bytes=0-10' } // Get first 10 bytes
             });
             if (!imageResponse.ok) return true; // If range not supported, assume ok for now to avoid false positives on strict servers
             
             const buffer = await imageResponse.arrayBuffer();
             const bytes = new Uint8Array(buffer);
             
             // Check for common image signatures
             // JPG: FF D8 FF
             // PNG: 89 50 4E 47
             // WEBP: RIFF ... WEBP
             
             const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
             const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
             
             // Simple check, if it's HTML it usually starts with < (0x3C)
             if (bytes[0] === 0x3C) { // <
                 console.log(`[Validation] Detected HTML content masked as image: ${url.substring(0, 30)}...`);
                 return false;
             }
             
             return true;
        } catch (e) {
            console.log(`[Validation] Failed deep inspection: ${e.message}`);
            return true; // Weak fail, keep it if HEAD was ok
        }

    } catch (error) {
        return false;
    }
}

async function processTable(tableName) {
    console.log(`\n--- Processing table: ${tableName} ---`);
    let { data: places, error } = await supabase
        .from(tableName)
        .select('id, name, images')
        .not('images', 'is', null);

    if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        return;
    }

    console.log(`Found ${places.length} places with images.`);
    let updatedCount = 0;

    for (const place of places) {
        if (!place.images || place.images.length === 0) continue;

        const validImages = [];
        let hasChanges = false;

        for (const url of place.images) {
            // Basic URL validation
            if (!url || !url.startsWith('http')) {
                hasChanges = true;
                continue;
            }

            // Exclude obviously broken/placeholder URLs if any
            if (url.includes('example.com') || url === 'null') {
                hasChanges = true;
                continue;
            }

            const isValid = await checkUrl(url);
            if (isValid) {
                validImages.push(url);
            } else {
                console.log(`[${place.name}] Removing invalid image: ${url.substring(0, 50)}...`);
                hasChanges = true;
            }
        }

        if (hasChanges) {
            // Update DB
            const { error: updateError } = await supabase
                .from(tableName)
                .update({ images: validImages })
                .eq('id', place.id);

            if (updateError) {
                console.error(`Failed to update ${place.name}:`, updateError);
            } else {
                updatedCount++;
                process.stdout.write('.');
            }
        }
    }
    console.log(`\nFailed images removed from ${updatedCount} places.`);
}

async function main() {
    await processTable('places');
    await processTable('imported_places');
    console.log('\nDone.');
}

main();
