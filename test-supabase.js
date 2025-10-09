import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://olxquclxgtrbyxfxxscj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHF1Y2x4Z3RyYnl4Znh4c2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MTQ3OTksImV4cCI6MjA2NDQ5MDc5OX0.8cZ6-Y5e1E8KK4znvQAzI6RkX3XMfgdgPyVAVj2hfh0"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testTableAccess() {
  console.log('Testing Supabase connection...')
  
  // Test 1: Raw SQL query to see if table exists
  console.log('\n1. Testing if table exists with raw query...')
  try {
    const { data, error } = await supabase.rpc('get_table_info', {})
    console.log('RPC call result:', { data, error })
  } catch (err) {
    console.log('RPC not available, trying direct table access...')
  }
  
  // Test 2: Simple table select with minimal columns
  console.log('\n2. Testing simple select with specific columns...')
  try {
    const { data, error } = await supabase
      .from('talyer_owner_verifications')
      .select('id, business_name')
      .limit(1)
    
    if (error) {
      console.error('Simple select error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
    } else {
      console.log('Success! Data:', data)
    }
  } catch (err) {
    console.error('Simple select exception:', err)
  }
  
  // Test 3: Check if we can access without joins
  console.log('\n3. Testing single field select...')
  try {
    const { data, error } = await supabase
      .from('talyer_owner_verifications')
      .select('business_name')
      .limit(1)
    
    if (error) {
      console.error('Single field error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
    } else {
      console.log('Single field success! Data:', data)
    }
  } catch (err) {
    console.error('Single field exception:', err)
  }
  
  // Test 4: Test user_profiles table
  console.log('\n4. Testing user_profiles table...')
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, first_name')
      .limit(1)
    
    if (error) {
      console.error('User profiles error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
    } else {
      console.log('User profiles success! Data:', data)
    }
  } catch (err) {
    console.error('User profiles exception:', err)
  }
}

testTableAccess()
