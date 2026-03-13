import { Link } from 'react-router-dom'
import { MapPin, BedDouble, Maximize2, Briefcase, GraduationCap } from 'lucide-react'
import clsx from 'clsx'
import type { Listing } from '../types'

interface Props {
  listing: Listing
}

const sourceColors: Record<Listing['source'], string> = {
  imobiliare: 'bg-orange-100 text-orange-700',
  olx: 'bg-purple-100 text-purple-700',
  storia: 'bg-green-100 text-green-700',
}

const sourceLabels: Record<Listing['source'], string> = {
  imobiliare: 'imobiliare.ro',
  olx: 'OLX',
  storia: 'storia.ro',
}

export default function ListingCard({ listing }: Props) {
  const { id, title, price, rooms, area, address, neighborhood, imageUrl, source, score, distanceToWork, distanceToUni } = listing

  const scoreColor =
    score === undefined
      ? 'bg-gray-100 text-gray-500'
      : score >= 80
      ? 'bg-green-500 text-white'
      : 'bg-yellow-400 text-yellow-900'

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-100 flex flex-col">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
        {/* Source badge */}
        <span
          className={clsx(
            'absolute bottom-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full',
            sourceColors[source]
          )}
        >
          {sourceLabels[source]}
        </span>
        {/* Score badge */}
        {score !== undefined && (
          <span
            className={clsx(
              'absolute top-2 right-2 text-sm font-bold px-2.5 py-0.5 rounded-full shadow',
              scoreColor
            )}
          >
            {score}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Price */}
        <p className="text-xl font-bold text-blue-600">
          {price} <span className="text-sm font-medium text-gray-400">EUR/lună</span>
        </p>

        {/* Rooms + Area */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <BedDouble className="w-4 h-4 text-gray-400" />
            {rooms === 1 ? 'Garsonieră' : `${rooms} camere`}
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 className="w-4 h-4 text-gray-400" />
            {area} m²
          </span>
        </div>

        {/* Location */}
        <div className="flex items-start gap-1 text-sm text-gray-500">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <span className="line-clamp-1">
            <span className="font-medium text-gray-700">{neighborhood}</span> &mdash; {address}
          </span>
        </div>

        {/* Distances */}
        {(distanceToWork !== undefined || distanceToUni !== undefined) && (
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            {distanceToWork !== undefined && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                {distanceToWork} km serviciu
              </span>
            )}
            {distanceToUni !== undefined && (
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                {distanceToUni} km facultate
              </span>
            )}
          </div>
        )}

        {/* Button */}
        <div className="mt-auto pt-2">
          <Link
            to={`/listings/${id}`}
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Vezi detalii
          </Link>
        </div>
      </div>
    </div>
  )
}
