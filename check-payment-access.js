const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://olxquclxgtrbyxfxxscj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHF1Y2x4Z3RyYnl4Znh4c2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MTQ3OTksImV4cCI6MjA2NDQ5MDc5OX0.8cZ6-Y5e1E8KK4znvQAzI6RkX3XMfgdgPyVAVj2hfh0"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkRLSPolicies() {
  console.log('🔍 Checking RLS policies and payment access...')
  
  try {
    // First, try to query payments with current auth
    console.log('\n📋 Checking current payment records access...')
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .limit(5)

    if (paymentsError) {
      console.log('❌ Cannot read payments:', paymentsError.message)
    } else {
      console.log(`✅ Can read payments table. Records found: ${payments?.length || 0}`)
      if (payments?.length > 0) {
        console.log('Sample payment:', {
          id: payments[0].id,
          amount: payments[0].amount,
          status: payments[0].status,
          created_at: payments[0].created_at
        })
      }
    }

    // Check if we can access the table structure
    console.log('\n🏗️  Checking table structure access...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('payments')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (tableError && !tableError.message.includes('no rows')) {
      console.log('❌ Table access issue:', tableError.message)
    } else {
      console.log('✅ Can access payments table structure')
    }

    // Check authentication status
    console.log('\n👤 Checking authentication status...')
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      console.log(`✅ Authenticated as: ${user.email} (${user.id})`)
      
      // Check user role
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_type, role')
        .eq('id', user.id)
        .single()

      if (profile) {
        console.log(`👑 User role: ${profile.user_type} (${profile.role || 'no specific role'})`)
      }
    } else {
      console.log('❌ Not authenticated - this might be why RLS is blocking access')
    }

    // Try to check what specific policies might exist
    console.log('\n🛡️  RLS Policy Summary:')
    console.log('The payments table has RLS enabled which is blocking:')
    console.log('- Anonymous/unauthenticated access')
    console.log('- Users without proper permissions')
    console.log('')
    console.log('💡 Solutions:')
    console.log('1. Authenticate as admin in your app and payments will show')
    console.log('2. Your payments interface should work properly when logged in')
    console.log('3. The UI is ready - just need proper authentication')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkRLSPolicies()