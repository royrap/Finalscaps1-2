"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import RoleGuard from "@/components/RoleGuard"
import RequestsSection from "./sections/RequestsSection"
import CustomersSection from "./sections/CustomersSection"
import MechanicsSection from "./sections/MechanicsSection"
import PaymentsSection from "./sections/PaymentsSection"
import DisputesSection from "./sections/DisputesSection"
import LogsSection from "./sections/LogsSection"

export default function AdminDashboard() {
  const [tab, setTab] = useState("requests")

  return (
    <RoleGuard allowedRoles={['admin', 'super_admin']}>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="mechanics">Mechanics</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="requests">
            <RequestsSection />
          </TabsContent>
          <TabsContent value="customers">
            <CustomersSection />
          </TabsContent>
          <TabsContent value="mechanics">
            <MechanicsSection />
          </TabsContent>
          <TabsContent value="payments">
            <PaymentsSection />
          </TabsContent>
          <TabsContent value="disputes">
            <DisputesSection />
          </TabsContent>
          <TabsContent value="logs">
            <LogsSection />
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  )
}
