import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown, ChevronUp, MapPin, BedDouble, Maximize2, GripVertical } from 'lucide-react'
import clsx from 'clsx'
import FilterBar, { type Filters, defaultFilters } from '../components/FilterBar'
import MapView from '../components/MapView'
import { mockListings } from '../data/mockListings'
import type { Listing } from '../types'

function applyFilters(listings: Listing[], filters: Filters): Listing[] {
  let result = [...listings]

  if (filters.priceMin !== '') result = result.filter((l) => l.price >= Number(filters.priceMin))
  if (filters.priceMax !== '') result = result.filter((l) => l.price <= Number(filters.priceMax))
  if (filters.rooms.length > 0) {
    result = result.filter((l) => {
      if (filters.rooms.includes(3) && l.rooms >= 3) return true
      return filters.rooms.includes(l.rooms)
    })
  }
  if (filters.neighborhoods.length > 0)
    result = result.filter((l) => filters.neighborhoods.includes(l.neighborhood))
  if (filters.sources.length > 0)
    result = result.filter((l) => filters.sources.includes(l.source))

  switch (filters.sortBy) {
    case 'score':      result.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)); break
    case 'price_asc':  result.sort((a, b) => a.price - b.price); break
    case 'price_desc': result.sort((a, b) => b.price - a.price); break
    case 'date':       result.sort((a, b) => b.postedAt.localeCompare(a.postedAt)); break
  }

  return result
}

const sourceColors: Record<string, string> = {
  imobiliare: 'bg-orange-100 text-orange-700',
  olx: 'bg-purple-100 text-purple-700',
  storia: 'bg-green-100 text-green-700',
}
const sourceLabels: Record<string, string> = {
  imobiliare: 'imobiliare.ro',
  olx: 'OLX',
  storia: 'storia.ro',
}

function MiniCard({
  listing,
  selected,
  onClick,
}: {
  listing: Listing
  selected: boolean
  onClick: () => void
}) {
  const scoreColor =
    listing.score === undefined
      ? 'bg-gray-100 text-gray-500'
      : listing.score >= 80
      ? 'bg-green-500 text-white'
      : listing.score >= 60
      ? 'bg-yellow-400 text-yellow-900'
      : 'bg-red-400 text-white'

  return (
    <div
      onClick={onClick}
      className={clsx(
        'flex gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all border',
        selected
          ? 'border-blue-500 bg-blue-50 shadow-sm'
          : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
      )}
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-blue-100 to-blue-200">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">
          {listing.title}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-bold text-blue-600">{listing.price} €</span>
          {listing.score !== undefined && (
            <span className={clsx('text-xs font-bold px-1.5 py-0.5 rounded-full', scoreColor)}>
              {listing.score}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
          <span className="flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            {listing.neighborhood}
          </span>
          <span className="flex items-center gap-0.5">
            <BedDouble className="w-3 h-3" />
            {listing.rooms === 1 ? 'Gars.' : `${listing.rooms}cam`}
          </span>
          <span className="flex items-center gap-0.5">
            <Maximize2 className="w-3 h-3" />
            {listing.area}m²
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span
            className={clsx(
              'text-xs font-medium px-1.5 py-0.5 rounded-full',
              sourceColors[listing.source]
            )}
          >
            {sourceLabels[listing.source]}
          </span>
          <Link
            to={`/listings/${listing.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Detalii →
          </Link>
        </div>
      </div>
    </div>
  )
}

const MIN_PANEL_PX = 200
const MAX_PANEL_RATIO = 0.6

export default function ListingsPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined)
  const [panelWidth, setPanelWidth] = useState(260) // px
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const filtered = applyFilters(mockListings, filters)

  useEffect(() => {
    if (selectedId !== undefined && cardRefs.current[selectedId]) {
      cardRefs.current[selectedId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedId])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const maxPx = rect.width * MAX_PANEL_RATIO
      const newWidth = Math.min(maxPx, Math.max(MIN_PANEL_PX, e.clientX - rect.left))
      setPanelWidth(newWidth)
    }
    function onMouseUp() {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <div ref={containerRef} className="flex" style={{ height: 'calc(100vh - 64px)' }}>
      {/* ── Left panel (resizable) ───────────────────────────── */}
      <div
        className="flex flex-col border-r border-gray-200 bg-white shrink-0"
        style={{ width: panelWidth }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-bold text-gray-900">Chirii Timișoara</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {filtered.length} {filtered.length === 1 ? 'rezultat' : 'rezultate'}
              </p>
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filtre
              {filtersOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible filter panel */}
        {filtersOpen && (
          <div className="border-b border-gray-100 overflow-y-auto max-h-72 px-3 py-3 bg-gray-50">
            <FilterBar filters={filters} onChange={setFilters} />
          </div>
        )}

        {/* Listing cards list */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center text-gray-400">
              <p className="text-sm font-medium">Niciun rezultat</p>
              <p className="text-xs mt-1">Modifică filtrele</p>
            </div>
          ) : (
            filtered.map((listing) => (
              <div
                key={listing.id}
                ref={(el) => {
                  cardRefs.current[listing.id] = el
                }}
              >
                <MiniCard
                  listing={listing}
                  selected={listing.id === selectedId}
                  onClick={() => setSelectedId(listing.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Drag handle ─────────────────────────────────────── */}
      <div
        onMouseDown={onMouseDown}
        className="w-1.5 shrink-0 relative flex items-center justify-center bg-gray-100 hover:bg-blue-200 active:bg-blue-400 cursor-col-resize transition-colors group z-10"
      >
        <div className="absolute flex items-center justify-center w-5 h-10 rounded-full bg-white border border-gray-200 shadow-sm group-hover:border-blue-400 group-hover:shadow-md transition-all">
          <GripVertical className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
        </div>
      </div>

      {/* ── Map (remaining space) ─────────────────────────────── */}
      <div className="flex-1 relative">
        <MapView
          listings={filtered}
          height="100%"
          selectedId={selectedId}
          onMarkerClick={(l) => setSelectedId(l.id)}
        />
      </div>

      {/* Mobile: full-screen filter overlay (for small screens) */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl p-4 overflow-y-auto z-50">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">Filtre</span>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <FilterBar filters={filters} onChange={setFilters} />
          </div>
        </div>
      )}
    </div>
  )
}
