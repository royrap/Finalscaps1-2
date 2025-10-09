const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://olxquclxgtrbyxfxxscj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHF1Y2x4Z3RyYnl4Znh4c2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MTQ3OTksImV4cCI6MjA2NDQ5MDc5OX0.8cZ6-Y5e1E8KK4znvQAzI6RkX3XMfgdgPyVAVj2hfh0"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createSamplePayments() {
  console.log('🔍 Fetching existing data for relationships...')
  
  try {
    // Get existing users (customers)
    const { data: customers } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, user_type')
      .eq('user_type', 'customer')
      .limit(3)

    // Get service providers
    const { data: providers } = await supabase
      .from('service_providers')
      .select('id, company_name')
      .limit(3)

    // Get service requests  
    const { data: requests } = await supabase
      .from('service_requests')
      .select('id, title, customer_id')
      .limit(3)

    console.log('📋 Available data:')
    console.log(`Customers: ${customers?.length || 0}`)
    console.log(`Providers: ${providers?.length || 0}`)
    console.log(`Requests: ${requests?.length || 0}`)

    if (!customers?.length || !providers?.length || !requests?.length) {
      console.log('❌ Not enough related data to create sample payments')
      return
    }

    console.log('\n💰 Creating sample payments...')

    // Create realistic sample payments
    const samplePayments = [
      {
        request_id: requests[0].id,
        customer_id: customers[0]?.id || requests[0].customer_id,
        provider_id: providers[0].id,
        amount: 1250.00,
        platform_fee: 125.00,
        provider_amount: 1125.00,
        payment_method: 'gcash',
        payment_gateway: 'paymongo',
        transaction_id: 'TXN_RoadAid_001_' + Date.now(),
        status: 'completed',
        processed_at: new Date().toISOString(),
        payment_verification_required: false,
        verification_status: 'not_required',
        payment_details: {
          gateway_reference: 'GCash_' + Math.random().toString(36).substr(2, 9),
          receipt_url: 'https://example.com/receipt/001'
        }
      },
      {
        request_id: requests[1]?.id || requests[0].id,
        customer_id: customers[1]?.id || customers[0].id,
        provider_id: providers[1]?.id || providers[0].id,
        amount: 2850.00,
        platform_fee: 285.00,
        provider_amount: 2565.00,
        payment_method: 'maya',
        payment_gateway: 'paymongo',
        transaction_id: 'TXN_RoadAid_002_' + Date.now(),
        status: 'in_escrow',
        processed_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        payment_verification_required: true,
        verification_status: 'pending',
        payment_details: {
          gateway_reference: 'Maya_' + Math.random().toString(36).substr(2, 9),
          receipt_url: 'https://example.com/receipt/002'
        }
      },
      {
        request_id: requests[2]?.id || requests[0].id,
        customer_id: customers[2]?.id || customers[0].id,
        provider_id: providers[2]?.id || providers[0].id,
        amount: 750.00,
        platform_fee: 75.00,
        provider_amount: 675.00,
        payment_method: 'credit_card',
        payment_gateway: 'stripe',
        transaction_id: 'TXN_RoadAid_003_' + Date.now(),
        status: 'processing',
        processed_at: null,
        payment_verification_required: false,
        verification_status: 'not_required',
        payment_details: {
          card_type: 'Visa',
          last_four: '4242',
          receipt_url: 'https://example.com/receipt/003'
        }
      },
      {
        request_id: requests[0].id,
        customer_id: customers[0]?.id || requests[0].customer_id,
        provider_id: providers[0].id,
        amount: 450.00,
        platform_fee: 45.00,
        provider_amount: 405.00,
        payment_method: 'grabpay',
        payment_gateway: 'paymongo',
        transaction_id: 'TXN_RoadAid_004_' + Date.now(),
        status: 'failed',
        processed_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        payment_verification_required: false,
        verification_status: 'not_required',
        payment_details: {
          error_code: 'insufficient_funds',
          error_message: 'Insufficient balance in GrabPay wallet'
        }
      },
      {
        request_id: requests[1]?.id || requests[0].id,
        customer_id: customers[1]?.id || customers[0].id,
        provider_id: providers[1]?.id || providers[0].id,
        amount: 3200.00,
        platform_fee: 320.00,
        provider_amount: 2880.00,
        payment_method: 'bank_transfer',
        payment_gateway: 'instapay',
        transaction_id: 'TXN_RoadAid_005_' + Date.now(),
        status: 'released_to_provider',
        processed_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        payment_verification_required: true,
        verification_status: 'verified',
        payment_details: {
          bank_name: 'BPI',
          reference_number: 'BT' + Math.random().toString(36).substr(2, 8).toUpperCase()
        }
      }
    ]

    console.log(`📝 Attempting to insert ${samplePayments.length} sample payments...`)

    // Try to insert payments
    const { data, error } = await supabase
      .from('payments')
      .insert(samplePayments)
      .select()

    if (error) {
      console.log('❌ Error inserting payments:', error.message)
      
      // If RLS is blocking, try a different approach
      if (error.message.includes('row-level security')) {
        console.log('\n🔒 Row Level Security is blocking inserts.')
        console.log('💡 You can either:')
        console.log('1. Temporarily disable RLS on payments table')
        console.log('2. Add payments through your app\'s normal flow')
        console.log('3. Use the service role key (with caution)')
        console.log('\n🔧 To test the payments UI, the schema and interface are ready!')
      }
    } else {
      console.log('✅ Successfully inserted', data?.length || 0, 'sample payments!')
      console.log('\n📊 Sample payment statuses created:')
      const statusCounts = {}
      data?.forEach(payment => {
        statusCounts[payment.status] = (statusCounts[payment.status] || 0) + 1
      })
      console.log(statusCounts)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createSamplePayments()