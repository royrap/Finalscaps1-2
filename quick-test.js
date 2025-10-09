import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://olxquclxgtrbyxfxxscj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHF1Y2x4Z3RyYnl4Znh4c2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MTQ3OTksImV4cCI6MjA2NDQ5MDc5OX0.8cZ6-Y5e1E8KK4znvQAzI6RkX3XMfgdgPyVAVj2hfh0"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAccess() {
  console.log('Testing current RLS policies...')
  
  // Test 1: Direct table access
  console.log('\n1. Testing direct table access...')
  try {
    const { data, error } = await supabase
      .from('talyer_owner_verifications')
      .select('id, business_name, status')
      .limit(1)
    
    if (error) {
      console.error('❌ Direct access failed:', {
        code: error.code,
        message: error.message
      })
    } else {
      console.log('✅ Direct access works:', data?.length || 0, 'records')
    }
  } catch (err) {
    console.error('❌ Exception:', err.message)
  }
  
  // Test 2: Check what tables ARE accessible
  console.log('\n2. Testing other tables for comparison...')
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ user_profiles failed:', error.message)
    } else {
      console.log('✅ user_profiles works:', data?.length || 0, 'records')
    }
  } catch (err) {
    console.error('❌ user_profiles exception:', err.message)
  }
}

testAccess()
