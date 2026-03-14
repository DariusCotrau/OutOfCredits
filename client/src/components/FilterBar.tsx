import { RotateCcw } from 'lucide-react'

export interface Filters {
  priceMin: string
  priceMax: string
  rooms: number[]
  neighborhoods: string[]
  sources: string[]
  sortBy: 'score' | 'price_asc' | 'price_desc' | 'date'
}

interface Props {
  filters: Filters
  onChange: (filters: Filters) => void
}

const NEIGHBORHOODS = [
  'Fabric',
  'Cetate',
  'Circumvalațiunii',
  'Dacia',
  'Lipovei',
  'Dorobanților',
  'Mehala',
  'Iosefin',
  'Complexul Studențesc',
  'Freidorf',
  'Olimpia',
  'Soarelui',
]

const SOURCES = ['imobiliare', 'olx', 'storia']

const SOURCE_LABELS: Record<string, string> = {
  imobiliare: 'imobiliare.ro',
  olx: 'OLX',
  storia: 'storia.ro',
}

export const defaultFilters: Filters = {
  priceMin: '',
  priceMax: '',
  rooms: [],
  neighborhoods: [],
  sources: [],
  sortBy: 'score',
}

export default function FilterBar({ filters, onChange }: Props) {
  function toggleRoom(room: number) {
    const rooms = filters.rooms.includes(room)
      ? filters.rooms.filter((r) => r !== room)
      : [...filters.rooms, room]
    onChange({ ...filters, rooms })
  }

  function toggleNeighborhood(n: string) {
    const neighborhoods = filters.neighborhoods.includes(n)
      ? filters.neighborhoods.filter((x) => x !== n)
      : [...filters.neighborhoods, n]
    onChange({ ...filters, neighborhoods })
  }

  function toggleSource(s: string) {
    const sources = filters.sources.includes(s)
      ? filters.sources.filter((x) => x !== s)
      : [...filters.sources, s]
    onChange({ ...filters, sources })
  }

  function reset() {
    onChange(defaultFilters)
  }

  return (
    <aside className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Filtre</h2>
        <button
          onClick={reset}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Resetează
        </button>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Preț (EUR/lună)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => onChange({ ...filters, priceMin: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <span className="text-gray-400 text-sm">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => onChange({ ...filters, priceMax: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Rooms */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Camere</h3>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((r) => (
            <button
              key={r}
              onClick={() => toggleRoom(r)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                filters.rooms.includes(r)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {r === 1 ? 'Garsonieră' : r === 3 ? '3+' : `${r} cam.`}
            </button>
          ))}
        </div>
      </div>

      {/* Neighborhoods */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Cartier</h3>
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {NEIGHBORHOODS.map((n) => (
            <label key={n} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.neighborhoods.includes(n)}
                onChange={() => toggleNeighborhood(n)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">{n}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Sursă</h3>
        <div className="space-y-1.5">
          {SOURCES.map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.sources.includes(s)}
                onChange={() => toggleSource(s)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">
                {SOURCE_LABELS[s]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Sortare</h3>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onChange({ ...filters, sortBy: e.target.value as Filters['sortBy'] })
          }
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        >
          <option value="score">Scor (descrescător)</option>
          <option value="price_asc">Preț crescător</option>
          <option value="price_desc">Preț descrescător</option>
          <option value="date">Dată publicare</option>
        </select>
      </div>
    </aside>
  )
}
