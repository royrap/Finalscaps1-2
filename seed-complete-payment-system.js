const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://olxquclxgtrbyxfxxscj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHF1Y2x4Z3RyYnl4Znh4c2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MTQ3OTksImV4cCI6MjA2NDQ5MDc5OX0.8cZ6-Y5e1E8KK4znvQAzI6RkX3XMfgdgPyVAVj2hfh0'
const supabase = createClient(supabaseUrl, supabaseKey)

async function seedCompletePaymentSystem() {
  console.log('🚀 Seeding complete payment system...\n')

  try {
    // Check existing data
    console.log('🔍 Checking existing data...')
    
    const { data: customers } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .eq('user_type', 'customer')
      .limit(3)

    const { data: providers } = await supabase
      .from('service_providers')
      .select('id, user_id')
      .limit(3)

    const { data: categories } = await supabase
      .from('service_categories')
      .select('id, name')
      .limit(5)

    console.log(`   Found ${customers?.length || 0} customers`)
    console.log(`   Found ${providers?.length || 0} providers`)
    console.log(`   Found ${categories?.length || 0} service categories\n`)

    if (!customers || customers.length === 0) {
      console.log('❌ No customers found. Please ensure you have users in the database.')
      return
    }

    if (!providers || providers.length === 0) {
      console.log('❌ No service providers found. Please ensure you have providers in the database.')
      return
    }

    if (!categories || categories.length === 0) {
      console.log('❌ No service categories found. Please ensure you have categories in the database.')
      return
    }

    // Create service requests
    console.log('📝 Creating service requests...')
    const serviceRequests = []
    const services = [
      { title: 'Engine Oil Change', desc: 'Regular maintenance oil change needed', price: 1500 },
      { title: 'Brake Pad Replacement', desc: 'Front brake pads making noise', price: 3500 },
      { title: 'Battery Replacement', desc: 'Car battery not holding charge', price: 4500 },
      { title: 'Tire Rotation', desc: 'Regular tire rotation service', price: 800 },
      { title: 'AC System Repair', desc: 'Air conditioning not cooling properly', price: 5500 },
      { title: 'Transmission Fluid Change', desc: 'Scheduled transmission service', price: 2500 },
      { title: 'Wheel Alignment', desc: 'Car pulling to the right', price: 1200 },
      { title: 'Spark Plug Replacement', desc: 'Engine misfiring', price: 2000 },
    ]

    for (let i = 0; i < Math.min(services.length, 8); i++) {
      const customer = customers[i % customers.length]
      const provider = providers[i % providers.length]
      const category = categories[i % categories.length]
      const service = services[i]

      serviceRequests.push({
        customer_id: customer.id,
        provider_id: provider.id,
        category_id: category.id,
        title: service.title,
        description: service.desc,
        status: i < 5 ? 'completed' : 'in_progress',
        final_price: service.price,
        estimated_price: service.price,
        pickup_latitude: 14.5995 + (Math.random() - 0.5) * 0.1,
        pickup_longitude: 120.9842 + (Math.random() - 0.5) * 0.1,
        pickup_address: 'Sample Address, Manila, Philippines',
        service_completion_time: i < 5 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    const { data: insertedRequests, error: requestError } = await supabase
      .from('service_requests')
      .insert(serviceRequests)
      .select()

    if (requestError) {
      console.error('❌ Error creating service requests:', requestError)
      return
    }

    console.log(`✅ Created ${insertedRequests.length} service requests\n`)

    // Create payments for completed requests
    console.log('💳 Creating payments...')
    const payments = []
    const paymentMethods = ['gcash', 'paymongo', 'cash', 'paymaya', 'bank_transfer']
    const paymentGateways = ['paymongo', 'gcash', 'paymaya', 'paymongo', null]
    const statuses = ['completed', 'completed', 'pending', 'completed', 'processing']

    const completedRequests = insertedRequests.filter(r => r.status === 'completed')
    
    for (let i = 0; i < completedRequests.length; i++) {
      const request = completedRequests[i]
      const amount = request.final_price
      const platformFee = parseFloat((amount * 0.10).toFixed(2))
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
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        payment_verification_required: method === 'cash',
        verification_status: method === 'cash' ? 'pending' : 'not_required',
        payment_details: {
          service_title: request.title,
          payment_date: new Date().toISOString(),
          method: method
        }
      })
    }

    if (payments.length === 0) {
      console.log('⚠️  No completed requests found, creating payments for all requests anyway...')
      
      for (let i = 0; i < insertedRequests.length; i++) {
        const request = insertedRequests[i]
        const amount = request.final_price || request.estimated_price
        const platformFee = parseFloat((amount * 0.10).toFixed(2))
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
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          payment_verification_required: method === 'cash',
          verification_status: method === 'cash' ? 'pending' : 'not_required',
          payment_details: {
            service_title: request.title,
            payment_date: new Date().toISOString(),
            method: method
          }
        })
      }
    }

    const { data: insertedPayments, error: paymentError } = await supabase
      .from('payments')
      .insert(payments)
      .select()

    if (paymentError) {
      console.error('❌ Error creating payments:', paymentError)
      console.error('Details:', JSON.stringify(paymentError, null, 2))
      return
    }

    console.log(`✅ Created ${insertedPayments.length} payments\n`)

    // Calculate and display summary
    const totalRevenue = insertedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    const totalFees = insertedPayments.reduce((sum, p) => sum + parseFloat(p.platform_fee), 0)
    const totalProvider = insertedPayments.reduce((sum, p) => sum + parseFloat(p.provider_amount), 0)
    const completedCount = insertedPayments.filter(p => p.status === 'completed').length
    const pendingCount = insertedPayments.filter(p => p.status === 'pending').length

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('💰 PAYMENT SYSTEM SUMMARY')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log(`📈 Total Revenue:        ₱${totalRevenue.toLocaleString('en-PH', {minimumFractionDigits: 2})}`)
    console.log(`🏦 Platform Fees:        ₱${totalFees.toLocaleString('en-PH', {minimumFractionDigits: 2})} (${((totalFees/totalRevenue)*100).toFixed(1)}%)`)
    console.log(`👨‍🔧 Provider Earnings:    ₱${totalProvider.toLocaleString('en-PH', {minimumFractionDigits: 2})}`)
    console.log(`\n📊 Payment Status:`)
    console.log(`   ✅ Completed: ${completedCount}`)
    console.log(`   ⏳ Pending: ${pendingCount}`)
    console.log(`   🔄 Processing: ${insertedPayments.length - completedCount - pendingCount}`)
    console.log(`   📊 Total: ${insertedPayments.length}`)
    console.log(`   💵 Average: ₱${(totalRevenue / insertedPayments.length).toLocaleString('en-PH', {minimumFractionDigits: 2})}`)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n✨ Done! Visit your payment dashboard at:')
    console.log('🌐 https://road-aid-system-tsyx.vercel.app/admin/payments')
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error) {
    console.error('\n❌ Unexpected error:', error)
  }
}

seedCompletePaymentSystem()
