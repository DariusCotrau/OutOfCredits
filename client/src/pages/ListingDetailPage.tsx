import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  BedDouble,
  Maximize2,
  Building2,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
} from 'lucide-react'
import clsx from 'clsx'
import { mockListings } from '../data/mockListings'
import { useAuthStore } from '../store/authStore'
import MapView from '../components/MapView'

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

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuthStore()

  const listing = mockListings.find((l) => l.id === Number(id))

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-2xl font-bold text-gray-700 mb-4">Anunț negăsit</p>
        <Link to="/listings" className="text-blue-600 hover:underline">
          ← Înapoi la anunțuri
        </Link>
      </div>
    )
  }

  const distanceScore =
    listing.distanceToWork !== undefined
      ? Math.max(0, Math.round(100 - listing.distanceToWork * 12))
      : undefined
  const priceScore = profile
    ? listing.price <= profile.budget
      ? Math.round(100 - ((listing.price / profile.budget) * 40))
      : Math.max(0, Math.round(100 - ((listing.price - profile.budget) / profile.budget) * 80))
    : undefined

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        to="/listings"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Înapoi la anunțuri
      </Link>

      {/* Image */}
      <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 mb-6">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title + source */}
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className={clsx(
                  'text-xs font-semibold px-2.5 py-1 rounded-full',
                  sourceColors[listing.source]
                )}
              >
                {sourceLabels[listing.source]}
              </span>
              {listing.score !== undefined && (
                <span
                  className={clsx(
                    'flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full',
                    listing.score >= 80
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  )}
                >
                  <Star className="w-3 h-3" />
                  Scor {listing.score}
                </span>
              )}
              <span className="text-xs text-gray-400 ml-auto">
                Publicat: {new Date(listing.postedAt).toLocaleDateString('ro-RO')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
            <p className="text-3xl font-extrabold text-blue-600">
              {listing.price}{' '}
              <span className="text-base font-medium text-gray-400">EUR/lună</span>
            </p>
          </div>

          {/* Details grid */}
          <div className="bg-gray-50 rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <BedDouble className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Camere</p>
              <p className="font-semibold text-gray-800">
                {listing.rooms === 1 ? 'Garsonieră' : listing.rooms}
              </p>
            </div>
            <div className="text-center">
              <Maximize2 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Suprafață</p>
              <p className="font-semibold text-gray-800">{listing.area} m²</p>
            </div>
            <div className="text-center">
              <Building2 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Etaj</p>
              <p className="font-semibold text-gray-800">{listing.floor}</p>
            </div>
            <div className="text-center">
              <MapPin className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Cartier</p>
              <p className="font-semibold text-gray-800 text-sm">{listing.neighborhood}</p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <span>{listing.address}</span>
          </div>

          {/* Distances */}
          {(listing.distanceToWork !== undefined || listing.distanceToUni !== undefined) && (
            <div className="flex flex-wrap gap-4">
              {listing.distanceToWork !== undefined && (
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl text-sm">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">Distanță serviciu:</span>
                  <span className="font-semibold text-blue-700">{listing.distanceToWork} km</span>
                </div>
              )}
              {listing.distanceToUni !== undefined && (
                <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl text-sm">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <span className="text-gray-600">Distanță facultate:</span>
                  <span className="font-semibold text-indigo-700">{listing.distanceToUni} km</span>
                </div>
              )}
            </div>
          )}

          {/* Map */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Localizare</h2>
            <MapView listings={[listing]} singleListing height="220px" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Score breakdown */}
          {listing.score !== undefined && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-4">
                {profile ? 'Scor detaliat' : 'Scor general'}
              </h2>
              <div className="space-y-4">
                <ScoreBar label="Scor general" value={listing.score} />
                {distanceScore !== undefined && (
                  <ScoreBar label="Distanță serviciu" value={distanceScore} />
                )}
                {priceScore !== undefined && (
                  <ScoreBar label="Buget" value={priceScore} />
                )}
              </div>
              {!profile && (
                <p className="text-xs text-gray-400 mt-4">
                  Completează{' '}
                  <Link to="/onboarding" className="text-blue-500 hover:underline">
                    profilul tău
                  </Link>{' '}
                  pentru un scor personalizat.
                </p>
              )}
            </div>
          )}

          {/* External link */}
          <a
            href={listing.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Deschide anunțul original
          </a>

          <Link
            to="/listings"
            className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Înapoi la anunțuri
          </Link>
        </div>
      </div>
    </div>
  )
}
