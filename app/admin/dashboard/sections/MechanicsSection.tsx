"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Mechanic {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  is_verified: boolean
  company_name: string | null
  valid_id_url: string | null
  business_permit_url: string | null
  jobs: { id: string; title: string; status: string }[]
}

export default function MechanicsSection() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchMechanics()
    const sub = supabase
      .channel('service_providers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_providers' }, fetchMechanics)
      .subscribe()
    return () => { sub.unsubscribe() }
  }, [])

  async function fetchMechanics() {
    const { data, error } = await supabase
      .from("service_providers")
      .select(`id, company_name, is_verified, user_profiles!user_id (first_name, last_name, email, phone_number), talyer_owner_verifications(valid_id_url, business_permit_url), jobs:service_requests(id, title, status)`) // join user_profiles, verifications, jobs
      .order("created_at", { ascending: false })
    if (!error) setMechanics(
      (data || []).map((m: any) => ({
        id: m.id,
        first_name: m.user_profiles?.first_name || "",
        last_name: m.user_profiles?.last_name || "",
        email: m.user_profiles?.email || "",
        phone_number: m.user_profiles?.phone_number || "",
        is_verified: m.is_verified,
        company_name: m.company_name,
        valid_id_url: m.talyer_owner_verifications?.valid_id_url || null,
        business_permit_url: m.talyer_owner_verifications?.business_permit_url || null,
        jobs: m.jobs || [],
      }))
    )
  }

  const filtered = mechanics.filter(m =>
    m.first_name.toLowerCase().includes(search.toLowerCase()) ||
    m.last_name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center mb-4">
        <Input placeholder="Search mechanics..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Mechanics & Shop Owners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Valid ID</TableHead>
                  <TableHead>Business Permit</TableHead>
                  <TableHead>Jobs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(m => (
                  <TableRow key={m.id}>
                    <TableCell>{m.first_name} {m.last_name}</TableCell>
                    <TableCell>{m.email}</TableCell>
                    <TableCell>{m.phone_number}</TableCell>
                    <TableCell>{m.is_verified ? "Yes" : "No"}</TableCell>
                    <TableCell>{m.company_name || "-"}</TableCell>
                    <TableCell>{m.valid_id_url ? <a href={m.valid_id_url} target="_blank" rel="noopener noreferrer">View</a> : "-"}</TableCell>
                    <TableCell>{m.business_permit_url ? <a href={m.business_permit_url} target="_blank" rel="noopener noreferrer">View</a> : "-"}</TableCell>
                    <TableCell>
                      {m.jobs && m.jobs.length > 0 ? (
                        <ul className="list-disc ml-4">
                          {m.jobs.map(j => (
                            <li key={j.id}>{j.title} ({j.status})</li>
                          ))}
                        </ul>
                      ) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center">No mechanics found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
