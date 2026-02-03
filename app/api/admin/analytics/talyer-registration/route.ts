import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { analyzeTalyerRegistrations, generatePredictions } from '@/lib/gemini'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || 'all' // weekly, monthly, yearly, all

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['super_admin', 'admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate date filter based on range
    let dateFilter = new Date('2020-01-01') // Default: all time
    const now = new Date()

    switch (timeRange) {
      case 'weekly':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'yearly':
        dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
    }

    // Fetch shops data with owner information
    const { data: shops, error: shopsError } = await supabase
      .from('shops')
      .select(
        `
        id,
        shop_name,
        shop_address,
        latitude,
        longitude,
        created_at,
        owner_id,
        user_profiles!shops_owner_id_fkey (
          first_name,
          last_name,
          email
        )
      `
      )
      .gte('created_at', dateFilter.toISOString())
      .order('created_at', { ascending: true })

    if (shopsError) {
      console.error('Error fetching shops:', shopsError)
      return NextResponse.json({ error: 'Failed to fetch shops data' }, { status: 500 })
    }

    if (!shops || shops.length === 0) {
      return NextResponse.json({
        totalShops: 0,
        shops: [],
        analytics: {
          topBarangays: [],
          monthlyTrends: [],
          predictions: [],
          growthAreas: [],
          summary: 'No shop data available for the selected time range.',
        },
        predictions: [],
      })
    }

    // Parse addresses to extract barangay, city, province
    const shopsWithLocations = shops.map((shop: any) => {
      const address = shop.shop_address || ''
      const parts = address.split(',').map((p: string) => p.trim())

      return {
        shop_name: shop.shop_name,
        date_registered: shop.created_at,
        barangay: parts[0] || 'Unknown',
        city: parts[parts.length - 2] || 'Unknown',
        province: parts[parts.length - 1] || 'Unknown',
        latitude: shop.latitude,
        longitude: shop.longitude,
      }
    })

    // Use Gemini AI to analyze the data
    console.log('Analyzing', shopsWithLocations.length, 'shops with Gemini AI...')
    const analytics = await analyzeTalyerRegistrations(shopsWithLocations)

    // Generate additional predictions
    const predictions = await generatePredictions(analytics.monthlyTrends)

    return NextResponse.json({
      totalShops: shops.length,
      shops: shopsWithLocations,
      analytics,
      predictions,
      timeRange,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate analytics',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
