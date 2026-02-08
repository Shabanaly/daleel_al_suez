import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  const { count: placesCount } = await supabase.from('places').select('*', { count: 'exact', head: true })
  const { count: docsCount } = await supabase.from('documents').select('*', { count: 'exact', head: true })
  
  console.log('--- Database Status ---')
  console.log('Places count:', placesCount)
  console.log('Documents (Embeddings) count:', docsCount)
  
  if (docsCount === 0 && (placesCount || 0) > 0) {
    console.log('\n[!] ACTION REQUIRED: You need to click "Update AI Data" in the Admin Dashboard to generate embeddings.')
  }
}

check()
