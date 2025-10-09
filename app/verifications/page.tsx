"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import RoleGuard from "@/components/RoleGuard"
import AdminNavigation from "@/components/AdminNavigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Check, X, AlertTriangle, Clock, FileText, Database } from "lucide-react"
// Schema parsing utility functions
const parseTableSchema = () => {
  const columns = [
    { name: 'id', type: 'uuid', constraints: ['NOT NULL', 'PRIMARY KEY'], defaultValue: 'gen_random_uuid()', description: 'Unique identifier for verification record' },
    { name: 'user_id', type: 'uuid', constraints: ['NOT NULL', 'UNIQUE', 'FOREIGN KEY'], defaultValue: null, description: 'References auth.users(id) - One verification per user' },
    { name: 'business_name', type: 'character varying', constraints: ['NOT NULL'], defaultValue: null, description: 'Name of the business/shop' },
    { name: 'business_permit_url', type: 'text', constraints: ['NOT NULL'], defaultValue: null, description: 'URL to business permit document' },
    { name: 'valid_id_url', type: 'text', constraints: ['NOT NULL'], defaultValue: null, description: 'URL to valid ID document' },
    { name: 'profile_image_url', type: 'text', constraints: ['NULLABLE'], defaultValue: null, description: 'URL to profile image (optional)' },
    { name: 'id_type', type: 'character varying', constraints: ['NOT NULL', 'CHECK'], defaultValue: "'national_id'", description: 'Type of ID: drivers_license, umid, national_id, passport, philsys_id, other' },
    { name: 'permit_expiry_date', type: 'date', constraints: ['NULLABLE'], defaultValue: null, description: 'Business permit expiration date' },
    { name: 'id_expiry_date', type: 'date', constraints: ['NULLABLE'], defaultValue: null, description: 'ID document expiration date' },
    { name: 'status', type: 'character varying', constraints: ['NOT NULL', 'CHECK'], defaultValue: "'pending'", description: 'Verification status: pending, under_review, approved, rejected, additional_info_required' },
    { name: 'admin_notes', type: 'text', constraints: ['NULLABLE'], defaultValue: null, description: 'Admin notes during review process' },
    { name: 'reviewed_by', type: 'uuid', constraints: ['FOREIGN KEY'], defaultValue: null, description: 'References auth.users(id) - Admin who reviewed' },
    { name: 'reviewed_at', type: 'timestamp with time zone', constraints: ['NULLABLE'], defaultValue: null, description: 'When the review was completed' },
    { name: 'created_at', type: 'timestamp with time zone', constraints: ['NOT NULL'], defaultValue: 'now()', description: 'Record creation timestamp' },
    { name: 'updated_at', type: 'timestamp with time zone', constraints: ['NOT NULL'], defaultValue: 'now()', description: 'Last update timestamp' },
    { name: 'business_address', type: 'text', constraints: ['NULLABLE'], defaultValue: null, description: 'Physical address of the business' },
    { name: 'contact_person', type: 'character varying', constraints: ['NULLABLE'], defaultValue: null, description: 'Name of the contact person' },
    { name: 'phone_number', type: 'character varying', constraints: ['NULLABLE'], defaultValue: null, description: 'Contact phone number' },
    { name: 'email', type: 'character varying', constraints: ['NULLABLE'], defaultValue: null, description: 'Business email address' },
    { name: 'is_permit_expired', type: 'boolean', constraints: ['NOT NULL'], defaultValue: 'false', description: 'Whether business permit is expired' },
    { name: 'is_id_expired', type: 'boolean', constraints: ['NOT NULL'], defaultValue: 'false', description: 'Whether ID document is expired' },
    { name: 'tamper_flags', type: 'jsonb', constraints: ['NOT NULL'], defaultValue: "'[]'::jsonb", description: 'Array of security flags/warnings about documents' },
    { name: 'verification_score', type: 'integer', constraints: ['NOT NULL', 'CHECK (0-100)'], defaultValue: '0', description: 'Verification confidence score from 0-100' }
  ]

  const constraints = [
    { name: 'talyer_owner_verifications_pkey', type: 'PRIMARY KEY', column: 'id' },
    { name: 'talyer_owner_verifications_user_id_key', type: 'UNIQUE', column: 'user_id' },
    { name: 'talyer_owner_verifications_reviewed_by_fkey', type: 'FOREIGN KEY', column: 'reviewed_by', references: 'auth.users(id)', onDelete: 'SET NULL' },
    { name: 'talyer_owner_verifications_user_id_fkey', type: 'FOREIGN KEY', column: 'user_id', references: 'auth.users(id)', onDelete: 'CASCADE' },
    { name: 'talyer_owner_verifications_score_check', type: 'CHECK', column: 'verification_score', condition: 'verification_score >= 0 AND verification_score <= 100' },
    { name: 'talyer_owner_verifications_id_type_check', type: 'CHECK', column: 'id_type', condition: "id_type IN ('drivers_license', 'umid', 'national_id', 'passport', 'philsys_id', 'other')" },
    { name: 'talyer_owner_verifications_status_check', type: 'CHECK', column: 'status', condition: "status IN ('pending', 'under_review', 'approved', 'rejected', 'additional_info_required')" }
  ]

  const indexes = [
    { name: 'idx_talyer_verifications_user_id', column: 'user_id', type: 'BTREE' },
    { name: 'idx_talyer_verifications_status', column: 'status', type: 'BTREE' },
    { name: 'idx_talyer_verifications_reviewed_by', column: 'reviewed_by', type: 'BTREE' },
    { name: 'idx_talyer_verifications_created_at', column: 'created_at', type: 'BTREE' },
    { name: 'idx_talyer_verifications_score', column: 'verification_score', type: 'BTREE' }
  ]

  const triggers = [
    { name: 'trigger_update_talyer_owner_status', event: 'AFTER UPDATE', timing: 'FOR EACH ROW', function: 'update_talyer_owner_status()' }
  ]

  return { columns, constraints, indexes, triggers }
}

const getConstraintBadgeVariant = (constraint: string) => {
  switch (constraint) {
    case 'NOT NULL': return 'default'
    case 'PRIMARY KEY': return 'outline'
    case 'FOREIGN KEY': return 'secondary'
    case 'UNIQUE': return 'outline'
    case 'CHECK': return 'destructive'
    case 'NULLABLE': return 'secondary'
    default: return 'default'
  }
}

interface TalyerVerification {
  id: string
  user_id: string
  business_name: string
  business_permit_url: string
  valid_id_url: string
  profile_image_url: string | null
  id_type: string
  permit_expiry_date: string | null
  id_expiry_date: string | null
  status: string
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
  business_address: string | null
  contact_person: string | null
  phone_number: string | null
  email: string | null
  is_permit_expired: boolean
  is_id_expired: boolean
  tamper_flags: string[]
  verification_score: number
  user_profiles?: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<TalyerVerification[]>([])
  const [selectedVerification, setSelectedVerification] = useState<TalyerVerification | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [adminNotes, setAdminNotes] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    fetchVerifications()
    // Real-time subscription disabled while using mock data
    // In production, enable this when proper RLS policies are configured:
    // const sub = supabase
    //   .channel('talyer_owner_verifications')
    //   .on('postgres_changes', { event: '*', schema: 'public', table: 'talyer_owner_verifications' }, () => fetchVerifications())
    //   .subscribe()
    // return () => { sub.unsubscribe() }
  }, [currentPage, statusFilter, search])

  async function fetchVerifications() {
    try {
      setLoading(true)
      
      // For development: Always use mock data
      console.log('Using mock data for development')
      await fetchMockData()
      return

      // Real Supabase implementation (commented out for development)
      /*
      try {
        let query = supabase
          .from("talyer_owner_verifications")
          .select("*")

        // Apply search filter
        if (search) {
          query = query.or(`business_name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`)
        }

        // Apply status filter
        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter)
        }

        // Get total count for pagination
        const { count } = await supabase
          .from("talyer_owner_verifications")
          .select("*", { count: "exact", head: true })

        // Apply pagination and ordering
        const from = (currentPage - 1) * itemsPerPage
        const to = from + itemsPerPage - 1

        const { data, error } = await query
          .order("created_at", { ascending: false })
          .range(from, to)

        if (error) {
          console.error("Supabase error:", error)
          console.log("Falling back to mock data due to error:", error.message)
          await fetchMockData()
          return
        }

        console.log("Successfully fetched from Supabase:", data?.length, "records")
        setTotalCount(count || 0)
        setVerifications(data || [])
        
      } catch (supabaseError) {
        console.error("Supabase connection error:", supabaseError)
        console.log("Falling back to mock data")
        await fetchMockData()
      }
      */

    } catch (error) {
      console.error("Error fetching verifications:", error)
      await fetchMockData()
    } finally {
      setLoading(false)
    }
  }

  async function fetchMockData() {
    // Enhanced mock data that demonstrates all table fields
    const mockVerifications = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        user_id: "550e8400-e29b-41d4-a716-446655440101",
        business_name: "Juan's Auto Repair Shop",
        business_permit_url: "https://example.com/permits/permit1.jpg",
        valid_id_url: "https://example.com/ids/id1.jpg",
        profile_image_url: "https://example.com/profiles/juan.jpg",
        id_type: "drivers_license",
        permit_expiry_date: "2025-12-31",
        id_expiry_date: "2027-06-15",
        status: "pending",
        admin_notes: null,
        reviewed_by: null,
        reviewed_at: null,
        created_at: "2025-08-20T10:30:00Z",
        updated_at: "2025-08-20T10:30:00Z",
        business_address: "123 Main Street, Quezon City, Metro Manila",
        contact_person: "Juan Dela Cruz",
        phone_number: "+63917-123-4567",
        email: "juan@autorepair.com",
        is_permit_expired: false,
        is_id_expired: false,
        tamper_flags: [],
        verification_score: 85,
        user_profiles: {
          first_name: "Juan",
          last_name: "Dela Cruz",
          email: "juan.delacruz@gmail.com"
        }
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        user_id: "550e8400-e29b-41d4-a716-446655440102",
        business_name: "Maria's Motorcycle Services",
        business_permit_url: "https://example.com/permits/permit2.jpg",
        valid_id_url: "https://example.com/ids/id2.jpg",
        profile_image_url: "https://example.com/profiles/maria.jpg",
        id_type: "national_id",
        permit_expiry_date: "2024-12-31",
        id_expiry_date: "2026-03-20",
        status: "under_review",
        admin_notes: "Business permit seems legitimate, checking address verification",
        reviewed_by: "550e8400-e29b-41d4-a716-446655440201",
        reviewed_at: "2025-08-21T14:15:00Z",
        created_at: "2025-08-19T16:45:00Z",
        updated_at: "2025-08-21T14:15:00Z",
        business_address: "456 Rizal Avenue, Makati City, Metro Manila",
        contact_person: "Maria Santos",
        phone_number: "+63922-987-6543",
        email: "maria@motorcycle.ph",
        is_permit_expired: true,
        is_id_expired: false,
        tamper_flags: ["Document quality inconsistent"],
        verification_score: 65,
        user_profiles: {
          first_name: "Maria",
          last_name: "Santos",
          email: "maria.santos@gmail.com"
        }
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        user_id: "550e8400-e29b-41d4-a716-446655440103",
        business_name: "Rodriguez Tire & Battery Center",
        business_permit_url: "https://example.com/permits/permit3.jpg",
        valid_id_url: "https://example.com/ids/id3.jpg",
        profile_image_url: null,
        id_type: "umid",
        permit_expiry_date: "2026-08-30",
        id_expiry_date: "2028-11-10",
        status: "approved",
        admin_notes: "All documents verified. Business location confirmed.",
        reviewed_by: "550e8400-e29b-41d4-a716-446655440201",
        reviewed_at: "2025-08-18T09:30:00Z",
        created_at: "2025-08-17T11:20:00Z",
        updated_at: "2025-08-18T09:30:00Z",
        business_address: "789 EDSA, Pasig City, Metro Manila",
        contact_person: "Pedro Rodriguez",
        phone_number: "+63915-555-1234",
        email: "pedro@tirebattery.com",
        is_permit_expired: false,
        is_id_expired: false,
        tamper_flags: [],
        verification_score: 92,
        user_profiles: {
          first_name: "Pedro",
          last_name: "Rodriguez",
          email: "pedro.rodriguez@gmail.com"
        }
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440004",
        user_id: "550e8400-e29b-41d4-a716-446655440104",
        business_name: "Garcia Electronics & Car Audio",
        business_permit_url: "https://example.com/permits/permit4.jpg",
        valid_id_url: "https://example.com/ids/id4.jpg",
        profile_image_url: "https://example.com/profiles/garcia.jpg",
        id_type: "passport",
        permit_expiry_date: "2025-03-15",
        id_expiry_date: "2029-12-25",
        status: "rejected",
        admin_notes: "Business permit expired. Address verification failed. Please resubmit with updated documents.",
        reviewed_by: "550e8400-e29b-41d4-a716-446655440201",
        reviewed_at: "2025-08-19T11:45:00Z",
        created_at: "2025-08-16T08:15:00Z",
        updated_at: "2025-08-19T11:45:00Z",
        business_address: "321 Quezon Avenue, Baguio City, Benguet",
        contact_person: "Ana Garcia",
        phone_number: "+63918-777-8888",
        email: "ana@garciaelectronics.ph",
        is_permit_expired: true,
        is_id_expired: false,
        tamper_flags: ["Address mismatch", "Permit expired"],
        verification_score: 35,
        user_profiles: {
          first_name: "Ana",
          last_name: "Garcia",
          email: "ana.garcia@gmail.com"
        }
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440005",
        user_id: "550e8400-e29b-41d4-a716-446655440105",
        business_name: "Singh Automotive Parts & Services",
        business_permit_url: "https://example.com/permits/permit5.jpg",
        valid_id_url: "https://example.com/ids/id5.jpg",
        profile_image_url: "https://example.com/profiles/singh.jpg",
        id_type: "philsys_id",
        permit_expiry_date: "2026-06-30",
        id_expiry_date: "2030-01-15",
        status: "additional_info_required",
        admin_notes: "Business permit is valid but we need additional proof of business operation. Please provide recent business tax returns.",
        reviewed_by: "550e8400-e29b-41d4-a716-446655440202",
        reviewed_at: "2025-08-22T10:20:00Z",
        created_at: "2025-08-21T14:30:00Z",
        updated_at: "2025-08-22T10:20:00Z",
        business_address: "567 Commonwealth Avenue, Diliman, Quezon City",
        contact_person: "Rajesh Singh",
        phone_number: "+63917-444-5555",
        email: "rajesh@singhautomotive.com",
        is_permit_expired: false,
        is_id_expired: false,
        tamper_flags: ["Incomplete business documentation"],
        verification_score: 70,
        user_profiles: {
          first_name: "Rajesh",
          last_name: "Singh",
          email: "rajesh.singh@gmail.com"
        }
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440006",
        user_id: "550e8400-e29b-41d4-a716-446655440106",
        business_name: "Lim Family Car Wash & Detailing",
        business_permit_url: "https://example.com/permits/permit6.jpg",
        valid_id_url: "https://example.com/ids/id6.jpg",
        profile_image_url: null,
        id_type: "other",
        permit_expiry_date: "2025-11-20",
        id_expiry_date: "2027-08-05",
        status: "under_review",
        admin_notes: "Documents under review. Initial verification looks good.",
        reviewed_by: "550e8400-e29b-41d4-a716-446655440201",
        reviewed_at: "2025-08-22T08:00:00Z",
        created_at: "2025-08-22T06:45:00Z",
        updated_at: "2025-08-22T08:00:00Z",
        business_address: "890 Gil Puyat Avenue, Makati City, Metro Manila",
        contact_person: "Michael Lim",
        phone_number: "+63920-333-4444",
        email: "michael@limcarwash.ph",
        is_permit_expired: false,
        is_id_expired: false,
        tamper_flags: [],
        verification_score: 88,
        user_profiles: {
          first_name: "Michael",
          last_name: "Lim",
          email: "michael.lim@gmail.com"
        }
      }
    ]

    // Apply search filter
    let filteredData = mockVerifications
    if (search) {
      const searchLower = search.toLowerCase()
      filteredData = filteredData.filter(verification => 
        verification.business_name.toLowerCase().includes(searchLower) ||
        verification.contact_person?.toLowerCase().includes(searchLower) ||
        verification.email?.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filteredData = filteredData.filter(verification => verification.status === statusFilter)
    }

    // Apply pagination
    const from = (currentPage - 1) * itemsPerPage
    const to = from + itemsPerPage
    const paginatedData = filteredData.slice(from, to)

    setTotalCount(filteredData.length)
    setVerifications(paginatedData)
    
    console.log("Mock data loaded:", {
      totalFiltered: filteredData.length,
      paginatedCount: paginatedData.length,
      currentPage,
      search,
      statusFilter,
      firstRecord: paginatedData[0]
    })
  }

  async function updateVerificationStatus(id: string, newStatus: string, notes: string = "") {
    setUpdatingStatus(true)
    try {
      // For development: Use mock update
      console.log('Using mock update for development')
      mockUpdate(id, newStatus, notes)
      return

      // Real Supabase implementation (commented out for development)
      /*
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        const { error } = await supabase
          .from("talyer_owner_verifications")
          .update({
            status: newStatus,
            admin_notes: notes,
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", id)

        if (error) {
          console.error("Supabase update error:", error)
          // Fall back to mock update
          mockUpdate(id, newStatus, notes)
          return
        }

        console.log("Successfully updated verification in Supabase")
        await fetchVerifications()
        setSelectedVerification(null)
        setAdminNotes("")
        
      } catch (supabaseError) {
        console.error("Supabase connection error:", supabaseError)
        // Fall back to mock update
        mockUpdate(id, newStatus, notes)
      }
      */
      
    } catch (error) {
      console.error("Error updating verification status:", error)
      mockUpdate(id, newStatus, notes)
    } finally {
      setUpdatingStatus(false)
    }
  }

  function mockUpdate(id: string, newStatus: string, notes: string) {
    console.log(`Mock update: Verification ${id} status changed to ${newStatus}`)
    console.log(`Admin notes: ${notes}`)
    
    // Update the local state to reflect the change
    setVerifications(prev => 
      prev.map(verification => 
        verification.id === id 
          ? {
              ...verification,
              status: newStatus,
              admin_notes: notes,
              reviewed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : verification
      )
    )
    
    setSelectedVerification(null)
    setAdminNotes("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "under_review": return "bg-blue-100 text-blue-800"
      case "approved": return "bg-green-100 text-green-800"
      case "rejected": return "bg-red-100 text-red-800"
      case "additional_info_required": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />
      case "under_review": return <Eye className="h-4 w-4" />
      case "approved": return <Check className="h-4 w-4" />
      case "rejected": return <X className="h-4 w-4" />
      case "additional_info_required": return <AlertTriangle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatIdType = (idType: string) => {
    return idType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const isExpired = (dateString: string | null) => {
    if (!dateString) return false
    return new Date(dateString) < new Date()
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['admin', 'super_admin']}>
      <div className="p-8 max-w-7xl mx-auto">
        <AdminNavigation />
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold">Business Verifications</h1>
            <Badge variant="secondary">{totalCount} verifications</Badge>
          </div>
          <p className="text-gray-600">Review and approve shop owner verification requests</p>
        </div>

        <Tabs defaultValue="verifications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="verifications">Verifications</TabsTrigger>
            <TabsTrigger value="schema">Table Schema</TabsTrigger>
          </TabsList>

          <TabsContent value="verifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Verification Requests</span>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Search by business name, owner name, or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-80"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="additional_info_required">Additional Info Required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {verifications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No verifications found</h3>
                    <p className="text-gray-500">No verification requests match your current filters.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Business</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>ID Type</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {verifications.map((verification) => (
                          <TableRow key={verification.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{verification.business_name}</div>
                                <div className="text-sm text-gray-500">{verification.business_address}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{verification.contact_person}</div>
                                <div className="text-sm text-gray-500">
                                  {verification.user_profiles?.email || 'No email'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{verification.email}</div>
                                <div className="text-gray-500">{verification.phone_number}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge variant="outline" className="w-fit">
                                  {formatIdType(verification.id_type)}
                                </Badge>
                                {isExpired(verification.id_expiry_date) && (
                                  <Badge variant="destructive" className="w-fit text-xs">
                                    ID Expired
                                  </Badge>
                                )}
                                {verification.is_permit_expired && (
                                  <Badge variant="destructive" className="w-fit text-xs">
                                    Permit Expired
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="text-lg font-medium">{verification.verification_score}</div>
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      verification.verification_score >= 80 ? 'bg-green-500' : 
                                      verification.verification_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${verification.verification_score}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(verification.status)} flex items-center gap-1 w-fit`}>
                                {getStatusIcon(verification.status)}
                                {verification.status.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(verification.created_at).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedVerification(verification)
                                      setAdminNotes(verification.admin_notes || "")
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Review
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Verification Details - {verification.business_name}</DialogTitle>
                                    <DialogDescription>
                                      Review and update the verification status for this business
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  {selectedVerification && (
                                    <div className="space-y-6">
                                      {/* Business Information */}
                                      <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                          <h3 className="font-semibold text-lg">Business Information</h3>
                                          <div className="space-y-2">
                                            <div>
                                              <label className="text-sm font-medium text-gray-600">Business Name</label>
                                              <p className="text-sm">{selectedVerification.business_name}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-600">Address</label>
                                              <p className="text-sm">{selectedVerification.business_address}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-600">Contact Person</label>
                                              <p className="text-sm">{selectedVerification.contact_person}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-600">Phone</label>
                                              <p className="text-sm">{selectedVerification.phone_number}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-600">Email</label>
                                              <p className="text-sm">{selectedVerification.email}</p>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="space-y-4">
                                          <h3 className="font-semibold text-lg">Documents & Verification</h3>
                                          <div className="space-y-2">
                                            <div>
                                              <label className="text-sm font-medium text-gray-600">ID Type</label>
                                              <p className="text-sm">{formatIdType(selectedVerification.id_type)}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-600">Permit Expiry</label>
                                              <p className="text-sm">
                                                {selectedVerification.permit_expiry_date || 'Not provided'}
                                                {selectedVerification.is_permit_expired && (
                                                  <Badge variant="destructive" className="ml-2">Expired</Badge>
                                                )}
                                              </p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-600">ID Expiry</label>
                                              <p className="text-sm">
                                                {selectedVerification.id_expiry_date || 'Not provided'}
                                                {selectedVerification.is_id_expired && (
                                                  <Badge variant="destructive" className="ml-2">Expired</Badge>
                                                )}
                                              </p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-600">Verification Score</label>
                                              <p className="text-sm font-medium">{selectedVerification.verification_score}/100</p>
                                            </div>
                                            {selectedVerification.tamper_flags.length > 0 && (
                                              <div>
                                                <label className="text-sm font-medium text-gray-600">Security Flags</label>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                  {selectedVerification.tamper_flags.map((flag, index) => (
                                                    <Badge key={index} variant="destructive" className="text-xs">
                                                      {flag}
                                                    </Badge>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Documents */}
                                      <div className="grid grid-cols-2 gap-6">
                                        <div>
                                          <h4 className="font-medium mb-2">Business Permit</h4>
                                          <div className="border rounded-lg p-4 bg-gray-50">
                                            <a 
                                              href={selectedVerification.business_permit_url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:underline text-sm"
                                            >
                                              View Business Permit Document
                                            </a>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-2">Valid ID</h4>
                                          <div className="border rounded-lg p-4 bg-gray-50">
                                            <a 
                                              href={selectedVerification.valid_id_url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:underline text-sm"
                                            >
                                              View ID Document
                                            </a>
                                          </div>
                                        </div>
                                        {selectedVerification.profile_image_url && (
                                          <div>
                                            <h4 className="font-medium mb-2">Profile Image</h4>
                                            <div className="border rounded-lg p-4 bg-gray-50">
                                              <a 
                                                href={selectedVerification.profile_image_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm"
                                              >
                                                View Profile Image
                                              </a>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Admin Review */}
                                      <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Admin Review</h3>
                                        <div className="space-y-4">
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Status</label>
                                            <Select 
                                              value={selectedVerification.status} 
                                              onValueChange={(value) => {
                                                setSelectedVerification({
                                                  ...selectedVerification,
                                                  status: value
                                                })
                                              }}
                                            >
                                              <SelectTrigger className="mt-1">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="under_review">Under Review</SelectItem>
                                                <SelectItem value="approved">Approved</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                                <SelectItem value="additional_info_required">Additional Info Required</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Admin Notes</label>
                                            <Textarea
                                              value={adminNotes}
                                              onChange={(e) => setAdminNotes(e.target.value)}
                                              placeholder="Add notes about this verification..."
                                              className="mt-1"
                                              rows={3}
                                            />
                                          </div>

                                          <div className="flex gap-2 pt-4">
                                            <Button
                                              onClick={() => updateVerificationStatus(
                                                selectedVerification.id,
                                                selectedVerification.status,
                                                adminNotes
                                              )}
                                              disabled={updatingStatus}
                                              className="bg-blue-600 hover:bg-blue-700"
                                            >
                                              {updatingStatus ? "Updating..." : "Update Status"}
                                            </Button>
                                            <Button
                                              variant="outline"
                                              onClick={() => setSelectedVerification(null)}
                                            >
                                              Cancel
                                            </Button>
                                          </div>
                                        </div>
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
                  </div>
                )}

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
          </TabsContent>

          <TabsContent value="schema" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Table Schema: talyer_owner_verifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {(() => {
                    const schema = parseTableSchema()
                    
                    return (
                      <>
                        {/* Table Structure */}
                        <div>
                          <h3 className="font-semibold mb-3">Table Columns ({schema.columns.length} fields)</h3>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Column Name</TableHead>
                                  <TableHead>Data Type</TableHead>
                                  <TableHead>Constraints</TableHead>
                                  <TableHead>Default</TableHead>
                                  <TableHead>Description</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {schema.columns.map((column, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-mono">{column.name}</TableCell>
                                    <TableCell>{column.type}</TableCell>
                                    <TableCell>
                                      <div className="flex flex-wrap gap-1">
                                        {column.constraints.map((constraint, idx) => (
                                          <Badge key={idx} variant={getConstraintBadgeVariant(constraint)}>
                                            {constraint}
                                          </Badge>
                                        ))}
                                      </div>
                                    </TableCell>
                                    <TableCell className="font-mono">
                                      {column.defaultValue || '-'}
                                    </TableCell>
                                    <TableCell>{column.description}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Constraints Details */}
                        <div>
                          <h3 className="font-semibold mb-3">Constraints ({schema.constraints.length})</h3>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Constraint Name</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Column</TableHead>
                                  <TableHead>Details</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {schema.constraints.map((constraint, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="font-mono text-sm">{constraint.name}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline">{constraint.type}</Badge>
                                    </TableCell>
                                    <TableCell className="font-mono">{constraint.column}</TableCell>
                                    <TableCell className="text-sm">
                                      {constraint.references && (
                                        <div>References: {constraint.references}</div>
                                      )}
                                      {constraint.onDelete && (
                                        <div>On Delete: {constraint.onDelete}</div>
                                      )}
                                      {constraint.condition && (
                                        <div className="font-mono text-xs bg-gray-100 p-1 rounded">
                                          {constraint.condition}
                                        </div>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Indexes */}
                        <div>
                          <h3 className="font-semibold mb-3">Indexes ({schema.indexes.length})</h3>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Index Name</TableHead>
                                  <TableHead>Column</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead>Purpose</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {schema.indexes.map((index, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell className="font-mono text-sm">{index.name}</TableCell>
                                    <TableCell className="font-mono">{index.column}</TableCell>
                                    <TableCell>
                                      <Badge variant="secondary">{index.type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      {index.column === 'user_id' && 'Fast user lookups'}
                                      {index.column === 'status' && 'Filter by verification status'}
                                      {index.column === 'reviewed_by' && 'Admin review queries'}
                                      {index.column === 'created_at' && 'Date-based sorting'}
                                      {index.column === 'verification_score' && 'Score-based filtering'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Triggers */}
                        <div>
                          <h3 className="font-semibold mb-3">Triggers ({schema.triggers.length})</h3>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Trigger Name</TableHead>
                                  <TableHead>Event</TableHead>
                                  <TableHead>Timing</TableHead>
                                  <TableHead>Function</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {schema.triggers.map((trigger, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell className="font-mono text-sm">{trigger.name}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline">{trigger.event}</Badge>
                                    </TableCell>
                                    <TableCell>{trigger.timing}</TableCell>
                                    <TableCell className="font-mono text-sm">{trigger.function}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </>
                    )
                  })()}

                  {/* SQL Schema */}
                  <div>
                    <h3 className="font-semibold mb-3">Complete SQL Schema</h3>
                    <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm whitespace-pre-wrap">
{`CREATE TABLE public.talyer_owner_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_name character varying NOT NULL,
  business_permit_url text NOT NULL,
  valid_id_url text NOT NULL,
  profile_image_url text NULL,
  id_type character varying NOT NULL DEFAULT 'national_id'::character varying,
  permit_expiry_date date NULL,
  id_expiry_date date NULL,
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  admin_notes text NULL,
  reviewed_by uuid NULL,
  reviewed_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  business_address text NULL,
  contact_person character varying NULL,
  phone_number character varying NULL,
  email character varying NULL,
  is_permit_expired boolean NOT NULL DEFAULT false,
  is_id_expired boolean NOT NULL DEFAULT false,
  tamper_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  verification_score integer NOT NULL DEFAULT 0,
  
  CONSTRAINT talyer_owner_verifications_pkey PRIMARY KEY (id),
  CONSTRAINT talyer_owner_verifications_user_id_key UNIQUE (user_id),
  CONSTRAINT talyer_owner_verifications_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) REFERENCES auth.users (id) ON DELETE SET NULL,
  CONSTRAINT talyer_owner_verifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT talyer_owner_verifications_score_check 
    CHECK (verification_score >= 0 AND verification_score <= 100),
  CONSTRAINT talyer_owner_verifications_id_type_check 
    CHECK (id_type::text = ANY (ARRAY[
      'drivers_license'::character varying,
      'umid'::character varying,
      'national_id'::character varying,
      'passport'::character varying,
      'philsys_id'::character varying,
      'other'::character varying
    ]::text[])),
  CONSTRAINT talyer_owner_verifications_status_check 
    CHECK (status::text = ANY (ARRAY[
      'pending'::character varying,
      'under_review'::character varying,
      'approved'::character varying,
      'rejected'::character varying,
      'additional_info_required'::character varying
    ]::text[]))
) TABLESPACE pg_default;

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_talyer_verifications_user_id 
  ON public.talyer_owner_verifications USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_talyer_verifications_status 
  ON public.talyer_owner_verifications USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_talyer_verifications_reviewed_by 
  ON public.talyer_owner_verifications USING btree (reviewed_by) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_talyer_verifications_created_at 
  ON public.talyer_owner_verifications USING btree (created_at) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_talyer_verifications_score 
  ON public.talyer_owner_verifications USING btree (verification_score) TABLESPACE pg_default;

-- Trigger for status updates
CREATE TRIGGER trigger_update_talyer_owner_status
  AFTER UPDATE ON talyer_owner_verifications 
  FOR EACH ROW
  EXECUTE FUNCTION update_talyer_owner_status();`}
                      </pre>
                    </div>
                  </div>

                  {/* Constraints and Business Rules */}
                  <div>
                    <h3 className="font-semibold mb-3">Constraints & Business Rules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">CHECK Constraints</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm">
                            <strong>id_type:</strong> Must be one of: drivers_license, umid, national_id, passport, philsys_id, other
                          </div>
                          <div className="text-sm">
                            <strong>status:</strong> Must be one of: pending, under_review, approved, rejected, additional_info_required
                          </div>
                          <div className="text-sm">
                            <strong>verification_score:</strong> Must be between 0 and 100 (inclusive)
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Foreign Key References</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm">
                            <strong>user_id:</strong> References auth.users(id) - The shop owner (CASCADE delete)
                          </div>
                          <div className="text-sm">
                            <strong>reviewed_by:</strong> References auth.users(id) - Admin who reviewed (SET NULL on delete)
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Unique Constraints</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm">
                            <strong>user_id:</strong> Each user can only have one verification record
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Performance Features</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm">
                            <strong>Indexes:</strong> 5 BTREE indexes for fast queries
                          </div>
                          <div className="text-sm">
                            <strong>Trigger:</strong> Automatic status update handling
                          </div>
                          <div className="text-sm">
                            <strong>Tablespace:</strong> pg_default for optimal storage
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  )
}
