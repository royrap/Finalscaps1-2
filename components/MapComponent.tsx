"use client"

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapComponentProps {
  locations: Array<{
    id: string
    lat: number
    lng: number
    title: string
    status?: string
    type: 'customer' | 'provider' | 'request'
  }>
}

export default function MapComponent({ locations }: MapComponentProps) {
  const center: [number, number] = locations.length > 0 
    ? [locations[0].lat, locations[0].lng] 
    : [14.5995, 120.9842] // Manila default

  const getMarkerColor = (type: string, status?: string) => {
    switch (type) {
      case 'customer': return '#3b82f6' // blue
      case 'provider': return '#10b981' // green
      case 'request':
        switch (status) {
          case 'pending': return '#f59e0b' // yellow
          case 'in_progress': return '#8b5cf6' // purple
          case 'completed': return '#10b981' // green
          default: return '#6b7280' // gray
        }
      default: return '#6b7280'
    }
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.lat, location.lng]}
        >
          <Popup>
            <div>
              <strong>{location.title}</strong>
              <br />
              Type: {location.type}
              {location.status && (
                <>
                  <br />
                  Status: {location.status}
                </>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
