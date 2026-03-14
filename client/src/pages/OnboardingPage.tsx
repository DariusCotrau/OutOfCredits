import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  GraduationCap,
  Wallet,
  Home,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuthStore } from '../store/authStore'
import type { UserProfile } from '../types'

const STEPS = [
  { label: 'Serviciu', icon: Briefcase },
  { label: 'Facultate', icon: GraduationCap },
  { label: 'Buget', icon: Wallet },
  { label: 'Locuință', icon: Home },
]

const TRANSPORT_OPTIONS: { value: UserProfile['transport']; label: string; icon: string }[] = [
  { value: 'walking', label: 'Pietonal', icon: '🚶' },
  { value: 'cycling', label: 'Bicicletă', icon: '🚲' },
  { value: 'public', label: 'Transport public', icon: '🚌' },
  { value: 'car', label: 'Mașină', icon: '🚗' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [workAddress, setWorkAddress] = useState('')
  const [uniAddress, setUniAddress] = useState('')
  const [noUni, setNoUni] = useState(false)
  const [budget, setBudget] = useState(400)
  const [transport, setTransport] = useState<UserProfile['transport']>('public')
  const [roomsMin, setRoomsMin] = useState(1)
  const [areaMin, setAreaMin] = useState(25)

  const { setProfile, setUser, user } = useAuthStore()
  const navigate = useNavigate()

  function canNext(): boolean {
    if (step === 0) return workAddress.trim().length > 0
    if (step === 1) return noUni || uniAddress.trim().length > 0
    return true
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      handleFinish()
    }
  }

  function handleFinish() {
    const profile: UserProfile = {
      workAddress,
      uniAddress: noUni ? '' : uniAddress,
      budget,
      transport,
      roomsMin,
      areaMin,
    }
    setProfile(profile)
    if (user) {
      setUser({ ...user, hasProfile: true }, useAuthStore.getState().token ?? '')
    }
    navigate('/recommendations')
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={clsx(
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                      i < step
                        ? 'bg-green-500 text-white'
                        : i === step
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    )}
                  >
                    {i < step ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={clsx(
                      'text-xs font-medium hidden sm:block',
                      i === step ? 'text-blue-600' : 'text-gray-400'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">
            Pasul {step + 1} din {STEPS.length}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Step 1: Work */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Unde lucrezi?</h2>
                <p className="text-sm text-gray-500">
                  Vom calcula distanța față de locul tău de muncă.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresa locului de muncă
                </label>
                <input
                  type="text"
                  value={workAddress}
                  onChange={(e) => setWorkAddress(e.target.value)}
                  placeholder="ex: Strada Memorandumului 91, Timișoara"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Poți introduce adresa, zona sau numele companiei.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: University */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Unde înveți?</h2>
                <p className="text-sm text-gray-500">
                  Opțional — dacă ești student, vom calcula distanța față de facultate.
                </p>
              </div>
              <label className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl cursor-pointer border border-blue-100">
                <input
                  type="checkbox"
                  checked={noUni}
                  onChange={(e) => setNoUni(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700 font-medium">Nu sunt student</span>
              </label>
              {!noUni && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Adresa facultății
                  </label>
                  <input
                    type="text"
                    value={uniAddress}
                    onChange={(e) => setUniAddress(e.target.value)}
                    placeholder="ex: Politehnica Timișoara, Bulevardul Vasile Pârvan 2"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Budget + transport */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Care este bugetul tău?</h2>
                <p className="text-sm text-gray-500">
                  Anunțurile vor fi filtrate și sortate în funcție de bugetul ales.
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Buget maxim lunar
                  </label>
                  <span className="text-lg font-bold text-blue-600">{budget} EUR</span>
                </div>
                <input
                  type="range"
                  min={150}
                  max={1000}
                  step={25}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>150 EUR</span>
                  <span>1000 EUR</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mijloc de transport principal
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TRANSPORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTransport(opt.value)}
                      className={clsx(
                        'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors',
                        transport === opt.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      )}
                    >
                      <span className="text-base">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Housing preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Preferințe locuință</h2>
                <p className="text-sm text-gray-500">
                  Setează numărul minim de camere și suprafața dorită.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Număr minim de camere
                </label>
                <div className="flex gap-3">
                  {[1, 2, 3].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRoomsMin(r)}
                      className={clsx(
                        'flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors',
                        roomsMin === r
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      )}
                    >
                      {r === 1 ? 'Garsonieră' : r === 3 ? '3+ cam.' : `${r} cam.`}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Suprafață minimă
                  </label>
                  <span className="text-lg font-bold text-blue-600">{areaMin} m²</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  step={5}
                  value={areaMin}
                  onChange={(e) => setAreaMin(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>20 m²</span>
                  <span>100 m²</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Înapoi
            </button>
            <button
              onClick={handleNext}
              disabled={!canNext()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-200 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              {step === STEPS.length - 1 ? (
                <>
                  <Check className="w-4 h-4" />
                  Finalizează
                </>
              ) : (
                <>
                  Continuă
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
