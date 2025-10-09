"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import LocationMap from "@/components/LocationMap"

interface Request {
  id: string
  title: string
  status: string
  created_at: string
  customer: { first_name: string; last_name: string; email: string }
  provider: { company_name: string | null; user_profiles: { first_name: string; last_name: string } | null } | null
  pickup_latitude: number
  pickup_longitude: number
}

export default function RequestsSection() {
  const [requests, setRequests] = useState<Request[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [showMap, setShowMap] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    fetchRequests()
    const sub = supabase
      .channel('service_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, () => fetchRequests())
      .subscribe()
    return () => { sub.unsubscribe() }
  }, [currentPage, statusFilter, search])

  async function fetchRequests() {
    let query = supabase
      .from("service_requests")
      .select(`id, title, status, created_at, pickup_latitude, pickup_longitude, customer:user_profiles!customer_id (first_name, last_name, email), provider:service_providers (company_name, user_profiles!user_id (first_name, last_name))`, { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,customer.first_name.ilike.%${search}%,customer.last_name.ilike.%${search}%`)
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

    if (!error && data) {
      setTotalCount(count || 0)
      setRequests(
        data.map((req: any) => ({
          ...req,
          customer: Array.isArray(req.customer) ? req.customer[0] : req.customer,
          provider: req.provider
            ? {
                ...req.provider,
                user_profiles: Array.isArray(req.provider?.user_profiles)
                  ? req.provider.user_profiles[0]
                  : req.provider.user_profiles,
              }
            : null,
        }))
      )
    }
  }

  const filtered = requests.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.customer.first_name.toLowerCase().includes(search.toLowerCase()) ||
    r.customer.last_name.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const mapLocations = requests.map(req => ({
    id: req.id,
    lat: req.pickup_latitude,
    lng: req.pickup_longitude,
    title: req.title,
    status: req.status,
    type: 'request' as const
  }))

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Input 
            placeholder="Search requests..." 
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowMap(!showMap)}
        >
          {showMap ? "Hide Map" : "Show Map"}
        </Button>
      </div>

      {/* Map Section */}
      {showMap && (
        <LocationMap locations={mapLocations} />
      )}

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Service Requests ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell>{req.title}</TableCell>
                    <TableCell><Badge>{req.status}</Badge></TableCell>
                    <TableCell>{req.customer.first_name} {req.customer.last_name}</TableCell>
                    <TableCell>{req.provider?.user_profiles ? `${req.provider.user_profiles.first_name} ${req.provider.user_profiles.last_name}` : "-"}</TableCell>
                    <TableCell>{new Date(req.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-500">
                        {req.pickup_latitude.toFixed(4)}, {req.pickup_longitude.toFixed(4)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No requests found</TableCell>
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
