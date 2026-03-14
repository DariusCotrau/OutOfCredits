export interface Listing {
  id: number
  title: string
  price: number
  rooms: number
  area: number
  floor: string
  address: string
  neighborhood: string
  lat: number
  lng: number
  imageUrl: string
  source: 'imobiliare' | 'olx' | 'storia'
  sourceUrl: string
  postedAt: string
  score?: number
  distanceToWork?: number
  distanceToUni?: number
}

export interface UserProfile {
  workAddress: string
  uniAddress: string
  budget: number
  transport: 'walking' | 'cycling' | 'public' | 'car'
  roomsMin: number
  areaMin: number
}

export interface AuthUser {
  id: number
  email: string
  name: string
  hasProfile: boolean
}
