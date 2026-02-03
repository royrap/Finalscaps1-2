const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://olxquclxgtrbyxfxxscj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHF1Y2x4Z3RyYnl4Znh4c2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MTQ3OTksImV4cCI6MjA2NDQ5MDc5OX0.8cZ6-Y5e1E8KK4znvQAzI6RkX3XMfgdgPyVAVj2hfh0'
const supabase = createClient(supabaseUrl, supabaseKey)

async function createCompletePaymentData() {
  console.log('🚀 Starting complete payment data creation...\n')

  try {
    // Check if there are existing service requests with completed status
    const { data: existingRequests, error: checkError } = await supabase
      .from('service_requests')
      .select(`
        id, 
        customer_id, 
        provider_id, 
        final_price, 
        title,
        status
      `)
      .eq('status', 'completed')
      .not('provider_id', 'is', null)
      .not('customer_id', 'is', null)
      .limit(10)

    if (checkError) {
      console.error('❌ Error checking requests:', checkError)
      return
    }

    let requests = existingRequests || []
    console.log(`📋 Found ${requests.length} completed service requests\n`)

    if (requests.length === 0) {
      console.log('⚠️  No completed service requests found.')
      console.log('📝 Looking for ANY service requests with providers...\n')

      const { data: anyRequests, error: anyError } = await supabase
        .from('service_requests')
        .select(`
          id, 
          customer_id, 
          provider_id, 
          final_price, 
          estimated_price,
          title,
          status
        `)
        .not('provider_id', 'is', null)
        .not('customer_id', 'is', null)
        .limit(10)

      if (anyError) {
        console.error('❌ Error:', anyError)
        return
      }

      requests = anyRequests || []
      console.log(`📋 Found ${requests.length} service requests with providers\n`)
    }

    if (requests.length === 0) {
      console.log('❌ No service requests found with both customer and provider.')
      console.log('💡 Please create some service requests first, or run the service request seeder.')
      return
    }

    // Create payments for each request
    const payments = []
    const paymentMethods = ['gcash', 'paymongo', 'cash', 'paymaya', 'bank_transfer']
    const paymentGateways = ['paymongo', 'gcash', 'paymaya', 'paymongo', null]
    const statuses = ['completed', 'completed', 'pending', 'completed', 'processing']

    for (let i = 0; i < requests.length; i++) {
      const request = requests[i]
      const amount = request.final_price || request.estimated_price || (Math.floor(Math.random() * 5000) + 500)
      const platformFee = parseFloat((amount * 0.10).toFixed(2)) // 10% platform fee
      const providerAmount = parseFloat((amount - platformFee).toFixed(2))
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
        transaction_id: `TXN${Date.now()}${String(i).padStart(3, '0')}`,
        status: status,
        processed_at: status === 'completed' ? new Date().toISOString() : null,
        payment_verification_required: method === 'cash',
        verification_status: method === 'cash' ? 'pending' : 'not_required',
        payment_details: {
          service_title: request.title,
          payment_date: new Date().toISOString(),
          method: method,
          request_status: request.status
        }
      })
    }

    console.log(`💳 Creating ${payments.length} sample payments...\n`)

    const { data: insertedPayments, error: insertError } = await supabase
      .from('payments')
      .insert(payments)
      .select()

    if (insertError) {
      console.error('❌ Error inserting payments:', insertError)
      console.error('Details:', JSON.stringify(insertError, null, 2))
      return
    }

    console.log(`✅ Successfully created ${insertedPayments.length} payments!\n`)
    
    // Display summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 PAYMENT SUMMARY')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    insertedPayments.forEach((payment, idx) => {
      console.log(`${idx + 1}. Transaction: ${payment.transaction_id}`)
      console.log(`   💰 Amount: ₱${parseFloat(payment.amount).toLocaleString('en-PH', {minimumFractionDigits: 2})}`)
      console.log(`   🏦 Platform Fee: ₱${parseFloat(payment.platform_fee).toLocaleString('en-PH', {minimumFractionDigits: 2})}`)
      console.log(`   👨‍🔧 Provider Gets: ₱${parseFloat(payment.provider_amount).toLocaleString('en-PH', {minimumFractionDigits: 2})}`)
      console.log(`   💳 Method: ${payment.payment_method}`)
      console.log(`   🌐 Gateway: ${payment.payment_gateway || 'N/A'}`)
      console.log(`   📊 Status: ${payment.status}`)
      console.log('')
    })

    // Calculate totals
    const totalRevenue = insertedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    const totalFees = insertedPayments.reduce((sum, p) => sum + parseFloat(p.platform_fee), 0)
    const totalProvider = insertedPayments.reduce((sum, p) => sum + parseFloat(p.provider_amount), 0)
    const completedCount = insertedPayments.filter(p => p.status === 'completed').length
    const pendingCount = insertedPayments.filter(p => p.status === 'pending').length

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('💰 FINANCIAL SUMMARY')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log(`📈 Total Revenue:        ₱${totalRevenue.toLocaleString('en-PH', {minimumFractionDigits: 2})}`)
    console.log(`🏦 Platform Fees:        ₱${totalFees.toLocaleString('en-PH', {minimumFractionDigits: 2})} (${((totalFees/totalRevenue)*100).toFixed(1)}%)`)
    console.log(`👨‍🔧 Provider Earnings:    ₱${totalProvider.toLocaleString('en-PH', {minimumFractionDigits: 2})}`)
    console.log(`\n📊 Payment Status:`)
    console.log(`   ✅ Completed: ${completedCount}`)
    console.log(`   ⏳ Pending: ${pendingCount}`)
    console.log(`   🔄 Processing: ${insertedPayments.length - completedCount - pendingCount}`)
    console.log(`   📊 Total Payments: ${insertedPayments.length}`)
    console.log(`   💵 Average Payment: ₱${(totalRevenue / insertedPayments.length).toLocaleString('en-PH', {minimumFractionDigits: 2})}`)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n✨ Done! Visit your admin dashboard at:')
    console.log('🌐 https://road-aid-system-tsyx.vercel.app/admin/payments')
    console.log('\nOr locally at:')
    console.log('🏠 http://localhost:3000/admin/payments')
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error) {
    console.error('\n❌ Unexpected error:', error)
  }
}

createCompletePaymentData()
