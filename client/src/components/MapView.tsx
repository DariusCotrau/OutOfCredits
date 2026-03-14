import { useState, useCallback, useRef } from 'react'
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
  clickableIcons: false,
}

const sourceLabels: Record<string, string> = {
  imobiliare: 'imobiliare.ro',
  olx: 'OLX',
  storia: 'storia.ro',
}

function markerIcon(score: number | undefined, selected: boolean): google.maps.Symbol {
  let fill = '#6b7280'
  if (score !== undefined) {
    fill = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444'
  }
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: selected ? 14 : 10,
    fillColor: selected ? '#2563eb' : fill,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: selected ? 3 : 2,
  }
}

interface MapViewProps {
  listings: Listing[]
  singleListing?: boolean
  height?: string
  selectedId?: number
  onMarkerClick?: (listing: Listing) => void
}

export default function MapView({
  listings,
  singleListing = false,
  height = '500px',
  selectedId,
  onMarkerClick,
}: MapViewProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
  const [infoListing, setInfoListing] = useState<Listing | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? '',
    id: 'google-map-script',
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const handleMarkerClick = useCallback(
    (listing: Listing) => {
      setInfoListing(listing)
      onMarkerClick?.(listing)
      mapRef.current?.panTo({ lat: listing.lat, lng: listing.lng })
    },
    [onMarkerClick]
  )

  const handleMapClick = useCallback(() => {
    setInfoListing(null)
  }, [])

  // sync infoWindow when selectedId changes from outside
  const prevSelectedId = useRef<number | undefined>(undefined)
  if (selectedId !== prevSelectedId.current) {
    prevSelectedId.current = selectedId
    if (selectedId !== undefined) {
      const l = listings.find((x) => x.id === selectedId)
      if (l) {
        setInfoListing(l)
        mapRef.current?.panTo({ lat: l.lat, lng: l.lng })
      }
    }
  }

  if (!apiKey) {
    return (
      <div
        className="w-full rounded-2xl flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 text-gray-400"
        style={{ height }}
      >
        <p className="text-sm font-medium">Cheia Google Maps lipsește</p>
        <p className="text-xs mt-1">
          Adaugă <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> în{' '}
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
    return <div className="w-full rounded-2xl bg-gray-100 animate-pulse" style={{ height }} />
  }

  const center =
    singleListing && listings[0]
      ? { lat: listings[0].lat, lng: listings[0].lng }
      : TIMISOARA_CENTER

  const zoom = singleListing ? 15 : 13

  return (
    <div className="w-full overflow-hidden" style={{ height }}>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={zoom}
        options={MAP_OPTIONS}
        onLoad={onLoad}
        onClick={handleMapClick}
      >
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={{ lat: listing.lat, lng: listing.lng }}
            onClick={() => handleMarkerClick(listing)}
            icon={markerIcon(listing.score, listing.id === selectedId)}
            zIndex={listing.id === selectedId ? 10 : 1}
          />
        ))}

        {infoListing && (
          <InfoWindow
            position={{ lat: infoListing.lat, lng: infoListing.lng }}
            onCloseClick={() => setInfoListing(null)}
            options={{ pixelOffset: new window.google.maps.Size(0, -12) }}
          >
            <div className="max-w-[210px] text-sm">
              <img
                src={infoListing.imageUrl}
                alt={infoListing.title}
                className="w-full h-24 object-cover rounded-lg mb-2"
                onError={(e) => {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
              <p className="font-semibold text-gray-900 leading-tight mb-1 line-clamp-2">
                {infoListing.title}
              </p>
              <p className="text-blue-600 font-bold text-base mb-1">
                {infoListing.price}{' '}
                <span className="text-xs font-normal text-gray-400">EUR/lună</span>
              </p>
              <p className="text-gray-500 text-xs mb-1">{infoListing.neighborhood}</p>
              {infoListing.score !== undefined && (
                <span
                  className={clsx(
                    'inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2',
                    infoListing.score >= 80
                      ? 'bg-green-100 text-green-700'
                      : infoListing.score >= 60
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  Scor {infoListing.score}
                </span>
              )}
              <p className="text-gray-400 text-xs mb-2">{sourceLabels[infoListing.source]}</p>
              <Link
                to={`/listings/${infoListing.id}`}
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
