"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Activity } from "lucide-react"

interface AuditLog {
  id: string
  user_id: string | null
  role: 'customer' | 'mechanic' | 'talyer_owner' | 'admin' | 'super_admin' | 'system'
  action: string
  table_name: string | null
  record_id: string | null
  old_values: any
  new_values: any
  additional_data: any
  success: boolean
  error_message: string | null
  created_at: string
}

interface AdminActivityLog {
  id: string
  admin_id: string
  action_type: string
  target_type: string
  target_id: string
  action_details: any
  created_at: string
}

interface SecurityLog {
  id: string
  user_id: string
  action_type: string
  success: boolean
  failure_reason: string | null
  details: any
  created_at: string
}

type CombinedLog = (AuditLog | AdminActivityLog | SecurityLog) & { 
  source: 'audit_logs' | 'admin_activity_logs' | 'account_security_logs'
}

export default function SystemAuditPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [adminActivityLogs, setAdminActivityLogs] = useState<AdminActivityLog[]>([])
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [auditFilter, setAuditFilter] = useState('all')

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    setLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.log("No authenticated user, loading mock audit logs")
        loadMockAuditLogs()
        return
      }

      // Fetch from all audit tables with user names
      const [auditLogsRes, adminLogsRes, securityLogsRes] = await Promise.all([
        supabase
          .from('audit_logs')
          .select('*, user_profiles!audit_logs_user_id_fkey(first_name, last_name)')
          .order('created_at', { ascending: false })
          .limit(50),
        
        supabase
          .from('admin_activity_logs')
          .select('*, user_profiles!admin_activity_logs_admin_id_fkey(first_name, last_name)')
          .order('created_at', { ascending: false })
          .limit(50),
          
        supabase
          .from('account_security_logs')
          .select('*, user_profiles!account_security_logs_user_id_fkey(first_name, last_name)')
          .order('created_at', { ascending: false })
          .limit(50)
      ])

      if (auditLogsRes.error && adminLogsRes.error && securityLogsRes.error) {
        console.error("Error fetching audit logs:", auditLogsRes.error)
        loadMockAuditLogs()
        return
      }

      // Set the data for each log type with user names
      const processLogs = (logs: any[]) => logs?.map(log => ({
        ...log,
        user_name: log.user_profiles ? `${log.user_profiles.first_name} ${log.user_profiles.last_name}` : null
      })) || []

      setAuditLogs(processLogs(auditLogsRes.data))
      setAdminActivityLogs(processLogs(adminLogsRes.data))
      setSecurityLogs(processLogs(securityLogsRes.data))
      
    } catch (error) {
      console.error("Error fetching audit logs:", error)
      loadMockAuditLogs()
    } finally {
      setLoading(false)
    }
  }

  const loadMockAuditLogs = () => {
    const mockAuditLogs: AuditLog[] = [
      {
        id: "audit-001",
        user_id: "550e8400-e29b-41d4-a716-446655440201",
        role: "admin",
        action: "UPDATE",
        table_name: "user_profiles",
        record_id: "550e8400-e29b-41d4-a716-446655440001",
        old_values: { status: "pending" },
        new_values: { status: "approved" },
        additional_data: {},
        success: true,
        error_message: null,
        created_at: new Date().toISOString(),
        user_name: "Juan Dela Cruz"
      } as any
    ]

    const mockAdminActivityLogs: AdminActivityLog[] = []
    const mockSecurityLogs: SecurityLog[] = []
    
    setAuditLogs(mockAuditLogs)
    setAdminActivityLogs(mockAdminActivityLogs)
    setSecurityLogs(mockSecurityLogs)
  }

  const combinedLogs: CombinedLog[] = [
    ...auditLogs.map(log => ({ ...log, source: 'audit_logs' as const })),
    ...adminActivityLogs.map(log => ({ ...log, source: 'admin_activity_logs' as const })),
    ...securityLogs.map(log => ({ ...log, source: 'account_security_logs' as const })),
  ]
    .filter(log => {
      if (auditFilter === 'all') return true
      if (auditFilter === 'audit_logs') return log.source === 'audit_logs'
      if (auditFilter === 'admin_activity') return log.source === 'admin_activity_logs'
      if (auditFilter === 'security') return log.source === 'account_security_logs'
      return true
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            System Audit Trail
          </h1>
          <p className="text-lg text-gray-600">View all system activities including audit logs, admin actions, and security events</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2 border-blue-300 bg-blue-50 text-blue-700 rounded-full">
          <Activity className="h-4 w-4 mr-2" />
          {combinedLogs.length} entries
        </Badge>
      </div>

      <Card className="admin-card">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">Comprehensive Audit Trail</CardTitle>
              <CardDescription className="text-gray-600">Monitor all system activities and changes</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex gap-4">
              <Select value={auditFilter} onValueChange={setAuditFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by log type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audit Logs</SelectItem>
                  <SelectItem value="audit_logs">General Audit</SelectItem>
                  <SelectItem value="admin_activity">Admin Activities</SelectItem>
                  <SelectItem value="security">Security Events</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline">
                {combinedLogs.length} entries
              </Badge>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User/Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Record ID</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {combinedLogs.map((log) => (
                      <TableRow key={`${log.source}-${log.id}`}>
                        <TableCell>
                          <Badge variant={
                            log.source === 'audit_logs' ? 'default' : 
                            log.source === 'admin_activity_logs' ? 'secondary' : 'outline'
                          }>
                            {log.source === 'audit_logs' ? 'Audit' :
                             log.source === 'admin_activity_logs' ? 'Admin' : 'Security'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{(log as any).role || 'user'}</Badge>
                            <span className="text-sm text-gray-600">
                              {(log as any).user_name || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={(log as any).action === 'UPDATE' ? 'default' : 'secondary'}>
                            {(log as any).action || (log as any).action_type || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {(log as any).table_name || (log as any).target_type || 'N/A'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {(log as any).record_id ? (log as any).record_id.substring(0, 8) + '...' : 
                           (log as any).target_id ? (log as any).target_id.substring(0, 8) + '...' : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  {log.source === 'audit_logs' ? 'Audit Log Details' :
                                   log.source === 'admin_activity_logs' ? 'Admin Activity Details' : 'Security Log Details'}
                                </DialogTitle>
                                <DialogDescription>
                                  Details from {new Date(log.created_at).toLocaleString()}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-600 mb-2">
                                      {log.source === 'admin_activity_logs' ? 'Action Details' : 'Old Values'}
                                    </h4>
                                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-64">
                                      {JSON.stringify((log as any).old_values || {}, null, 2)}
                                    </pre>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-600 mb-2">New Values</h4>
                                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-64">
                                      {JSON.stringify((log as any).new_values || (log as any).action_details || {}, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                                {(log as any).additional_data && Object.keys((log as any).additional_data).length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-600 mb-2">Additional Data</h4>
                                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-64">
                                      {JSON.stringify((log as any).additional_data || {}, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                    {combinedLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
