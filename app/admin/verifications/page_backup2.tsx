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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, Check, X, Clock, AlertTriangle, FileText, Image as ImageIcon } from "lucide-react"

interface Verification {
  id: string
  user_id: string
  business_name: string
  business_permit_url: string
  valid_id_url: string
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
  is_permit_expired: boolean | null
  is_id_expired: boolean | null
  tamper_flags: any[] | null
  verification_score: number | null
  user?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchVerifications()
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('verifications_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'talyer_owner_verifications' },
        () => {
          fetchVerifications()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchVerifications = async () => {
    try {
      setError("")
      
      // Try to fetch from Supabase first
      try {
        const { data: verificationsData, error } = await supabase
          .from('talyer_owner_verifications')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error("Supabase error:", error)
          // If permission denied or any error, use mock data
          await loadMockData()
          return
        }

        // Then get user profiles separately
        const userIds = verificationsData?.map(v => v.user_id) || []
        let userProfiles: any[] = []
        
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, first_name, last_name, email')
            .in('id', userIds)
          
          if (profilesError) {
            console.error("User profiles error:", profilesError)
            // Use mock data if profiles can't be fetched
            await loadMockData()
            return
          }
          
          userProfiles = profiles || []
        }

        // Combine the data
        const verificationsWithProfiles = verificationsData?.map(verification => ({
          ...verification,
          user: userProfiles.find(profile => profile.id === verification.user_id)
        })) || []

        setVerifications(verificationsWithProfiles)
        console.log("Successfully loaded from Supabase:", verificationsWithProfiles.length, "records")
        
      } catch (supabaseError) {
        console.error("Supabase connection error:", supabaseError)
        await loadMockData()
      }
      
    } catch (error: any) {
      console.error("General error:", error)
      setError("Failed to load verifications. Using demo data.")
      await loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = async () => {
    console.log("Loading mock verification data...")
    
    const mockVerifications: Verification[] = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        user_id: "550e8400-e29b-41d4-a716-446655440101",
        business_name: "Juan's Auto Repair Shop",
        business_permit_url: "https://example.com/permits/permit1.jpg",
        valid_id_url: "https://example.com/ids/id1.jpg",
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
        user: {
          id: "550e8400-e29b-41d4-a716-446655440101",
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
        user: {
          id: "550e8400-e29b-41d4-a716-446655440102",
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
        user: {
          id: "550e8400-e29b-41d4-a716-446655440103",
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
        user: {
          id: "550e8400-e29b-41d4-a716-446655440104",
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
        user: {
          id: "550e8400-e29b-41d4-a716-446655440105",
          first_name: "Rajesh",
          last_name: "Singh",
          email: "rajesh.singh@gmail.com"
        }
      }
    ]

    setVerifications(mockVerifications)
    console.log("Mock data loaded successfully:", mockVerifications.length, "records")
  }

  const updateVerificationStatus = async (verificationId: string, newStatus: string, notes: string = "") => {
    try {
      setError("")
      
      // Try to update in Supabase first
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        const { error } = await supabase
          .from('talyer_owner_verifications')
          .update({
            status: newStatus,
            admin_notes: notes,
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', verificationId)

        if (error) {
          console.error("Supabase update error:", error)
          // Fall back to local mock update
          updateMockVerification(verificationId, newStatus, notes)
          return
        }

        setSuccess(`Verification ${newStatus} successfully in database!`)
        fetchVerifications()
        
      } catch (supabaseError) {
        console.error("Supabase connection error:", supabaseError)
        // Fall back to local mock update
        updateMockVerification(verificationId, newStatus, notes)
      }
      
      setSelectedVerification(null)
      setAdminNotes("")
      
      // Auto-clear success message
      setTimeout(() => setSuccess(""), 3000)
    } catch (error: any) {
      setError(error.message)
      // Auto-clear error message
      setTimeout(() => setError(""), 5000)
    }
  }

  const updateMockVerification = (verificationId: string, newStatus: string, notes: string) => {
    console.log(`Mock update: Verification ${verificationId} status changed to ${newStatus}`)
    
    setVerifications(prev => 
      prev.map(verification => 
        verification.id === verificationId 
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
    
    setSuccess(`Verification ${newStatus} successfully (demo mode)!`)
  }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'additional_info_required': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'under_review': return <Eye className="h-4 w-4" />
      case 'approved': return <Check className="h-4 w-4" />
      case 'rejected': return <X className="h-4 w-4" />
      case 'additional_info_required': return <AlertTriangle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch = searchTerm === "" || 
      verification.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || verification.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Business Verifications</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Verifications</h1>
          <p className="text-gray-600">Review and approve shop owner verification requests</p>
        </div>
        <Badge variant="outline">
          {filteredVerifications.length} verifications
        </Badge>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by business name, owner name, or email..."
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
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="additional_info_required">Additional Info Required</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Verifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
        </CardHeader>
        <CardContent>
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
                {filteredVerifications.map(verification => (
                  <TableRow key={verification.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{verification.business_name}</div>
                        <div className="text-sm text-gray-500">{verification.business_address}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {verification.user?.first_name} {verification.user?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{verification.contact_person}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{verification.email || verification.user?.email}</div>
                        <div className="text-sm text-gray-500">{verification.phone_number}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{verification.id_type.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{verification.verification_score || 0}/100</span>
                        {verification.tamper_flags && verification.tamper_flags.length > 0 && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        {verification.is_permit_expired && (
                          <Badge variant="destructive" className="text-xs">Permit Expired</Badge>
                        )}
                        {verification.is_id_expired && (
                          <Badge variant="destructive" className="text-xs">ID Expired</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(verification.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(verification.status)}
                          {verification.status.replace('_', ' ')}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(verification.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedVerification(verification)
                              setAdminNotes(verification.admin_notes || "")
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Verification Details</DialogTitle>
                            <DialogDescription>
                              Review business documents and approve or reject the verification
                            </DialogDescription>
                          </DialogHeader>
                          {selectedVerification && (
                            <div className="space-y-6">
                              {/* Business Information */}
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <h3 className="font-semibold mb-3">Business Information</h3>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Business Name:</strong> {selectedVerification.business_name}</div>
                                    <div><strong>Address:</strong> {selectedVerification.business_address || 'Not provided'}</div>
                                    <div><strong>Contact Person:</strong> {selectedVerification.contact_person || 'Not provided'}</div>
                                    <div><strong>Phone:</strong> {selectedVerification.phone_number || 'Not provided'}</div>
                                    <div><strong>Email:</strong> {selectedVerification.email || selectedVerification.user?.email}</div>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-3">Verification Details</h3>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Owner:</strong> {selectedVerification.user?.first_name} {selectedVerification.user?.last_name}</div>
                                    <div><strong>ID Type:</strong> {selectedVerification.id_type.replace('_', ' ')}</div>
                                    <div>
                                      <strong>ID Expiry:</strong> 
                                      <span className={selectedVerification.is_id_expired ? "text-red-600 ml-1" : "ml-1"}>
                                        {selectedVerification.id_expiry_date ? new Date(selectedVerification.id_expiry_date).toLocaleDateString() : 'Not provided'}
                                        {selectedVerification.is_id_expired && " (EXPIRED)"}
                                      </span>
                                    </div>
                                    <div>
                                      <strong>Permit Expiry:</strong> 
                                      <span className={selectedVerification.is_permit_expired ? "text-red-600 ml-1" : "ml-1"}>
                                        {selectedVerification.permit_expiry_date ? new Date(selectedVerification.permit_expiry_date).toLocaleDateString() : 'Not provided'}
                                        {selectedVerification.is_permit_expired && " (EXPIRED)"}
                                      </span>
                                    </div>
                                    <div><strong>Verification Score:</strong> <span className="font-medium">{selectedVerification.verification_score || 0}/100</span></div>
                                    <div><strong>Submitted:</strong> {new Date(selectedVerification.created_at).toLocaleString()}</div>
                                    {selectedVerification.reviewed_at && (
                                      <div><strong>Last Reviewed:</strong> {new Date(selectedVerification.reviewed_at).toLocaleString()}</div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Tamper Flags Warning */}
                              {selectedVerification.tamper_flags && selectedVerification.tamper_flags.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <h3 className="font-semibold text-red-800">Security Warnings</h3>
                                  </div>
                                  <div className="space-y-1">
                                    {selectedVerification.tamper_flags.map((flag, index) => (
                                      <div key={index} className="text-sm text-red-700">• {flag}</div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Documents */}
                              <div>
                                <h3 className="font-semibold mb-3">Documents</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="border rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <FileText className="h-4 w-4" />
                                      <span className="font-medium">Business Permit</span>
                                    </div>
                                    {selectedVerification.business_permit_url ? (
                                      <div className="space-y-2">
                                        <img 
                                          src={selectedVerification.business_permit_url} 
                                          alt="Business Permit"
                                          className="w-full h-48 object-cover rounded border"
                                        />
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => window.open(selectedVerification.business_permit_url, '_blank')}
                                        >
                                          <ImageIcon className="h-4 w-4 mr-2" />
                                          View Full Size
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="text-sm text-gray-500">No document uploaded</div>
                                    )}
                                  </div>
                                  
                                  <div className="border rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <FileText className="h-4 w-4" />
                                      <span className="font-medium">Valid ID</span>
                                    </div>
                                    {selectedVerification.valid_id_url ? (
                                      <div className="space-y-2">
                                        <img 
                                          src={selectedVerification.valid_id_url} 
                                          alt="Valid ID"
                                          className="w-full h-48 object-cover rounded border"
                                        />
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => window.open(selectedVerification.valid_id_url, '_blank')}
                                        >
                                          <ImageIcon className="h-4 w-4 mr-2" />
                                          View Full Size
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="text-sm text-gray-500">No document uploaded</div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Admin Notes */}
                              <div>
                                <h3 className="font-semibold mb-3">Admin Notes</h3>
                                <Textarea
                                  placeholder="Add notes about this verification..."
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  rows={3}
                                />
                              </div>

                              {/* Status and Actions */}
                              <div className="flex items-center justify-between pt-4 border-t">
                                <div>
                                  <span className="text-sm text-gray-500">Current Status: </span>
                                  <Badge className={getStatusColor(selectedVerification.status)}>
                                    {selectedVerification.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="destructive"
                                    onClick={() => updateVerificationStatus(selectedVerification.id, 'rejected', adminNotes)}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => updateVerificationStatus(selectedVerification.id, 'additional_info_required', adminNotes)}
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Request More Info
                                  </Button>
                                  <Button
                                    onClick={() => updateVerificationStatus(selectedVerification.id, 'approved', adminNotes)}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredVerifications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No verifications found
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
