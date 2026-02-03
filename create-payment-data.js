const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://olxquclxgtrbyxfxxscj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHF1Y2x4Z3RyYnl4Znh4c2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MTQ3OTksImV4cCI6MjA2NDQ5MDc5OX0.8cZ6-Y5e1E8KK4znvQAzI6RkX3XMfgdgPyVAVj2hfh0'
const supabase = createClient(supabaseUrl, supabaseKey)

async function createSamplePayments() {
  console.log('🔍 Fetching service requests and related data...')
  
  // Get service requests with customer and provider
  const { data: requests, error: requestError } = await supabase
    .from('service_requests')
    .select('id, customer_id, provider_id, final_price, title')
    .not('provider_id', 'is', null)
    .limit(5)

  if (requestError) {
    console.error('❌ Error fetching requests:', requestError)
    return
  }

  if (!requests || requests.length === 0) {
    console.log('❌ No service requests found with providers')
    return
  }

  console.log(`✅ Found ${requests.length} service requests`)

  const payments = []
  const paymentMethods = ['card', 'gcash', 'paymaya', 'cash', 'bank_transfer']
  const paymentGateways = ['paymongo', 'gcash', 'paymaya', null]
  const statuses = ['pending', 'processing', 'completed', 'completed', 'completed']

  for (let i = 0; i < requests.length; i++) {
    const request = requests[i]
    const amount = request.final_price || (Math.floor(Math.random() * 5000) + 500)
    const platformFee = amount * 0.10 // 10% platform fee
    const providerAmount = amount - platformFee
    const method = paymentMethods[i % paymentMethods.length]
    const gateway = paymentGateways[i % paymentGateways.length]
    const status = statuses[i % statuses.length]

    payments.push({
      request_id: request.id,
      customer_id: request.customer_id,
      provider_id: request.provider_id,
      amount: amount,
      platform_fee: platformFee,
      provider_amount: providerAmount,
      payment_method: method,
      payment_gateway: gateway,
      transaction_id: `TXN${Date.now()}${i}`,
      status: status,
      processed_at: status === 'completed' ? new Date().toISOString() : null,
      payment_verification_required: method === 'cash',
      verification_status: method === 'cash' ? 'pending' : 'not_required',
      payment_details: {
        service_title: request.title,
        payment_date: new Date().toISOString(),
        method: method
      }
    })
  }

  console.log(`\n💳 Creating ${payments.length} sample payments...`)

  const { data: insertedPayments, error: insertError } = await supabase
    .from('payments')
    .insert(payments)
    .select()

  if (insertError) {
    console.error('❌ Error inserting payments:', insertError)
    return
  }

  console.log(`\n✅ Successfully created ${insertedPayments.length} payments!`)
  
  // Display summary
  console.log('\n📊 Payment Summary:')
  insertedPayments.forEach((payment, idx) => {
    console.log(`\n${idx + 1}. Transaction ID: ${payment.transaction_id}`)
    console.log(`   Amount: ₱${payment.amount}`)
    console.log(`   Platform Fee: ₱${payment.platform_fee}`)
    console.log(`   Provider Amount: ₱${payment.provider_amount}`)
    console.log(`   Method: ${payment.payment_method}`)
    console.log(`   Gateway: ${payment.payment_gateway || 'N/A'}`)
    console.log(`   Status: ${payment.status}`)
  })

  // Calculate totals
  const totalRevenue = insertedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const totalFees = insertedPayments.reduce((sum, p) => sum + parseFloat(p.platform_fee), 0)
  const totalProvider = insertedPayments.reduce((sum, p) => sum + parseFloat(p.provider_amount), 0)

  console.log('\n💰 Totals:')
  console.log(`   Total Revenue: ₱${totalRevenue.toFixed(2)}`)
  console.log(`   Total Platform Fees: ₱${totalFees.toFixed(2)}`)
  console.log(`   Total Provider Amount: ₱${totalProvider.toFixed(2)}`)

  console.log('\n✨ Done! Refresh your admin payments page to see the data.')
}

createSamplePayments()
