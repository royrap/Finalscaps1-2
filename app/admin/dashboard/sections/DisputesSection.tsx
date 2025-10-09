"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Based on actual database schema: invoices table has 'disputed' status
// and payments table has 'disputed' status
interface Dispute {
  id: string
  request_id: string
  customer_id: string
  invoice_number?: string
  total_amount: number
  status: string
  type: 'invoice' | 'payment'
  created_at: string
  notes?: string
}

export default function DisputesSection() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchDisputes()
    const invoiceSub = supabase
      .channel('invoice_disputes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, fetchDisputes)
      .subscribe()
    const paymentSub = supabase
      .channel('payment_disputes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchDisputes)
      .subscribe()
    return () => { 
      invoiceSub.unsubscribe()
      paymentSub.unsubscribe()
    }
  }, [])

  async function fetchDisputes() {
    // Fetch disputed invoices from invoices table (exists in schema)
    const { data: invoiceDisputes, error: invoiceError } = await supabase
      .from("invoices")
      .select(`id, request_id, customer_id, invoice_number, total_amount, status, notes, created_at`)
      .eq('status', 'disputed')
      .order("created_at", { ascending: false })

    // Fetch disputed payments from payments table (exists in schema)
    const { data: paymentDisputes, error: paymentError } = await supabase
      .from("payments")
      .select(`id, request_id, customer_id, amount, status, created_at`)
      .eq('status', 'disputed')
      .order("created_at", { ascending: false })

    // Combine both types of disputes
    const combined: Dispute[] = [
      ...(invoiceDisputes || []).map(inv => ({
        id: inv.id,
        request_id: inv.request_id,
        customer_id: inv.customer_id,
        invoice_number: inv.invoice_number,
        total_amount: inv.total_amount,
        status: inv.status,
        type: 'invoice' as const,
        created_at: inv.created_at,
        notes: inv.notes
      })),
      ...(paymentDisputes || []).map(pay => ({
        id: pay.id,
        request_id: pay.request_id,
        customer_id: pay.customer_id,
        total_amount: pay.amount,
        status: pay.status,
        type: 'payment' as const,
        created_at: pay.created_at
      }))
    ]

    setDisputes(combined.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ))
  }

  const filtered = disputes.filter(d =>
    d.request_id.toLowerCase().includes(search.toLowerCase()) ||
    d.customer_id.toLowerCase().includes(search.toLowerCase()) ||
    (d.invoice_number && d.invoice_number.toLowerCase().includes(search.toLowerCase())) ||
    (d.notes && d.notes.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input 
          placeholder="Search by request ID, customer ID, invoice..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="max-w-xs" 
        />
        <Badge variant="destructive" className="text-lg px-4 py-2">
          {disputes.length} Disputed {disputes.length === 1 ? 'Transaction' : 'Transactions'}
        </Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Disputed Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Invoice/Trans #</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(d => (
                  <TableRow key={`${d.type}-${d.id}`}>
                    <TableCell>
                      <Badge variant={d.type === 'invoice' ? 'default' : 'secondary'}>
                        {d.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{d.request_id.substring(0, 8)}...</TableCell>
                    <TableCell className="font-mono text-xs">{d.customer_id.substring(0, 8)}...</TableCell>
                    <TableCell className="font-medium">
                      {d.invoice_number || 'N/A'}
                    </TableCell>
                    <TableCell className="font-semibold">₱{d.total_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{d.status}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {d.notes || '-'}
                    </TableCell>
                    <TableCell>{new Date(d.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {disputes.length === 0 
                        ? "No disputed transactions found ✅" 
                        : "No disputes match your search"}
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
