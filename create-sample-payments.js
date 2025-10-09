const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://olxquclxgtrbyxfxxscj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHF1Y2x4Z3RyYnl4Znh4c2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MTQ3OTksImV4cCI6MjA2NDQ5MDc5OX0.8cZ6-Y5e1E8KK4znvQAzI6RkX3XMfgdgPyVAVj2hfh0"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createSamplePayments() {
  console.log('Creating sample payment data...')
  
  // First, get some existing IDs from related tables
  const { data: customers } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_type', 'customer')
    .limit(2)

  const { data: providers } = await supabase
    .from('service_providers')
    .select('id')
    .limit(2)

  const { data: requests } = await supabase
    .from('service_requests')
    .select('id')
    .limit(2)

  console.log('Available customers:', customers?.length || 0)
  console.log('Available providers:', providers?.length || 0)
  console.log('Available requests:', requests?.length || 0)

  if (!customers || !providers || !requests || customers.length === 0 || providers.length === 0 || requests.length === 0) {
    console.log('Missing required data in related tables. Cannot create sample payments.')
    return
  }

  // Create sample payments
  const samplePayments = [
    {
      request_id: requests[0].id,
      customer_id: customers[0].id,
      provider_id: providers[0].id,
      amount: 1500.00,
      platform_fee: 150.00,
      provider_amount: 1350.00,
      payment_method: 'gcash',
      payment_gateway: 'paymongo',
      transaction_id: 'TXN_001_2024_10_01',
      status: 'completed',
      processed_at: new Date().toISOString(),
      payment_verification_required: false,
      verification_status: 'not_required'
    },
    {
      request_id: requests[1] ? requests[1].id : requests[0].id,
      customer_id: customers[1] ? customers[1].id : customers[0].id,
      provider_id: providers[1] ? providers[1].id : providers[0].id,
      amount: 2500.00,
      platform_fee: 250.00,
      provider_amount: 2250.00,
      payment_method: 'maya',
      payment_gateway: 'paymongo',
      transaction_id: 'TXN_002_2024_10_01',
      status: 'pending',
      processed_at: null,
      payment_verification_required: true,
      verification_status: 'pending'
    },
    {
      request_id: requests[0].id,
      customer_id: customers[0].id,
      provider_id: providers[0].id,
      amount: 750.00,
      platform_fee: 75.00,
      provider_amount: 675.00,
      payment_method: 'credit_card',
      payment_gateway: 'stripe',
      transaction_id: 'TXN_003_2024_10_01',
      status: 'in_escrow',
      processed_at: new Date().toISOString(),
      payment_verification_required: true,
      verification_status: 'verified'
    }
  ]

  try {
    const { data, error } = await supabase
      .from('payments')
      .insert(samplePayments)
      .select()

    if (error) {
      console.error('Error creating sample payments:', error)
    } else {
      console.log('Successfully created sample payments:', data?.length || 0)
      console.log('Sample payment IDs:', data?.map(p => p.id) || [])
    }
  } catch (error) {
    console.error('Exception creating payments:', error)
  }
}

createSamplePayments()