const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://olxquclxgtrbyxfxxscj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHF1Y2x4Z3RyYnl4Znh4c2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MTQ3OTksImV4cCI6MjA2NDQ5MDc5OX0.8cZ6-Y5e1E8KK4znvQAzI6RkX3XMfgdgPyVAVj2hfh0"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkPaymentsData() {
  console.log('🔍 Checking payments table...')
  
  try {
    // Check basic payments table
    const { data: payments, error: paymentsError, count } = await supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .limit(5)

    console.log('\n📊 Payments Table Status:')
    console.log('Count:', count)
    console.log('Error:', paymentsError)
    console.log('Sample Data:', payments ? payments.length : 0, 'records')
    
    if (payments && payments.length > 0) {
      console.log('\n💰 Sample Payment:')
      console.log(JSON.stringify(payments[0], null, 2))
    }

    // Test the join query that the payments page uses
    console.log('\n🔗 Testing join query (same as payments page)...')
    const { data: joinedData, error: joinError } = await supabase
      .from('payments')
      .select(`
        *,
        customer:user_profiles!customer_id (
          first_name,
          last_name,
          email,
          phone_number
        ),
        provider:service_providers!provider_id (
          company_name,
          user_profiles!user_id (
            first_name,
            last_name
          )
        ),
        request:service_requests!request_id (
          title,
          description,
          status
        )
      `)
      .limit(3)

    console.log('Join Query Result:')
    console.log('Error:', joinError)
    console.log('Data length:', joinedData ? joinedData.length : 0)
    
    if (joinedData && joinedData.length > 0) {
      console.log('\n🎯 Sample Joined Payment:')
      console.log(JSON.stringify(joinedData[0], null, 2))
    }

    // Check related tables
    console.log('\n📋 Related Tables Check:')
    const tables = [
      'user_profiles',
      'service_providers', 
      'service_requests'
    ]
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1)

        console.log(`${table}: ${count} records ${error ? `(Error: ${error.message})` : '✅'}`)
      } catch (err) {
        console.log(`${table}: Error - ${err.message}`)
      }
    }

  } catch (error) {
    console.error('❌ Error checking payments:', error)
  }
}

checkPaymentsData()