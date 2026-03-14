import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Home, LogOut, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
          >
            <Home className="w-6 h-6 text-blue-600" />
            ChiriiSmart
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/listings"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Anunțuri
            </Link>
            <Link
              to="/recommendations"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Recomandări
            </Link>
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-sm">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Deconectare
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-blue-600 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Autentificare
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-blue-600 text-white font-medium px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Înregistrare
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Meniu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 pt-2 space-y-2">
          <Link
            to="/listings"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
          >
            Anunțuri
          </Link>
          <Link
            to="/recommendations"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
          >
            Recomandări
          </Link>
          <div className="border-t border-gray-100 pt-2">
            {user ? (
              <>
                <p className="text-sm text-gray-500 py-1">Conectat ca <strong>{user.name}</strong></p>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-red-500 font-medium text-sm"
                >
                  Deconectare
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-gray-700 font-medium"
                >
                  Autentificare
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-blue-600 font-medium"
                >
                  Înregistrare
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
