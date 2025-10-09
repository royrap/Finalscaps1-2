"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Car, 
  DollarSign, 
  Calendar,
  MapPin,
  Clock,
  Star,
  FileText,
  Download,
  RefreshCw
} from "lucide-react"
import RoleGuard from "@/components/RoleGuard"
import AdminNavigation from "@/components/AdminNavigation"

interface AnalyticsData {
  totalUsers: number
  totalProviders: number
  totalRequests: number
  totalRevenue: number
  activeUsers: number
  averageRating: number
  completionRate: number
  responseTime: number
  userGrowth: number
  revenueGrowth: number
  requestGrowth: number
  providerGrowth: number
}

interface RequestsByStatus {
  status: string
  count: number
  percentage: number
}

interface RevenueByMonth {
  month: string
  revenue: number
  requests: number
}

interface TopProviders {
  id: string
  name: string
  company: string
  rating: number
  completed_requests: number
  total_revenue: number
}

interface ServiceCategories {
  category: string
  count: number
  percentage: number
  revenue: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalProviders: 0,
    totalRequests: 0,
    totalRevenue: 0,
    activeUsers: 0,
    averageRating: 0,
    completionRate: 0,
    responseTime: 0,
    userGrowth: 0,
    revenueGrowth: 0,
    requestGrowth: 0,
    providerGrowth: 0
  })
  const [requestsByStatus, setRequestsByStatus] = useState<RequestsByStatus[]>([])
  const [revenueByMonth, setRevenueByMonth] = useState<RevenueByMonth[]>([])
  const [topProviders, setTopProviders] = useState<TopProviders[]>([])
  const [serviceCategories, setServiceCategories] = useState<ServiceCategories[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchOverviewStats(),
        fetchRequestsByStatus(),
        fetchRevenueByMonth(),
        fetchTopProviders(),
        fetchServiceCategories()
      ])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchOverviewStats = async () => {
    try {
      // Total users
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      // Total providers
      const { count: totalProviders } = await supabase
        .from('service_providers')
        .select('*', { count: 'exact', head: true })

      // Total requests
      const { count: totalRequests } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })

      // Total revenue
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')

      const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

      // Active users (logged in within last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { count: activeUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_login_at', thirtyDaysAgo.toISOString())

      // Average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')

      const averageRating = reviews?.length 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0

      // Completion rate
      const { count: completedRequests } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      const completionRate = totalRequests ? (completedRequests || 0) / totalRequests * 100 : 0

      // Average response time (placeholder calculation)
      const responseTime = 45 // minutes - would need proper calculation

      setAnalytics({
        totalUsers: totalUsers || 0,
        totalProviders: totalProviders || 0,
        totalRequests: totalRequests || 0,
        totalRevenue,
        activeUsers: activeUsers || 0,
        averageRating,
        completionRate,
        responseTime,
        userGrowth: 12.5, // placeholder - would need historical data
        revenueGrowth: 18.3,
        requestGrowth: 15.7,
        providerGrowth: 8.2
      })
    } catch (error: any) {
      console.error('Error fetching overview stats:', error)
    }
  }

  const fetchRequestsByStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('status')

      if (error) throw error

      const statusCounts = data.reduce((acc, request) => {
        acc[request.status] = (acc[request.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const total = data.length
      const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.replace('_', ' ').toUpperCase(),
        count,
        percentage: total ? (count / total) * 100 : 0
      }))

      setRequestsByStatus(statusData)
    } catch (error: any) {
      console.error('Error fetching requests by status:', error)
    }
  }

  const fetchRevenueByMonth = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString())

      if (error) throw error

      const monthlyData: Record<string, { revenue: number; requests: number }> = {}
      
      data.forEach(payment => {
        const month = new Date(payment.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        })
        
        if (!monthlyData[month]) {
          monthlyData[month] = { revenue: 0, requests: 0 }
        }
        
        monthlyData[month].revenue += payment.amount || 0
        monthlyData[month].requests += 1
      })

      const revenueData = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        requests: data.requests
      }))

      setRevenueByMonth(revenueData)
    } catch (error: any) {
      console.error('Error fetching revenue by month:', error)
    }
  }

  const fetchTopProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select(`
          id,
          company_name,
          rating,
          user_id (
            first_name,
            last_name
          )
        `)
        .order('rating', { ascending: false })
        .limit(5)

      if (error) throw error

      // For each provider, get completed requests count and revenue
      const providersWithStats = await Promise.all(
        data.map(async (provider) => {
          const { count: completedRequests } = await supabase
            .from('service_requests')
            .select('*', { count: 'exact', head: true })
            .eq('provider_id', provider.id)
            .eq('status', 'completed')

          const { data: payments } = await supabase
            .from('payments')
            .select('provider_amount')
            .eq('provider_id', provider.id)
            .eq('status', 'completed')

          const totalRevenue = payments?.reduce((sum, payment) => 
            sum + (payment.provider_amount || 0), 0) || 0

          return {
            id: provider.id,
            name: Array.isArray(provider.user_id) 
              ? `${provider.user_id[0]?.first_name || ''} ${provider.user_id[0]?.last_name || ''}`.trim()
              : `${(provider.user_id as any)?.first_name || ''} ${(provider.user_id as any)?.last_name || ''}`.trim(),
            company: provider.company_name || 'Independent',
            rating: provider.rating || 0,
            completed_requests: completedRequests || 0,
            total_revenue: totalRevenue
          }
        })
      )

      setTopProviders(providersWithStats)
    } catch (error: any) {
      console.error('Error fetching top providers:', error)
    }
  }

  const fetchServiceCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          category_id,
          final_price,
          service_categories (
            name
          )
        `)

      if (error) throw error

      const categoryStats: Record<string, { count: number; revenue: number }> = {}
      
      data.forEach(request => {
        let categoryName = 'Unknown'
        
        if (Array.isArray(request.service_categories)) {
          categoryName = request.service_categories[0]?.name || 'Unknown'
        } else if (request.service_categories && typeof request.service_categories === 'object') {
          categoryName = (request.service_categories as any).name || 'Unknown'
        }
        
        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = { count: 0, revenue: 0 }
        }
        
        categoryStats[categoryName].count += 1
        categoryStats[categoryName].revenue += request.final_price || 0
      })

      const total = data.length
      const categoryData = Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        count: stats.count,
        percentage: total ? (stats.count / total) * 100 : 0,
        revenue: stats.revenue
      }))

      setServiceCategories(categoryData.sort((a, b) => b.count - a.count))
    } catch (error: any) {
      console.error('Error fetching service categories:', error)
    }
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['admin', 'super_admin']}>
      <AdminNavigation />
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-600">Business insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchAnalytics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    {(() => {
                      const GrowthIcon = getGrowthIcon(analytics.userGrowth)
                      return (
                        <>
                          <GrowthIcon className={`h-4 w-4 mr-1 ${getGrowthColor(analytics.userGrowth)}`} />
                          <span className={`text-sm ${getGrowthColor(analytics.userGrowth)}`}>
                            {analytics.userGrowth}%
                          </span>
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Service Providers</p>
                  <p className="text-2xl font-bold">{analytics.totalProviders.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    {(() => {
                      const GrowthIcon = getGrowthIcon(analytics.providerGrowth)
                      return (
                        <>
                          <GrowthIcon className={`h-4 w-4 mr-1 ${getGrowthColor(analytics.providerGrowth)}`} />
                          <span className={`text-sm ${getGrowthColor(analytics.providerGrowth)}`}>
                            {analytics.providerGrowth}%
                          </span>
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Car className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">₱{analytics.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    {(() => {
                      const GrowthIcon = getGrowthIcon(analytics.revenueGrowth)
                      return (
                        <>
                          <GrowthIcon className={`h-4 w-4 mr-1 ${getGrowthColor(analytics.revenueGrowth)}`} />
                          <span className={`text-sm ${getGrowthColor(analytics.revenueGrowth)}`}>
                            {analytics.revenueGrowth}%
                          </span>
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Service Requests</p>
                  <p className="text-2xl font-bold">{analytics.totalRequests.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    {(() => {
                      const GrowthIcon = getGrowthIcon(analytics.requestGrowth)
                      return (
                        <>
                          <GrowthIcon className={`h-4 w-4 mr-1 ${getGrowthColor(analytics.requestGrowth)}`} />
                          <span className={`text-sm ${getGrowthColor(analytics.requestGrowth)}`}>
                            {analytics.requestGrowth}%
                          </span>
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Active Users</span>
                    </div>
                    <Badge>{analytics.activeUsers}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Average Rating</span>
                    </div>
                    <Badge>{analytics.averageRating.toFixed(1)}/5.0</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span>Completion Rate</span>
                    </div>
                    <Badge>{analytics.completionRate.toFixed(1)}%</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>Avg Response Time</span>
                    </div>
                    <Badge>{analytics.responseTime} min</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Service Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Popular Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {serviceCategories.slice(0, 5).map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                            {index + 1}
                          </div>
                          <span className="font-medium">{category.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{category.count}</div>
                          <div className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requestsByStatus.map(status => (
                    <div key={status.status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{status.status}</span>
                        <span className="text-sm text-gray-500">{status.count} ({status.percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={status.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProviders.map((provider, index) => (
                    <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{provider.name}</div>
                          <div className="text-sm text-gray-500">{provider.company}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{provider.rating.toFixed(1)}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {provider.completed_requests} jobs • ₱{provider.total_revenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueByMonth.map(month => (
                    <div key={month.month} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">{month.month}</div>
                        <div className="text-sm text-gray-500">{month.requests} requests</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">₱{month.revenue.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">
                          ₱{(month.revenue / month.requests).toFixed(0)} avg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  )
}
