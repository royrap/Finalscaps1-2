"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Payment {
  id: string
  transaction_id: string | null
  amount: number
  status: string
  release_status: string | null
  request_id: string
  created_at: string
}

export default function PaymentsSection() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchPayments()
    const sub = supabase
      .channel('payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchPayments)
      .subscribe()
    return () => { sub.unsubscribe() }
  }, [])

  async function fetchPayments() {
    const { data, error } = await supabase
      .from("payments")
      .select(`id, transaction_id, amount, status, request_id, created_at, payment_releases(release_status)`) // join payment_releases
      .order("created_at", { ascending: false })
    if (!error) setPayments(
      (data || []).map((p: any) => ({
        id: p.id,
        transaction_id: p.transaction_id,
        amount: p.amount,
        status: p.status,
        release_status: p.payment_releases?.[0]?.release_status || null,
        request_id: p.request_id,
        created_at: p.created_at,
      }))
    )
  }

  const filtered = payments.filter(p =>
    (p.transaction_id || "").toLowerCase().includes(search.toLowerCase()) ||
    p.request_id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center mb-4">
        <Input placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Release Status</TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.transaction_id || "-"}</TableCell>
                    <TableCell>₱{p.amount.toLocaleString()}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell>{p.release_status || "-"}</TableCell>
                    <TableCell>{p.request_id}</TableCell>
                    <TableCell>{new Date(p.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center">No payments found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
