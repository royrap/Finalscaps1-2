const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wmfvifqymmqtqwqmxvnj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZnZpZnF5bW1xdHF3cW14dm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0MTQzNzYsImV4cCI6MjA0Mjk5MDM3Nn0.8ol6MmetBSKTxd5YgwNV87HZilcH20g37_qSf9GdPxE'
const supabase = createClient(supabaseUrl, supabaseKey)

async function createSamplePayments() {
  try {
    console.log('🔍 Fetching service requests with providers...')
    
    // Get service requests that have providers
    const { data: requests, error: reqError } = await supabase
      .from('service_requests')
      .select('id, customer_id, provider_id, final_price, created_at')
      .not('provider_id', 'is', null)
      .limit(5)
    
    if (reqError) {
      console.error('❌ Error fetching requests:', reqError)
      return
    }
    
    if (!requests || requests.length === 0) {
      console.log('⚠️ No service requests with providers found')
      console.log('Let me try getting ANY service requests...')
      
      const { data: anyRequests, error: anyError } = await supabase
        .from('service_requests')
        .select('id, customer_id, provider_id, final_price, created_at')
        .limit(5)
      
      if (anyError) {
        console.error('❌ Error:', anyError)
        return
      }
      
      console.log(`📋 Found ${anyRequests?.length || 0} service requests`)
      console.log('Sample request:', anyRequests?.[0])
      
      if (!anyRequests || anyRequests.length === 0) {
        console.log('❌ No service requests exist at all!')
        return
      }
      
      // Use these requests anyway, we'll handle null provider_id
      requests.length = 0
      requests.push(...anyRequests)
    }
    
    console.log(`✅ Found ${requests.length} service requests`)
    console.log('Sample request:', requests[0])
    
    // Create payments for each request
    const paymentsToInsert = requests.map((req, index) => {
      const amount = req.final_price || (1000 + index * 500)
      const platformFee = amount * 0.10 // 10% platform fee
      const providerAmount = amount - platformFee
      
      const paymentMethods = ['card', 'gcash', 'paymaya', 'cash', 'bank_transfer']
      const paymentGateways = ['paymongo', 'gcash', 'paymaya', 'manual', 'bank']
      const statuses = ['completed', 'completed', 'pending', 'processing', 'completed']
      
      return {
        request_id: req.id,
        customer_id: req.customer_id,
        provider_id: req.provider_id || req.customer_id, // fallback if no provider
        amount: amount,
        platform_fee: platformFee,
        provider_amount: providerAmount,
        payment_method: paymentMethods[index % paymentMethods.length],
        payment_gateway: paymentGateways[index % paymentGateways.length],
        transaction_id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: statuses[index % statuses.length],
        processed_at: statuses[index % statuses.length] === 'completed' ? new Date().toISOString() : null,
        created_at: req.created_at || new Date().toISOString(),
        payment_verification_required: paymentMethods[index % paymentMethods.length] === 'cash',
        verification_status: paymentMethods[index % paymentMethods.length] === 'cash' ? 'pending' : 'not_required'
      }
    })
    
    console.log('\n💳 Creating payments...')
    console.log('Sample payment to insert:', paymentsToInsert[0])
    
    const { data: insertedPayments, error: insertError } = await supabase
      .from('payments')
      .insert(paymentsToInsert)
      .select()
    
    if (insertError) {
      console.error('❌ Error inserting payments:', insertError)
      console.error('Full error:', JSON.stringify(insertError, null, 2))
      return
    }
    
    console.log(`\n✅ Successfully created ${insertedPayments?.length || 0} payments!`)
    console.log('\n📊 Payment Summary:')
    insertedPayments?.forEach((payment, i) => {
      console.log(`\n${i + 1}. Transaction ID: ${payment.transaction_id}`)
      console.log(`   Amount: ₱${payment.amount}`)
      console.log(`   Method: ${payment.payment_method}`)
      console.log(`   Status: ${payment.status}`)
    })
    
    // Verify
    const { count } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
    
    console.log(`\n✅ Total payments in database: ${count}`)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createSamplePayments()
