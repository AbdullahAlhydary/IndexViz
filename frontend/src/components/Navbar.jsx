import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X, Hash } from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/students', label: 'Students' },
  { to: '/visualization', label: 'Visualization' },
  { to: '/performance', label: 'Performance' },
  { to: '/import', label: 'Import' },
  { to: '/about', label: 'About' },
]

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-900/30 group-hover:shadow-emerald-800/50 transition-shadow">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">IndexViz</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative',
                    isActive
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-emerald-500 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800/60 bg-slate-950/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  clsx(
                    'block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
