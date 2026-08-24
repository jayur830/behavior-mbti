import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

async function testSupabase() {
  const env = dotenv.config({ path: '.env', override: true }).parsed || {};
  const url = env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  console.log('Testing Production Supabase with URL:', url);
  const client = createClient(url, key);

  // 1. Try public schema
  console.log('Trying public.mbti_results on Production...');
  const { data: d1, error: e1 } = await client.from('mbti_results').select('*').limit(1);
  if (e1) {
    console.log('public error:', e1.message);
  } else {
    console.log('✅ public.mbti_results EXISTS and works! Rows:', d1);
  }

  // 2. Try persona schema
  console.log('Trying persona.mbti_results on Production...');
  const { data: d2, error: e2 } = await client.schema('persona').from('mbti_results').select('*').limit(1);
  if (e2) {
    console.log('persona error:', e2.message);
  } else {
    console.log('✅ persona.mbti_results EXISTS and works! Rows:', d2);
  }
}

testSupabase();
