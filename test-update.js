import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://olxquclxgtrbyxfxxscj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHF1Y2x4Z3RyYnl4Znh4c2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MTQ3OTksImV4cCI6MjA2NDQ5MDc5OX0.8cZ6-Y5e1E8KK4znvQAzI6RkX3XMfgdgPyVAVj2hfh0"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testUpdatePermissions() {
  console.log('Testing UPDATE permissions...')
  
  // Test 1: Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('Auth status:', user ? `Authenticated as ${user.email}` : 'Not authenticated')
  
  // Test 2: Try to select data first
  console.log('\n1. Testing SELECT first...')
  try {
    const { data: selectData, error: selectError } = await supabase
      .from('talyer_owner_verifications')
      .select('id, business_name, status')
      .limit(1)
    
    if (selectError) {
      console.error('❌ SELECT failed:', selectError)
      return
    }
    
    console.log('✅ SELECT works:', selectData?.length || 0, 'records')
    
    if (!selectData || selectData.length === 0) {
      console.log('ℹ️ No records to update')
      return
    }
    
    const testRecord = selectData[0]
    console.log('Test record:', testRecord)
    
    // Test 3: Try UPDATE
    console.log('\n2. Testing UPDATE...')
    const { data: updateData, error: updateError } = await supabase
      .from('talyer_owner_verifications')
      .update({ 
        admin_notes: `Test update at ${new Date().toISOString()}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', testRecord.id)
      .select()
    
    if (updateError) {
      console.error('❌ UPDATE failed:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        fullError: updateError
      })
    } else {
      console.log('✅ UPDATE works:', updateData)
    }
    
  } catch (err) {
    console.error('❌ Exception:', err)
  }
}

testUpdatePermissions()
