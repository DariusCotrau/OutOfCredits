import { Link } from 'react-router-dom'
import {
  Sparkles,
  Settings,
  Wallet,
  MapPin,
  BedDouble,
  ArrowRight,
} from 'lucide-react'
import ListingCard from '../components/ListingCard'
import { mockListings } from '../data/mockListings'
import { useAuthStore } from '../store/authStore'

const TRANSPORT_LABELS: Record<string, string> = {
  walking: 'Pietonal',
  cycling: 'Bicicletă',
  public: 'Transport public',
  car: 'Mașină',
}

export default function RecommendationsPage() {
  const { user, profile } = useAuthStore()

  if (!user || !profile || !user.hasProfile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Completează-ți profilul
          </h2>
          <p className="text-gray-500 text-sm mb-7 leading-relaxed">
            Pentru a vedea recomandări personalizate, trebuie să completezi câteva detalii despre tine: locul de muncă, facultate, buget și preferințe de transport.
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Completează profilul
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  // Filter listings that match profile preferences and sort by score
  const recommended = [...mockListings]
    .filter((l) => {
      if (l.rooms < profile.roomsMin) return false
      if (l.area < profile.areaMin) return false
      if (l.price > profile.budget * 1.2) return false // allow 20% over budget
      return true
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 6)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            Recomandări pentru tine
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Anunțuri selectate în funcție de profilul tău, sortate după scor
          </p>
        </div>
        <Link
          to="/onboarding"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 px-4 py-2 rounded-lg hover:border-blue-300 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Actualizează profilul
        </Link>
      </div>

      {/* Profile summary */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8">
        <h2 className="text-sm font-semibold text-blue-800 mb-3">Criteriile tale</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs text-blue-600">Buget maxim</p>
              <p className="text-sm font-semibold text-blue-900">{profile.budget} EUR/lună</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs text-blue-600">Transport</p>
              <p className="text-sm font-semibold text-blue-900">
                {TRANSPORT_LABELS[profile.transport]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs text-blue-600">Camere min.</p>
              <p className="text-sm font-semibold text-blue-900">
                {profile.roomsMin === 1 ? 'Garsonieră' : `${profile.roomsMin} camere`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs text-blue-600">Suprafață min.</p>
              <p className="text-sm font-semibold text-blue-900">{profile.areaMin} m²</p>
            </div>
          </div>
        </div>
        {profile.workAddress && (
          <div className="mt-3 pt-3 border-t border-blue-100 text-xs text-blue-600">
            <span className="font-medium">Serviciu:</span> {profile.workAddress}
            {profile.uniAddress && (
              <>
                <span className="mx-2">·</span>
                <span className="font-medium">Facultate:</span> {profile.uniAddress}
              </>
            )}
          </div>
        )}
      </div>

      {/* Listings */}
      {recommended.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-semibold text-gray-700 mb-2">
            Niciun anunț potrivit momentan
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Încearcă să mărești bugetul sau să ajustezi preferințele.
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Modifică preferințele
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-5">
            {recommended.length} anunțuri potrivite găsite
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommended.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Vezi toate anunțurile disponibile
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
