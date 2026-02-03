"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { Search, Eye } from "lucide-react"

interface ServiceRequest {
  id: string
  title: string
  description: string | null
  status: string
  pickup_latitude: number
  pickup_longitude: number
  pickup_address: string | null
  estimated_price: number | null
  final_price: number | null
  created_at: string
  updated_at: string
  customer: {
    first_name: string
    last_name: string
    email: string
    phone_number: string
    profile_image_url: string | null
    rating: number | null
  } | null
  assigned_mechanic: {
    first_name: string
    last_name: string
    email: string
    phone_number: string
    profile_image_url: string | null
    rating: number | null
  } | null
  service_categories: {
    name: string
  } | null
  shop: {
    shop_name: string
    shop_address: string | null
  } | null
}

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      // Using direct approach - separate queries then manual join
      // This is more reliable than Supabase's nested select syntax
      
      // 1. Get all service requests with basic info
      const { data: requestsData, error: requestsError } = await supabase
        .from("service_requests")
        .select("*")
        .order("created_at", { ascending: false })

      if (requestsError) throw requestsError
      if (!requestsData || requestsData.length === 0) {
        setRequests([])
        setLoading(false)
        return
      }

      // 2. Get unique IDs for related data
      const customerIds = [...new Set(requestsData.map(r => r.customer_id))]
      const mechanicIds = [...new Set(requestsData.map(r => r.assigned_mechanic_id).filter(Boolean))]
      const categoryIds = [...new Set(requestsData.map(r => r.category_id).filter(Boolean))]
      const shopIds = [...new Set(requestsData.map(r => r.shop_id).filter(Boolean))]

      // 3. Fetch customers
      const { data: customers } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, phone_number, profile_image_url, rating')
        .in('id', customerIds)

      // 4. Fetch assigned mechanics
      const { data: mechanics } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, phone_number, profile_image_url, rating')
        .in('id', mechanicIds.length > 0 ? mechanicIds : ['00000000-0000-0000-0000-000000000000'])

      // 5. Fetch service categories
      const { data: categories } = await supabase
        .from('service_categories')
        .select('id, name')
        .in('id', categoryIds.length > 0 ? categoryIds : ['00000000-0000-0000-0000-000000000000'])

      // 6. Fetch shops
      const { data: shops } = await supabase
        .from('shops')
        .select('id, shop_name, shop_address')
        .in('id', shopIds.length > 0 ? shopIds : ['00000000-0000-0000-0000-000000000000'])

      // 7. Map everything together (manual JOIN)
      const enrichedRequests = requestsData.map(request => ({
        ...request,
        customer: customers?.find(c => c.id === request.customer_id),
        assigned_mechanic: mechanics?.find(m => m.id === request.assigned_mechanic_id),
        service_categories: categories?.find(cat => cat.id === request.category_id),
        shop: shops?.find(s => s.id === request.shop_id)
      }))

      setRequests(enrichedRequests)
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("service_requests")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (error) throw error

      // Update local state
      setRequests(
        requests.map((request) =>
          request.id === requestId ? { ...request, status: newStatus, updated_at: new Date().toISOString() } : request,
        ),
      )
    } catch (error) {
      console.error("Error updating request status:", error)
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer?.last_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || request.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-red-100 text-red-800"
      case "in_progress":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Service Requests</h1>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Service Requests</h1>
        <Badge variant="outline">
          {filteredRequests.length} of {requests.length} requests
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Management</CardTitle>
          <CardDescription>Monitor and manage all service requests</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
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

          {/* Requests Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Assigned Mechanic</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{request.title}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">
                          {request.customer?.first_name} {request.customer?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{request.customer?.phone_number}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.assigned_mechanic ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {request.assigned_mechanic.first_name} {request.assigned_mechanic.last_name}
                            </p>
                            {request.assigned_mechanic.rating && (
                              <Badge variant="outline" className="text-xs">
                                ⭐ {request.assigned_mechanic.rating.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{request.assigned_mechanic.phone_number}</p>
                          {request.shop && (
                            <p className="text-xs text-blue-600">🏪 {request.shop.shop_name}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>{request.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {request.estimated_price && (
                          <p className="text-sm">Est: ₱{request.estimated_price.toLocaleString()}</p>
                        )}
                        {request.final_price && (
                          <p className="font-medium">Final: ₱{request.final_price.toLocaleString()}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(request)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Request Details</DialogTitle>
                            <DialogDescription>Complete information about this service request</DialogDescription>
                          </DialogHeader>
                          {selectedRequest && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Request Info</h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>Title:</strong> {selectedRequest.title}
                                    </p>
                                    <p>
                                      <strong>Description:</strong> {selectedRequest.description || "N/A"}
                                    </p>
                                    <p>
                                      <strong>Status:</strong>
                                      <Badge className={`ml-2 ${getStatusColor(selectedRequest.status)}`}>
                                        {selectedRequest.status.replace("_", " ")}
                                      </Badge>
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Customer Info</h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>Name:</strong> {selectedRequest.customer?.first_name}{" "}
                                      {selectedRequest.customer?.last_name}
                                    </p>
                                    <p>
                                      <strong>Email:</strong> {selectedRequest.customer?.email}
                                    </p>
                                    <p>
                                      <strong>Phone:</strong> {selectedRequest.customer?.phone_number}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Assigned Mechanic</h4>
                                  <div className="space-y-2 text-sm">
                                    {selectedRequest.assigned_mechanic ? (
                                      <>
                                        <p>
                                          <strong>Name:</strong> {selectedRequest.assigned_mechanic.first_name}{" "}
                                          {selectedRequest.assigned_mechanic.last_name}
                                          {selectedRequest.assigned_mechanic.rating && (
                                            <Badge variant="outline" className="ml-2 text-xs">
                                              ⭐ {selectedRequest.assigned_mechanic.rating.toFixed(1)}
                                            </Badge>
                                          )}
                                        </p>
                                        <p>
                                          <strong>Email:</strong> {selectedRequest.assigned_mechanic.email}
                                        </p>
                                        <p>
                                          <strong>Phone:</strong> {selectedRequest.assigned_mechanic.phone_number}
                                        </p>
                                        {selectedRequest.shop && (
                                          <>
                                            <div className="pt-2 border-t mt-2">
                                              <p className="font-semibold text-blue-600">Shop Information</p>
                                            </div>
                                            <p>
                                              <strong>Shop Name:</strong> {selectedRequest.shop.shop_name}
                                            </p>
                                            {selectedRequest.shop.shop_address && (
                                              <p>
                                                <strong>Shop Address:</strong> {selectedRequest.shop.shop_address}
                                              </p>
                                            )}
                                          </>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-muted-foreground">No mechanic assigned yet</p>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Pricing</h4>
                                  <div className="space-y-2 text-sm">
                                    {selectedRequest.estimated_price && (
                                      <p>
                                        <strong>Estimated:</strong> ₱{selectedRequest.estimated_price.toLocaleString()}
                                      </p>
                                    )}
                                    {selectedRequest.final_price && (
                                      <p>
                                        <strong>Final:</strong> ₱{selectedRequest.final_price.toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Location</h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <strong>Address:</strong> {selectedRequest.pickup_address || "N/A"}
                                    </p>
                                    <p>
                                      <strong>Coordinates:</strong> {selectedRequest.pickup_latitude},{" "}
                                      {selectedRequest.pickup_longitude}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Select
                                  value={selectedRequest.status}
                                  onValueChange={(value) => updateRequestStatus(selectedRequest.id, value)}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredRequests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No requests found matching your criteria</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
