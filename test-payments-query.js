const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://olxquclxgtrbyxfxxscj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHF1Y2x4Z3RyYnl4Znh4c2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MTQ3OTksImV4cCI6MjA2NDQ5MDc5OX0.8cZ6-Y5e1E8KK4znvQAzI6RkX3XMfgdgPyVAVj2hfh0"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testPaymentsQuery() {
  console.log('Testing payments table query...')
  
  // First, test basic table access
  try {
    const { data, error, count } = await supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .limit(5)

    console.log('Payments query result:')
    console.log('Count:', count)
    console.log('Error:', error)
    console.log('Data length:', data ? data.length : 0)
    
    if (data && data.length > 0) {
      console.log('Sample payment:', JSON.stringify(data[0], null, 2))
    }

  } catch (error) {
    console.error('Error querying payments:', error)
  }

  // Test with joins
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        customer:user_profiles!customer_id (
          first_name,
          last_name,
          email
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

    console.log('\nJoin query result:')
    console.log('Error:', error)
    console.log('Data length:', data ? data.length : 0)
    
    if (data && data.length > 0) {
      console.log('Sample joined payment:', JSON.stringify(data[0], null, 2))
    }

  } catch (error) {
    console.error('Error with join query:', error)
  }

  // Check related tables
  const tables = ['user_profiles', 'service_providers', 'service_requests']
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1)

      console.log(`\n${table} table:`)
      console.log('Count:', count)
      console.log('Error:', error)
    } catch (error) {
      console.error(`Error querying ${table}:`, error)
    }
  }
}

testPaymentsQuery()