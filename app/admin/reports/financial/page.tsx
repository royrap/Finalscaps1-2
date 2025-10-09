"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Download,
  RefreshCw,
  CreditCard,
  PiggyBank
} from "lucide-react"

interface FinancialMetrics {
  totalRevenue: number
  platformEarnings: number
  totalTransactions: number
  averageTransactionValue: number
  monthlyGrowth: number
  topPaymentMethod: string
  pendingPayouts: number
  completedPayouts: number
  refunds: number
  chargebacks: number
}

interface MonthlyData {
  month: string
  revenue: number
  transactions: number
  platformFees: number
}

export default function FinancialReportsPage() {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    platformEarnings: 0,
    totalTransactions: 0,
    averageTransactionValue: 0,
    monthlyGrowth: 0,
    topPaymentMethod: 'GCash',
    pendingPayouts: 0,
    completedPayouts: 0,
    refunds: 0,
    chargebacks: 0
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("30")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchFinancialData()
  }, [dateRange])

  const fetchFinancialData = async () => {
    setLoading(true)
    try {
      // Fetch payment data
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .gte('created_at', new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString())

      if (paymentsError) throw paymentsError

      // Calculate metrics
      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
      const platformEarnings = payments?.reduce((sum, p) => sum + (p.platform_fee || 0), 0) || 0
      const totalTransactions = payments?.length || 0
      const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

      // Fetch payout data
      const { data: payouts } = await supabase
        .from('payment_releases')
        .select('*')
        .gte('created_at', new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString())

      const pendingPayouts = payouts?.filter(p => p.release_status === 'pending').length || 0
      const completedPayouts = payouts?.filter(p => p.release_status === 'released').length || 0

      // Generate monthly data (mock for now)
      const monthly: MonthlyData[] = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        monthly.push({
          month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
          revenue: Math.floor(Math.random() * 50000) + 20000,
          transactions: Math.floor(Math.random() * 100) + 50,
          platformFees: Math.floor(Math.random() * 5000) + 2000
        })
      }

      setMetrics({
        totalRevenue,
        platformEarnings,
        totalTransactions,
        averageTransactionValue,
        monthlyGrowth: 12.5,
        topPaymentMethod: 'GCash',
        pendingPayouts,
        completedPayouts,
        refunds: Math.floor(Math.random() * 10),
        chargebacks: Math.floor(Math.random() * 3)
      })
      setMonthlyData(monthly)
    } catch (error: any) {
      setError(error.message)
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    const csvContent = [
      'Financial Report - ' + new Date().toLocaleDateString(),
      '',
      'Summary Metrics',
      'Total Revenue,₱' + metrics.totalRevenue.toLocaleString(),
      'Platform Earnings,₱' + metrics.platformEarnings.toLocaleString(),
      'Total Transactions,' + metrics.totalTransactions,
      'Average Transaction,₱' + metrics.averageTransactionValue.toFixed(2),
      'Pending Payouts,' + metrics.pendingPayouts,
      'Completed Payouts,' + metrics.completedPayouts,
      '',
      'Monthly Breakdown',
      'Month,Revenue,Transactions,Platform Fees',
      ...monthlyData.map(m => `${m.month},₱${m.revenue},${m.transactions},₱${m.platformFees}`)
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-gray-600">Comprehensive financial analytics and reporting</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
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
          <Button variant="outline" onClick={fetchFinancialData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">₱{metrics.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-sm text-green-600">+{metrics.monthlyGrowth}%</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Earnings</p>
                <p className="text-2xl font-bold">₱{metrics.platformEarnings.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {((metrics.platformEarnings / metrics.totalRevenue) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <PiggyBank className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{metrics.totalTransactions}</p>
                <p className="text-xs text-gray-500">
                  Avg: ₱{metrics.averageTransactionValue.toFixed(2)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold">{metrics.pendingPayouts}</p>
                <p className="text-xs text-gray-500">
                  Completed: {metrics.completedPayouts}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Revenue Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transaction Details</TabsTrigger>
          <TabsTrigger value="payouts">Payout Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
              <CardDescription>Revenue and transaction volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Platform Fees</TableHead>
                    <TableHead>Avg Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map((month) => (
                    <TableRow key={month.month}>
                      <TableCell className="font-medium">{month.month}</TableCell>
                      <TableCell>₱{month.revenue.toLocaleString()}</TableCell>
                      <TableCell>{month.transactions}</TableCell>
                      <TableCell>₱{month.platformFees.toLocaleString()}</TableCell>
                      <TableCell>₱{(month.revenue / month.transactions).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>GCash</span>
                    <Badge>45%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>PayMaya</span>
                    <Badge>30%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cash</span>
                    <Badge>15%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bank Transfer</span>
                    <Badge>10%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Completed</span>
                    <Badge className="bg-green-100 text-green-800">85%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pending</span>
                    <Badge className="bg-yellow-100 text-yellow-800">10%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Failed</span>
                    <Badge className="bg-red-100 text-red-800">3%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Refunded</span>
                    <Badge className="bg-gray-100 text-gray-800">2%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Refund Rate</span>
                    <Badge variant="outline">2.1%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Chargeback Rate</span>
                    <Badge variant="outline">0.3%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dispute Rate</span>
                    <Badge variant="outline">0.8%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Success Rate</span>
                    <Badge className="bg-green-100 text-green-800">96.8%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payout Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Total Payouts Pending</span>
                    <Badge variant="outline">{metrics.pendingPayouts}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Total Payouts Released</span>
                    <Badge className="bg-green-100 text-green-800">{metrics.completedPayouts}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Average Processing Time</span>
                    <Badge variant="outline">24 hours</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => window.location.href = '/admin/payments'}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Payments
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export Payout Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Payment Gateways
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}