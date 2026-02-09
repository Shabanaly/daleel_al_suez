
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function clearBadData() {
    console.log('Clearing old bulk_script data...');
    const { error, count } = await supabase
        .from('imported_places')
        .delete({ count: 'exact' })
        .eq('source', 'bulk_script');

    if (error) console.error(error);
    else console.log(`Deleted ${count} incomplete records.`);
}

clearBadData();
