"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  status: string
  created_at: string
  service_history: { id: string; title: string; status: string; created_at: string }[]
}

export default function CustomersSection() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10

  useEffect(() => {
    fetchCustomers()
    const sub = supabase
      .channel('user_profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, () => fetchCustomers())
      .subscribe()
    return () => { sub.unsubscribe() }
  }, [currentPage, statusFilter, search])

  async function fetchCustomers() {
    let query = supabase
      .from("user_profiles")
      .select(`id, first_name, last_name, email, phone_number, status, created_at, service_history:service_requests(id, title, status, created_at)`, { count: 'exact' })
      .eq("user_type", "customer")

    // Apply search filter
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }

    // Apply pagination
    const from = (currentPage - 1) * itemsPerPage
    const to = from + itemsPerPage - 1
    query = query.range(from, to)

    const { data, error, count } = await query.order("created_at", { ascending: false })

    if (!error) {
      setTotalCount(count || 0)
      setCustomers(data || [])
    }
  }

  const filtered = customers.filter(c =>
    c.first_name.toLowerCase().includes(search.toLowerCase()) ||
    c.last_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Input 
          placeholder="Search customers..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="max-w-xs" 
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending_verification">Pending Verification</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Service History</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>{c.first_name} {c.last_name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.phone_number}</TableCell>
                    <TableCell>{c.status}</TableCell>
                    <TableCell>
                      {c.service_history && c.service_history.length > 0 ? (
                        <ul className="list-disc ml-4">
                          {c.service_history.slice(0, 3).map(h => (
                            <li key={h.id} className="text-xs">{h.title} ({h.status})</li>
                          ))}
                          {c.service_history.length > 3 && (
                            <li className="text-xs text-gray-500">+{c.service_history.length - 3} more</li>
                          )}
                        </ul>
                      ) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No customers found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
