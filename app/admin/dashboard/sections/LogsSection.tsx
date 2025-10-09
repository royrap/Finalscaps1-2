"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Log {
  id: string
  admin_id: string
  action_type: string
  target_type: string
  target_id: string
  action_details: any
  ip_address: string | null
  user_agent: string | null
  session_id: string | null
  created_at: string
}

export default function LogsSection() {
  const [logs, setLogs] = useState<Log[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchLogs()
    const sub = supabase
      .channel('admin_activity_logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_activity_logs' }, fetchLogs)
      .subscribe()
    return () => { sub.unsubscribe() }
  }, [])

  async function fetchLogs() {
    const { data, error } = await supabase
      .from("admin_activity_logs")
      .select("id, admin_id, action_type, target_type, target_id, action_details, ip_address, user_agent, session_id, created_at")
      .order("created_at", { ascending: false })
    if (!error) setLogs(data || [])
  }

  const filtered = logs.filter(l =>
    l.action_type.toLowerCase().includes(search.toLowerCase()) ||
    l.target_type.toLowerCase().includes(search.toLowerCase()) ||
    l.target_id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center mb-4">
        <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>User Agent</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(l => (
                  <TableRow key={l.id}>
                    <TableCell>{l.admin_id}</TableCell>
                    <TableCell>{l.action_type}</TableCell>
                    <TableCell>{l.target_type} ({l.target_id})</TableCell>
                    <TableCell><pre className="whitespace-pre-wrap text-xs">{JSON.stringify(l.action_details, null, 2)}</pre></TableCell>
                    <TableCell>{l.ip_address || "-"}</TableCell>
                    <TableCell>{l.user_agent || "-"}</TableCell>
                    <TableCell>{l.session_id || "-"}</TableCell>
                    <TableCell>{new Date(l.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center">No logs found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
