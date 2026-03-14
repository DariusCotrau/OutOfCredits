import { useState } from 'react'
import { SlidersHorizontal, X, List, Map } from 'lucide-react'
import ListingCard from '../components/ListingCard'
import FilterBar, { type Filters, defaultFilters } from '../components/FilterBar'
import MapView from '../components/MapView'
import { mockListings } from '../data/mockListings'
import type { Listing } from '../types'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-9 bg-gray-200 rounded-lg mt-2" />
      </div>
    </div>
  )
}

function applyFilters(listings: Listing[], filters: Filters): Listing[] {
  let result = [...listings]

  if (filters.priceMin !== '') {
    result = result.filter((l) => l.price >= Number(filters.priceMin))
  }
  if (filters.priceMax !== '') {
    result = result.filter((l) => l.price <= Number(filters.priceMax))
  }
  if (filters.rooms.length > 0) {
    result = result.filter((l) => {
      if (filters.rooms.includes(3) && l.rooms >= 3) return true
      return filters.rooms.includes(l.rooms)
    })
  }
  if (filters.neighborhoods.length > 0) {
    result = result.filter((l) => filters.neighborhoods.includes(l.neighborhood))
  }
  if (filters.sources.length > 0) {
    result = result.filter((l) => filters.sources.includes(l.source))
  }

  switch (filters.sortBy) {
    case 'score':
      result.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      break
    case 'price_asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'date':
      result.sort((a, b) => b.postedAt.localeCompare(a.postedAt))
      break
  }

  return result
}

export default function ListingsPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [loading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  const filtered = applyFilters(mockListings, filters)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anunțuri chirii</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} {filtered.length === 1 ? 'rezultat' : 'rezultate'} găsite
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Listă</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Hartă</span>
            </button>
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtre
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar – desktop always visible */}
        <div className="hidden md:block w-64 shrink-0">
          <FilterBar filters={filters} onChange={setFilters} />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl p-4 overflow-y-auto z-50">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-800">Filtre</span>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <FilterBar filters={filters} onChange={setFilters} />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {viewMode === 'map' ? (
            <MapView listings={filtered} height="calc(100vh - 220px)" />
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Niciun rezultat găsit
              </h3>
              <p className="text-gray-400 text-sm max-w-xs">
                Încearcă să modifici filtrele pentru a vedea mai multe anunțuri.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
