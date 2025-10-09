"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowUpDown, Download, Search, Filter, Eye, DollarSign, TrendingUp, CreditCard, PiggyBank } from "lucide-react"
import RoleGuard from "@/components/RoleGuard"
import AdminNavigation from "@/components/AdminNavigation"

interface Payment {
  id: string
  amount: number
  platform_fee: number
  provider_amount: number
  payment_method: string
  payment_gateway: string
  transaction_id: string
  status: string
  processed_at: string
  created_at: string
  customer: {
    first_name: string
    last_name: string
    email: string
  }
  provider: {
    company_name: string
    user_id: {
      first_name: string
      last_name: string
    }
  }
  request: {
    title: string
    description: string
  }
}

interface PaymentStats {
  total_revenue: number
  total_fees: number
  total_payments: number
  pending_payments: number
  completed_payments: number
  average_payment: number
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    total_revenue: 0,
    total_fees: 0,
    total_payments: 0,
    pending_payments: 0,
    completed_payments: 0,
    average_payment: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPayments()
    fetchPaymentStats()
  }, [])

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          customer:customer_id (
            first_name,
            last_name,
            email
          ),
          provider:provider_id (
            company_name,
            user_id (
              first_name,
              last_name
            )
          ),
          request:request_id (
            title,
            description
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPayments(data || [])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentStats = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('amount, platform_fee, status')

      if (error) throw error

      const stats = data.reduce((acc, payment) => {
        acc.total_revenue += payment.amount || 0
        acc.total_fees += payment.platform_fee || 0
        acc.total_payments += 1
        
        if (payment.status === 'pending') {
          acc.pending_payments += 1
        } else if (payment.status === 'completed') {
          acc.completed_payments += 1
        }
        
        return acc
      }, {
        total_revenue: 0,
        total_fees: 0,
        total_payments: 0,
        pending_payments: 0,
        completed_payments: 0,
        average_payment: 0
      })

      stats.average_payment = stats.total_payments > 0 ? stats.total_revenue / stats.total_payments : 0
      setStats(stats)
    } catch (error: any) {
      console.error('Error fetching payment stats:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === "" || 
      payment.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesMethod = methodFilter === "all" || payment.payment_method === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading payments...</p>
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
            <h1 className="text-3xl font-bold">Payment Management</h1>
            <p className="text-gray-600">Monitor payments, transactions, and financial analytics</p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">₱{stats.total_revenue.toLocaleString()}</p>
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
                  <p className="text-sm font-medium text-gray-600">Platform Fees</p>
                  <p className="text-2xl font-bold">₱{stats.total_fees.toLocaleString()}</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold">{stats.total_payments}</p>
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
                  <p className="text-sm font-medium text-gray-600">Average Payment</p>
                  <p className="text-2xl font-bold">₱{stats.average_payment.toFixed(2)}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by customer name, email, or transaction ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="paymaya">PayMaya</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Platform Fee</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">
                        {payment.transaction_id || payment.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payment.customer?.first_name} {payment.customer?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.customer?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payment.provider?.user_id?.first_name} {payment.provider?.user_id?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.provider?.company_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.request?.title}</div>
                          <div className="text-sm text-gray-500 max-w-40 truncate">
                            {payment.request?.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₱{payment.amount?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        ₱{payment.platform_fee?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {payment.payment_method || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPayments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        No payments found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
