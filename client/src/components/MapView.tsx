import { useState, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import type { Listing } from '../types'

const TIMISOARA_CENTER = { lat: 45.7489, lng: 21.2087 }

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' }

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
}

const scoreColor = (score?: number) => {
  if (!score) return '#6b7280'
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#eab308'
  return '#ef4444'
}

const sourceLabels: Record<string, string> = {
  imobiliare: 'imobiliare.ro',
  olx: 'OLX',
  storia: 'storia.ro',
}

interface MapViewProps {
  listings: Listing[]
  /** Single-listing mode: centers and zooms on this listing */
  singleListing?: boolean
  height?: string
}

export default function MapView({ listings, singleListing = false, height = '500px' }: MapViewProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
  const [selected, setSelected] = useState<Listing | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? '',
    id: 'google-map-script',
  })

  const handleMarkerClick = useCallback((listing: Listing) => {
    setSelected(listing)
  }, [])

  const handleMapClick = useCallback(() => {
    setSelected(null)
  }, [])

  if (!apiKey) {
    return (
      <div
        className="w-full rounded-2xl flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 text-gray-400"
        style={{ height }}
      >
        <p className="text-sm font-medium">Cheia Google Maps lipsește</p>
        <p className="text-xs mt-1">
          Adaugă <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> în fișierul{' '}
          <code className="bg-gray-100 px-1 rounded">.env</code>
        </p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div
        className="w-full rounded-2xl flex items-center justify-center bg-red-50 border border-red-200 text-red-500 text-sm"
        style={{ height }}
      >
        Eroare la încărcarea hărții Google Maps.
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div
        className="w-full rounded-2xl flex items-center justify-center bg-gray-100 animate-pulse"
        style={{ height }}
      />
    )
  }

  const center = singleListing && listings[0]
    ? { lat: listings[0].lat, lng: listings[0].lng }
    : TIMISOARA_CENTER

  const zoom = singleListing ? 15 : 13

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-gray-200" style={{ height }}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={zoom}
        options={MAP_OPTIONS}
        onClick={handleMapClick}
      >
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={{ lat: listing.lat, lng: listing.lng }}
            onClick={() => handleMarkerClick(listing)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: scoreColor(listing.score),
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
          />
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div className="max-w-[220px] text-sm">
              <img
                src={selected.imageUrl}
                alt={selected.title}
                className="w-full h-28 object-cover rounded-lg mb-2"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
              <p className="font-semibold text-gray-900 leading-tight mb-1 line-clamp-2">
                {selected.title}
              </p>
              <p className="text-blue-600 font-bold text-base mb-1">
                {selected.price} <span className="text-xs font-normal text-gray-400">EUR/lună</span>
              </p>
              <p className="text-gray-500 text-xs mb-1">{selected.neighborhood}</p>
              {selected.score !== undefined && (
                <span
                  className={clsx(
                    'inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2',
                    selected.score >= 80
                      ? 'bg-green-100 text-green-700'
                      : selected.score >= 60
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  Scor {selected.score}
                </span>
              )}
              <p className="text-gray-400 text-xs mb-2">{sourceLabels[selected.source]}</p>
              <Link
                to={`/listings/${selected.id}`}
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
              >
                Vezi detalii
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}
