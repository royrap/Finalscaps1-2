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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowUpDown, Download, Search, Filter, Eye, DollarSign, TrendingUp, CreditCard, PiggyBank } from "lucide-react"

interface Payment {
  // Exact columns from payments table
  id: string
  request_id: string
  customer_id: string
  provider_id: string
  amount: number
  platform_fee: number | null
  provider_amount: number
  payment_method: string | null
  payment_gateway: string | null
  transaction_id: string | null
  status: string
  processed_at: string | null
  created_at: string
  invoice_id: string | null
  payment_details: any | null
  payment_verification_required: boolean | null
  verification_status: string | null
  
  // Joined data
  customer?: {
    first_name: string
    last_name: string
    email: string
    phone_number: string
  }
  provider?: {
    company_name: string
    user_profiles?: {
      first_name: string
      last_name: string
    }
  }
  request?: {
    title: string
    description: string
    status: string
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

export default function AdminPaymentsPage() {
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
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPayments()
    fetchPaymentStats()
  }, [])

  const fetchPayments = async () => {
    try {
      // First get basic payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })

      if (paymentsError) throw paymentsError

      if (!paymentsData || paymentsData.length === 0) {
        setPayments([])
        setLoading(false)
        return
      }

      // Get related data separately
      const customerIds = [...new Set(paymentsData.map(p => p.customer_id))]
      const providerIds = [...new Set(paymentsData.map(p => p.provider_id))]
      const requestIds = [...new Set(paymentsData.map(p => p.request_id))]

      // Fetch customers
      const { data: customers } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, phone_number')
        .in('id', customerIds)

      // Fetch providers with user profiles
      const { data: providers } = await supabase
        .from('service_providers')
        .select('id, company_name, user_id')
        .in('id', providerIds)

      const providerUserIds = providers?.map(p => p.user_id).filter(Boolean) || []
      const { data: providerUsers } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .in('id', providerUserIds)

      // Fetch service requests
      const { data: requests } = await supabase
        .from('service_requests')
        .select('id, title, description, status')
        .in('id', requestIds)

      // Map data to payments
      const enrichedPayments = paymentsData.map(payment => ({
        ...payment,
        customer: customers?.find(c => c.id === payment.customer_id),
        provider: (() => {
          const provider = providers?.find(p => p.id === payment.provider_id)
          if (!provider) return undefined
          return {
            company_name: provider.company_name,
            user_profiles: providerUsers?.find(u => u.id === provider.user_id)
          }
        })(),
        request: requests?.find(r => r.id === payment.request_id)
      }))

      setPayments(enrichedPayments)
      setError("")
    } catch (error: any) {
      console.error('Payment fetch error:', error)
      setError(error.message)
      // Fallback to basic query
      const { data: basicData } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (basicData) {
        setPayments(basicData)
      }
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

  const exportPaymentReport = async () => {
    try {
      // Generate CSV content
      const csvContent = [
        // Header
        ['Transaction ID', 'Customer', 'Provider', 'Amount', 'Platform Fee', 'Provider Amount', 'Method', 'Gateway', 'Status', 'Verification', 'Date'].join(','),
        // Data rows
        ...filteredPayments.map(payment => [
          payment.transaction_id || payment.id.slice(0, 8),
          `"${payment.customer?.first_name} ${payment.customer?.last_name}"`,
          `"${payment.provider?.user_profiles?.first_name} ${payment.provider?.user_profiles?.last_name}"`,
          payment.amount || 0,
          payment.platform_fee || 0,
          payment.provider_amount || 0,
          payment.payment_method || 'Unknown',
          payment.payment_gateway || 'N/A',
          payment.status,
          payment.verification_status || 'not_required',
          new Date(payment.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `payment_report_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting report:', error)
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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Payment Management</h1>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            Payment Management
          </h1>
          <p className="text-lg text-gray-600">Monitor payments, transactions, and financial analytics</p>
        </div>
        <Button onClick={() => exportPaymentReport()} className="admin-button px-6 py-3 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl">
          <Download className="h-5 w-5 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Database Error:</strong> {error}
            <br />
            <span className="text-sm">Some features may use demo data until resolved.</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="admin-stats-card border-0 shadow-xl hover:shadow-2xl smooth-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₱{stats.total_revenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+8.2% from last month</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-stats-card border-0 shadow-xl hover:shadow-2xl smooth-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">Platform Fees</p>
                <p className="text-3xl font-bold text-gray-900">₱{stats.total_fees.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <CreditCard className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600 font-medium">{((stats.total_fees / stats.total_revenue) * 100).toFixed(1)}% fee rate</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <PiggyBank className="h-6 w-6 text-white" />
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
                  <TableHead>Provider Amount</TableHead>
                  <TableHead>Method / Gateway</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
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
                          {payment.provider?.user_profiles?.first_name || 'N/A'} {payment.provider?.user_profiles?.last_name || ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.provider?.company_name || 'N/A'}
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
                    <TableCell className="text-sm text-orange-600">
                      ₱{payment.platform_fee?.toLocaleString() || '0.00'}
                    </TableCell>
                    <TableCell className="text-sm text-green-600">
                      ₱{payment.provider_amount?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge variant="outline" className="mb-1">
                          {payment.payment_method || 'Unknown'}
                        </Badge>
                        {payment.payment_gateway && (
                          <div className="text-xs text-gray-500">
                            via {payment.payment_gateway}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.payment_verification_required ? (
                        <Badge 
                          className={
                            payment.verification_status === 'verified' 
                              ? 'bg-green-100 text-green-800' 
                              : payment.verification_status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {payment.verification_status || 'pending'}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">Not Required</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{new Date(payment.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(payment.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(payment)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Payment Details</DialogTitle>
                            <DialogDescription>Complete information about this payment transaction</DialogDescription>
                          </DialogHeader>
                          {selectedPayment && (
                            <div className="space-y-6">
                              {/* Transaction Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-semibold mb-3 text-lg flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Transaction Info
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>Payment ID:</strong> 
                                      <span className="font-mono ml-2 text-xs">{selectedPayment.id}</span>
                                    </p>
                                    <p>
                                      <strong>Transaction ID:</strong> 
                                      <span className="font-mono ml-2">{selectedPayment.transaction_id || 'N/A'}</span>
                                    </p>
                                    <p>
                                      <strong>Request ID:</strong> 
                                      <span className="font-mono ml-2 text-xs">{selectedPayment.request_id}</span>
                                    </p>
                                    <p>
                                      <strong>Invoice ID:</strong> 
                                      <span className="font-mono ml-2 text-xs">{selectedPayment.invoice_id || 'N/A'}</span>
                                    </p>
                                    <p>
                                      <strong>Payment Gateway:</strong> {selectedPayment.payment_gateway || 'N/A'}
                                    </p>
                                    <p>
                                      <strong>Payment Method:</strong> {selectedPayment.payment_method || 'N/A'}
                                    </p>
                                    <p>
                                      <strong>Status:</strong>
                                      <Badge className={`ml-2 ${getStatusColor(selectedPayment.status)}`}>
                                        {selectedPayment.status}
                                      </Badge>
                                    </p>
                                    <p>
                                      <strong>Created:</strong> {new Date(selectedPayment.created_at).toLocaleString()}
                                    </p>
                                    <p>
                                      <strong>Processed:</strong> {selectedPayment.processed_at ? new Date(selectedPayment.processed_at).toLocaleString() : 'Not processed'}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-semibold mb-3 text-lg flex items-center">
                                    <DollarSign className="h-5 w-5 mr-2" />
                                    Amount Breakdown
                                  </h4>
                                  <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                      <strong>Total Amount:</strong>
                                      <span className="text-lg font-bold">₱{selectedPayment.amount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-orange-600">
                                      <strong>Platform Fee:</strong>
                                      <span className="font-semibold">₱{selectedPayment.platform_fee?.toLocaleString() || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-green-600 pt-2 border-t">
                                      <strong>Provider Amount:</strong>
                                      <span className="text-lg font-bold">₱{selectedPayment.provider_amount?.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Verification Status */}
                              {selectedPayment.payment_verification_required && (
                                <div className="border rounded-lg p-4 bg-yellow-50">
                                  <h4 className="font-semibold mb-3 text-lg">Payment Verification</h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>Verification Required:</strong> Yes
                                    </p>
                                    <p>
                                      <strong>Verification Status:</strong>
                                      <Badge 
                                        className={`ml-2 ${
                                          selectedPayment.verification_status === 'verified' 
                                            ? 'bg-green-100 text-green-800' 
                                            : selectedPayment.verification_status === 'rejected'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                      >
                                        {selectedPayment.verification_status || 'pending'}
                                      </Badge>
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Customer & Provider Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-semibold mb-3">Customer Info</h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>ID:</strong> 
                                      <span className="font-mono ml-2 text-xs">{selectedPayment.customer_id}</span>
                                    </p>
                                    <p>
                                      <strong>Name:</strong> {selectedPayment.customer?.first_name || 'N/A'}{" "}
                                      {selectedPayment.customer?.last_name || ''}
                                    </p>
                                    <p>
                                      <strong>Email:</strong> {selectedPayment.customer?.email || 'N/A'}
                                    </p>
                                    <p>
                                      <strong>Phone:</strong> {selectedPayment.customer?.phone_number || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-semibold mb-3">Provider Info</h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>ID:</strong> 
                                      <span className="font-mono ml-2 text-xs">{selectedPayment.provider_id}</span>
                                    </p>
                                    <p>
                                      <strong>Company:</strong> {selectedPayment.provider?.company_name || 'N/A'}
                                    </p>
                                    <p>
                                      <strong>Contact:</strong> {selectedPayment.provider?.user_profiles?.first_name || 'N/A'}{" "}
                                      {selectedPayment.provider?.user_profiles?.last_name || ''}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Service Request */}
                              <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-3">Service Request</h4>
                                <div className="space-y-2 text-sm">
                                  <p>
                                    <strong>Title:</strong> {selectedPayment.request?.title || 'N/A'}
                                  </p>
                                  <p>
                                    <strong>Description:</strong> {selectedPayment.request?.description || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Request Status:</strong>
                                    <Badge className="ml-2" variant="outline">
                                      {selectedPayment.request?.status || 'N/A'}
                                    </Badge>
                                  </p>
                                </div>
                              </div>

                              {/* Payment Details JSON */}
                              {selectedPayment.payment_details && (
                                <div className="border rounded-lg p-4 bg-gray-50">
                                  <h4 className="font-semibold mb-3">Additional Payment Details</h4>
                                  <pre className="text-xs bg-white p-3 rounded border overflow-x-auto max-h-60">
                                    {JSON.stringify(selectedPayment.payment_details, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
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
  )
}
