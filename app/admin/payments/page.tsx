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
import { Download, Search, Eye, DollarSign, TrendingUp, CreditCard, PiggyBank, FileText, Calendar } from "lucide-react"

interface Invoice {
  id: string
  request_id: string
  customer_id: string
  talyer_owner_id: string
  mechanic_id: string | null
  invoice_number: string
  subtotal: number
  platform_fee: number | null
  total_amount: number
  talyer_net_amount: number
  status: string | null
  generated_at: string | null
  sent_at: string | null
  paid_at: string | null
  completed_at: string | null
  payment_details: any | null
  service_details: any | null
  notes: string | null
  issued_at: string | null
  provider_id: string | null
  due_date: string | null
  items: any | null
  provider_net_amount: number | null
  tax: number | null
  accepted_at: string | null
  available_payment_methods: any | null
  selected_payment_method: string | null
  requires_cash_verification: boolean | null
  
  // Joined data
  customer?: {
    first_name: string
    last_name: string
    email: string
    phone_number: string
  }
  talyer_owner?: {
    first_name: string
    last_name: string
    email: string
  }
  mechanic?: {
    first_name: string
    last_name: string
  }
  provider?: {
    company_name: string
  }
  request?: {
    title: string
    description: string
    status: string
  }
}

interface InvoiceStats {
  total_revenue: number
  total_fees: number
  total_invoices: number
  pending_invoices: number
  paid_invoices: number
  average_invoice: number
}

export default function AdminPaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<InvoiceStats>({
    total_revenue: 0,
    total_fees: 0,
    total_invoices: 0,
    pending_invoices: 0,
    paid_invoices: 0,
    average_invoice: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchInvoices()
    fetchInvoiceStats()
  }, [])

  const fetchInvoices = async () => {
    try {
      console.log('Fetching invoices...')
      
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .order('generated_at', { ascending: false })

      console.log('Invoices query result:', { invoicesData, invoicesError })

      if (invoicesError) {
        console.error('Invoice fetch error:', invoicesError)
        throw invoicesError
      }

      if (!invoicesData || invoicesData.length === 0) {
        console.log('No invoices found in database')
        setInvoices([])
        setLoading(false)
        return
      }

      console.log(`Found ${invoicesData.length} invoices`)

      // Get related data separately
      const customerIds = [...new Set(invoicesData.map(i => i.customer_id).filter(Boolean))]
      const talyerOwnerIds = [...new Set(invoicesData.map(i => i.talyer_owner_id).filter(Boolean))]
      const mechanicIds = [...new Set(invoicesData.map(i => i.mechanic_id).filter(Boolean))]
      const providerIds = [...new Set(invoicesData.map(i => i.provider_id).filter(Boolean))]
      const requestIds = [...new Set(invoicesData.map(i => i.request_id).filter(Boolean))]

      // Fetch customers
      const { data: customers } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, phone_number')
        .in('id', customerIds)

      // Fetch talyer owners
      const { data: talyerOwners } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .in('id', talyerOwnerIds)

      // Fetch mechanics
      const { data: mechanics } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .in('id', mechanicIds)

      // Fetch providers
      const { data: providers } = providerIds.length > 0 ? await supabase
        .from('service_providers')
        .select('id, company_name')
        .in('id', providerIds) : { data: [] }

      // Fetch service requests
      const { data: requests } = await supabase
        .from('service_requests')
        .select('id, title, description, status')
        .in('id', requestIds)

      // Map data to invoices
      const enrichedInvoices = invoicesData.map(invoice => ({
        ...invoice,
        customer: customers?.find(c => c.id === invoice.customer_id),
        talyer_owner: talyerOwners?.find(t => t.id === invoice.talyer_owner_id),
        mechanic: mechanics?.find(m => m.id === invoice.mechanic_id),
        provider: providers?.find(p => p.id === invoice.provider_id),
        request: requests?.find(r => r.id === invoice.request_id)
      }))

      console.log('Enriched invoices:', enrichedInvoices.length)
      setInvoices(enrichedInvoices)
      setError("")
    } catch (error: any) {
      console.error('Invoice fetch error:', error)
      setError(error.message)
      // Fallback to basic query
      const { data: basicData } = await supabase
        .from('invoices')
        .select('*')
        .order('generated_at', { ascending: false })
      
      if (basicData) {
        setInvoices(basicData)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchInvoiceStats = async () => {
    try {
      console.log('Fetching invoice stats...')
      const { data, error } = await supabase
        .from('invoices')
        .select('total_amount, status')

      console.log('Stats query result:', { data, error })

      if (error) throw error
      if (!data) return

      const stats = data.reduce((acc, invoice) => {
        acc.total_revenue += invoice.total_amount || 0
 
        acc.total_invoices += 1
        
        if (['pending', 'generated', 'sent'].includes(invoice.status)) {
          acc.pending_invoices += 1
        } else if (['paid', 'completed'].includes(invoice.status)) {
          acc.paid_invoices += 1
        }
        
        return acc
      }, {
        total_revenue: 0,
        total_fees: 0,
        total_invoices: 0,
        pending_invoices: 0,
        paid_invoices: 0,
        average_invoice: 0
      })

      stats.average_invoice = stats.total_invoices > 0 ? stats.total_revenue / stats.total_invoices : 0
      setStats(stats)
    } catch (error: any) {
      console.error('Error fetching invoice stats:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'generated': return 'bg-blue-100 text-blue-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-cyan-100 text-cyan-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'disputed': return 'bg-orange-100 text-orange-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const exportInvoiceReport = async () => {
    try {
      // Generate CSV content
      const csvContent = [
        // Header
        ['Invoice #', 'Customer', 'Talyer Owner', 'Subtotal', 'Tax', 'Total', 'Net Amount', 'Payment Method', 'Status', 'Due Date', 'Generated At'].join(','),
        // Data rows
        ...filteredInvoices.map(invoice => [
          invoice.invoice_number,
          `"${invoice.customer?.first_name || ''} ${invoice.customer?.last_name || ''}"`,
          `"${invoice.talyer_owner?.first_name || ''} ${invoice.talyer_owner?.last_name || ''}"`,
          invoice.subtotal || 0,
          // invoice.platform_fee || 0,
          invoice.tax || 0,
          invoice.total_amount || 0,
          invoice.talyer_net_amount || 0,
          invoice.selected_payment_method || 'N/A',
          invoice.status || 'generated',
          invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A',
          invoice.generated_at ? new Date(invoice.generated_at).toLocaleDateString() : 'N/A'
        ].join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `invoice_report_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === "" || 
      invoice.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    const matchesMethod = methodFilter === "all" || invoice.selected_payment_method === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Invoice Management</h1>
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
            Invoice Management
          </h1>
          <p className="text-lg text-gray-600">Monitor invoices, payments, and financial analytics</p>
        </div>
        <Button onClick={() => exportInvoiceReport()} className="admin-button px-6 py-3 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl">
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

      {/* Invoice Statistics */}
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
                {/* <p className="text-sm font-semibold text-gray-700">Platform Fees</p> */}
                <p className="text-3xl font-bold text-gray-900">₱{stats.total_fees.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <CreditCard className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600 font-medium">{stats.total_revenue > 0 ? ((stats.total_fees / stats.total_revenue) * 100).toFixed(1) : 0}% fee rate</span>
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
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold">{stats.total_invoices}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.paid_invoices} paid / {stats.pending_invoices} pending</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Invoice</p>
                <p className="text-2xl font-bold">₱{stats.average_invoice.toFixed(2)}</p>
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
                  placeholder="Search by customer name, email, or invoice number..."
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
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="paymongo">PayMongo</SelectItem>
                <SelectItem value="gcash">GCash</SelectItem>
                <SelectItem value="paymaya">PayMaya</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Talyer Owner</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Subtotal</TableHead>
                  {/* <TableHead>Platform Fee</TableHead> */}
                  <TableHead>Total</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {invoice.customer?.first_name} {invoice.customer?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.customer?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {invoice.talyer_owner?.first_name || 'N/A'} {invoice.talyer_owner?.last_name || ''}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.provider?.company_name || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.request?.title || 'N/A'}</div>
                        <div className="text-sm text-gray-500 max-w-40 truncate">
                          {invoice.request?.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₱{invoice.subtotal?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-orange-600">
                      {/* ₱{invoice.platform_fee?.toLocaleString() || '0.00'} */}
                    </TableCell>
                    <TableCell className="font-semibold text-blue-600">
                      ₱{invoice.total_amount?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-green-600">
                      ₱{invoice.talyer_net_amount?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {invoice.selected_payment_method || 'Not selected'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status || 'generated')}>
                        {invoice.status || 'generated'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.due_date ? (
                        <div>
                          <div>{new Date(invoice.due_date).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(invoice.due_date) < new Date() ? (
                              <span className="text-red-500">Overdue</span>
                            ) : (
                              `${Math.ceil((new Date(invoice.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left`
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Invoice Details</DialogTitle>
                            <DialogDescription>Complete information about invoice {selectedInvoice?.invoice_number}</DialogDescription>
                          </DialogHeader>
                          {selectedInvoice && (
                            <div className="space-y-6">
                              {/* Invoice Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-semibold mb-3 text-lg flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Invoice Info
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>Invoice ID:</strong> 
                                      <span className="font-mono ml-2 text-xs">{selectedInvoice.id}</span>
                                    </p>
                                    <p>
                                      <strong>Invoice Number:</strong> 
                                      <span className="font-mono ml-2">{selectedInvoice.invoice_number}</span>
                                    </p>
                                    <p>
                                      <strong>Request ID:</strong> 
                                      <span className="font-mono ml-2 text-xs">{selectedInvoice.request_id}</span>
                                    </p>
                                    <p>
                                      <strong>Payment Method:</strong> {selectedInvoice.selected_payment_method || 'Not selected'}
                                    </p>
                                    <p>
                                      <strong>Cash Verification Required:</strong> {selectedInvoice.requires_cash_verification ? 'Yes' : 'No'}
                                    </p>
                                    <p>
                                      <strong>Status:</strong>
                                      <Badge className={`ml-2 ${getStatusColor(selectedInvoice.status || 'generated')}`}>
                                        {selectedInvoice.status || 'generated'}
                                      </Badge>
                                    </p>
                                  </div>
                                </div>
                                
                                {/* <div className="border rounded-lg p-4">
                                  <h4 className="font-semibold mb-3 text-lg flex items-center">
                                    <DollarSign className="h-5 w-5 mr-2" />
                                    Amount Breakdown
                                  </h4>
                                  <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                      <strong>Subtotal:</strong>
                                      <span className="font-semibold">₱{selectedInvoice.subtotal?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-orange-600">
                                      <strong>Platform Fee:</strong>
                                      <span className="font-semibold">₱{selectedInvoice.platform_fee?.toLocaleString() || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-600">
                                      <strong>Tax:</strong>
                                      <span className="font-semibold">₱{selectedInvoice.tax?.toLocaleString() || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-blue-600 pt-2 border-t">
                                      <strong>Total Amount:</strong>
                                      <span className="text-lg font-bold">₱{selectedInvoice.total_amount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-green-600 pt-2 border-t">
                                      <strong>Talyer Net Amount:</strong>
                                      <span className="text-lg font-bold">₱{selectedInvoice.talyer_net_amount?.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div> */}
                              </div>

                              {/* Dates */}
                              <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-3 text-lg flex items-center">
                                  <Calendar className="h-5 w-5 mr-2" />
                                  Timeline
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <strong className="text-gray-500">Generated:</strong>
                                    <p>{selectedInvoice.generated_at ? new Date(selectedInvoice.generated_at).toLocaleString() : 'N/A'}</p>
                                  </div>
                                  <div>
                                    <strong className="text-gray-500">Sent:</strong>
                                    <p>{selectedInvoice.sent_at ? new Date(selectedInvoice.sent_at).toLocaleString() : 'Not sent'}</p>
                                  </div>
                                  <div>
                                    <strong className="text-gray-500">Accepted:</strong>
                                    <p>{selectedInvoice.accepted_at ? new Date(selectedInvoice.accepted_at).toLocaleString() : 'Not accepted'}</p>
                                  </div>
                                  <div>
                                    <strong className="text-gray-500">Due Date:</strong>
                                    <p className={selectedInvoice.due_date && new Date(selectedInvoice.due_date) < new Date() ? 'text-red-500' : ''}>
                                      {selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleString() : 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <strong className="text-gray-500">Paid:</strong>
                                    <p className="text-green-600">{selectedInvoice.paid_at ? new Date(selectedInvoice.paid_at).toLocaleString() : 'Not paid'}</p>
                                  </div>
                                  <div>
                                    <strong className="text-gray-500">Completed:</strong>
                                     <p className="text-green-600">{selectedInvoice.completed_at ? new Date(selectedInvoice.completed_at).toLocaleString() : 'Not completed'}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Customer & Talyer Owner Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-semibold mb-3">Customer Info</h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>ID:</strong> 
                                      <span className="font-mono ml-2 text-xs">{selectedInvoice.customer_id}</span>
                                    </p>
                                    <p>
                                      <strong>Name:</strong> {selectedInvoice.customer?.first_name || 'N/A'}{" "}
                                      {selectedInvoice.customer?.last_name || ''}
                                    </p>
                                    <p>
                                      <strong>Email:</strong> {selectedInvoice.customer?.email || 'N/A'}
                                    </p>
                                    <p>
                                      <strong>Phone:</strong> {selectedInvoice.customer?.phone_number || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-semibold mb-3">Mechanic Info</h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>ID:</strong> 
                                      <span className="font-mono ml-2 text-xs">{selectedInvoice.talyer_owner_id}</span>
                                    </p>
                                    <p>
                                      <strong>Name:</strong> {selectedInvoice.talyer_owner?.first_name || 'N/A'}{" "}
                                      {selectedInvoice.talyer_owner?.last_name || ''}
                                    </p>
                                    <p>
                                      <strong>Email:</strong> {selectedInvoice.talyer_owner?.email || 'N/A'}
                                    </p>
                                    <p>
                                      <strong>Company:</strong> {selectedInvoice.provider?.company_name || 'N/A'}
                                    </p>
                                    {selectedInvoice.mechanic && (
                                      <p>
                                        <strong>Mechanic:</strong> {selectedInvoice.mechanic?.first_name}{" "}
                                        {selectedInvoice.mechanic?.last_name}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Service Request */}
                              <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-3">Service Request</h4>
                                <div className="space-y-2 text-sm">
                                  <p>
                                    <strong>Title:</strong> {selectedInvoice.request?.title || 'N/A'}
                                  </p>
                                  <p>
                                    <strong>Description:</strong> {selectedInvoice.request?.description || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Request Status:</strong>
                                    <Badge className="ml-2" variant="outline">
                                      {selectedInvoice.request?.status || 'N/A'}
                                    </Badge>
                                  </p>
                                </div>
                              </div>

                              {/* Invoice Items */}
                              {selectedInvoice.items && Array.isArray(selectedInvoice.items) && selectedInvoice.items.length > 0 && (
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-semibold mb-3">Invoice Items</h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit Price</TableHead>
                                        <TableHead>Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedInvoice.items.map((item: any, index: number) => (
                                        <TableRow key={index}>
                                          <TableCell>{item.description || item.name || 'Item'}</TableCell>
                                          <TableCell>{item.quantity || 1}</TableCell>
                                          <TableCell>₱{(item.unit_price || item.price || 0).toLocaleString()}</TableCell>
                                          <TableCell>₱{(item.total || (item.quantity || 1) * (item.unit_price || item.price || 0)).toLocaleString()}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}

                              {/* Service Details */}
                              {selectedInvoice.service_details && Object.keys(selectedInvoice.service_details).length > 0 && (
                                <div className="border rounded-lg p-4 bg-gray-50">
                                  <h4 className="font-semibold mb-3">Service Details</h4>
                                  <pre className="text-xs bg-white p-3 rounded border overflow-x-auto max-h-40">
                                    {JSON.stringify(selectedInvoice.service_details, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Payment Details with Proof Image */}
                              {selectedInvoice.payment_details && Object.keys(selectedInvoice.payment_details).length > 0 && (
                                <div className="border rounded-lg p-4 bg-gray-50">
                                  <h4 className="font-semibold mb-3">Additional Payment Details</h4>
                                  
                                  {/* Payment Proof Image */}
                                  {selectedInvoice.payment_details.proof_url && (
                                    <div className="mb-4">
                                      <p className="text-sm font-medium mb-2">Payment Proof:</p>
                                      <div className="relative">
                                        <img 
                                          src={selectedInvoice.payment_details.proof_url}
                                          alt="Payment Proof"
                                          className="max-w-full h-auto max-h-80 rounded-lg border shadow-sm object-contain"
                                        />
                                        <a 
                                          href={selectedInvoice.payment_details.proof_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="absolute top-2 right-2 bg-white/90 hover:bg-white px-2 py-1 rounded text-xs text-blue-600 hover:text-blue-800 shadow"
                                        >
                                          View Full Size
                                        </a>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Additional Details */}
                                  <div className="space-y-2 text-sm">
                                    {selectedInvoice.payment_details.timestamp && (
                                      <p>
                                        <strong>Payment Timestamp:</strong>{' '}
                                        {new Date(selectedInvoice.payment_details.timestamp).toLocaleString()}
                                      </p>
                                    )}
                                    {selectedInvoice.payment_details.verified !== undefined && (
                                      <p>
                                        <strong>Verified:</strong>{' '}
                                        <Badge className={selectedInvoice.payment_details.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                          {selectedInvoice.payment_details.verified ? 'Yes' : 'No'}
                                        </Badge>
                                      </p>
                                    )}
                                    {selectedInvoice.payment_details.reference_number && (
                                      <p>
                                        <strong>Reference Number:</strong>{' '}
                                        <span className="font-mono">{selectedInvoice.payment_details.reference_number}</span>
                                      </p>
                                    )}
                                    {selectedInvoice.payment_details.notes && (
                                      <p>
                                        <strong>Notes:</strong> {selectedInvoice.payment_details.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Notes */}
                              {selectedInvoice.notes && (
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-semibold mb-3">Notes</h4>
                                  <p className="text-sm text-gray-700">{selectedInvoice.notes}</p>
                                </div>
                              )}

                              {/* Available Payment Methods */}
                              {selectedInvoice.available_payment_methods && (
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-semibold mb-3">Available Payment Methods</h4>
                                  <div className="flex gap-2 flex-wrap">
                                    {(Array.isArray(selectedInvoice.available_payment_methods) 
                                      ? selectedInvoice.available_payment_methods 
                                      : []
                                    ).map((method: string, index: number) => (
                                      <Badge key={index} variant="outline" className={
                                        method === selectedInvoice.selected_payment_method 
                                          ? 'bg-green-100 text-green-800 border-green-300' 
                                          : ''
                                      }>
                                        {method}
                                        {method === selectedInvoice.selected_payment_method && ' ✓'}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
                      No invoices found
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
