import { Link } from 'react-router-dom'
import { Search, Star, Clock, LayoutGrid, ChevronRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-6 backdrop-blur">
            Beta · Timișoara, România
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Găsește chiria perfectă<br />
            <span className="text-blue-200">în Timișoara</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Agregăm anunțuri din imobiliare.ro, OLX și storia.ro și le scorăm în funcție de
            locația ta de muncă, facultate, buget și mijloc de transport.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Search className="w-5 h-5" />
              Vezi toate anunțurile
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/20 transition-colors border border-white/30 backdrop-blur"
            >
              Creează cont gratuit
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-extrabold text-blue-600">200+</p>
              <p className="text-sm text-gray-500 mt-1">Anunțuri active</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-blue-600">3</p>
              <p className="text-sm text-gray-500 mt-1">Surse monitorizate</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-blue-600">Gratuit</p>
              <p className="text-sm text-gray-500 mt-1">Fără costuri ascunse</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          De ce ChiriiSmart?
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          Nu mai pierde ore întregi pe mai multe site-uri. Noi facem munca pentru tine.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <LayoutGrid className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Anunțuri agregate</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Colectăm anunțuri din imobiliare.ro, OLX și storia.ro într-un singur loc, actualizate zilnic.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Star className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Scor personalizat</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Fiecare anunț primește un scor bazat pe profilul tău: distanța față de muncă sau facultate, buget și transport.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Clock className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Economisești timp</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Nu mai căuta pe 5 site-uri diferite. Totul e centralizat, filtrat și sortat exact cum ai nevoie.
            </p>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Gata să găsești chiria perfectă?
          </h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            Creează un cont, completează profilul tău și primești recomandări personalizate instant.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
          >
            Începe gratuit
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © 2026 ChiriiSmart · Timișoara, România
      </footer>
    </div>
  )
}
