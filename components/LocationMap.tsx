"use client"

import dynamic from 'next/dynamic'
import { Card } from "@/components/ui/card"

const MapWithNoSSR = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-200 animate-pulse rounded-md flex items-center justify-center">Loading map...</div>
})

interface LocationMapProps {
  locations: Array<{
    id: string
    lat: number
    lng: number
    title: string
    status?: string
    type: 'customer' | 'provider' | 'request'
  }>
}

export default function LocationMap({ locations }: LocationMapProps) {
  return (
    <Card className="p-4">
      <div className="h-64 w-full">
        <MapWithNoSSR locations={locations} />
      </div>
    </Card>
  )
}
