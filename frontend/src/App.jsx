import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, NavLink, useLocation, Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Home,
  LayoutDashboard,
  Users,
  Eye,
  Zap,
  Upload,
  Info,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Hash,
} from 'lucide-react'
import clsx from 'clsx'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import StudentManagement from './pages/StudentManagement'
import Visualization from './pages/Visualization'
import Performance from './pages/Performance'
import Import from './pages/Import'
import TechnicalDesign from './pages/TechnicalDesign'

/* ------------------------------------------------------------------ */
/*  Page Components                                                   */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Navigation Configuration                                          */
/* ------------------------------------------------------------------ */

const navItems = [
  { to: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/students',      label: 'Students',      icon: Users },
  { to: '/visualization', label: 'Visualization', icon: Eye },
  { to: '/performance',   label: 'Performance',   icon: Zap },
  { to: '/import',        label: 'Import',        icon: Upload },
  { to: '/about',         label: 'About',         icon: Info },
]

const pageTitles = {
  '/dashboard':     'Dashboard',
  '/students':      'Student Management',
  '/visualization': 'Hash Table Visualization',
  '/performance':   'Performance Comparison',
  '/import':        'Data Import',
  '/about':         'Technical Design',
}

/* ------------------------------------------------------------------ */
/*  Sidebar Component                                                 */
/* ------------------------------------------------------------------ */

function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full flex flex-col',
          'bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/60',
          'transition-all duration-300 ease-in-out',
          // Desktop sizing
          'lg:z-30',
          collapsed ? 'lg:w-[72px]' : 'lg:w-[260px]',
          // Mobile: off-canvas
          'w-[280px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/60 flex-shrink-0">
          <NavLink to="/" className="flex items-center gap-3 group" onClick={onMobileClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/40 group-hover:shadow-indigo-700/50 transition-shadow flex-shrink-0">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <span
              className={clsx(
                'text-lg font-bold gradient-text whitespace-nowrap transition-all duration-300',
                collapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'lg:opacity-100 lg:w-auto'
              )}
            >
              IndexViz
            </span>
          </NavLink>

          {/* Close button (mobile only) */}
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onMobileClose}
              className={({ isActive }) =>
                clsx(
                  'sidebar-item',
                  isActive && 'sidebar-item-active'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={clsx(
                      'w-5 h-5 flex-shrink-0 transition-colors',
                      isActive ? 'text-indigo-400' : 'text-slate-500'
                    )}
                  />
                  <span
                    className={clsx(
                      'sidebar-label whitespace-nowrap transition-all duration-300',
                      collapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'lg:opacity-100 lg:w-auto'
                    )}
                  >
                    {item.label}
                  </span>
                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="nav-indicator-dot"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-lg shadow-indigo-500/50 flex-shrink-0 hidden lg:block"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse Toggle (desktop only) */}
        <div className="hidden lg:flex items-center justify-center py-3 px-3 border-t border-slate-800/60 flex-shrink-0">
          <button
            onClick={onToggle}
            className={clsx(
              'flex items-center justify-center gap-2 w-full py-2 rounded-xl',
              'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all duration-200 text-xs font-medium'
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div
          className={clsx(
            'px-4 py-3 border-t border-slate-800/60 flex-shrink-0',
            collapsed && 'lg:px-2'
          )}
        >
          <div
            className={clsx(
              'flex items-center gap-2',
              collapsed && 'lg:justify-center'
            )}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 animate-pulse flex-shrink-0" />
            <span
              className={clsx(
                'text-xs text-slate-500 whitespace-nowrap transition-all duration-300',
                collapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'lg:opacity-100 lg:w-auto'
              )}
            >
              ICS202 Project
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Top Bar Component                                                 */
/* ------------------------------------------------------------------ */

function TopBar({ title, onMenuClick, sidebarCollapsed }) {
  return (
    <header
      className={clsx(
        'fixed top-0 right-0 z-20 h-16 flex items-center justify-between px-4 sm:px-6',
        'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60',
        'transition-all duration-300',
        sidebarCollapsed ? 'lg:left-[72px]' : 'lg:left-[260px]',
        'left-0'
      )}
    >
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title */}
        <div>
          <h1 className="text-lg font-semibold text-slate-100 tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        <NavLink
          to="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </NavLink>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/*  App Layout (wraps routed pages with sidebar + top bar)            */
/* ------------------------------------------------------------------ */

function AppLayout() {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentTitle = pageTitles[location.pathname] || 'IndexViz'

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Close mobile menu on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  const handleMobileClose = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  const handleMobileOpen = useCallback(() => {
    setMobileMenuOpen(true)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        mobileOpen={mobileMenuOpen}
        onMobileClose={handleMobileClose}
      />

      <TopBar
        title={currentTitle}
        onMenuClick={handleMobileOpen}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main Content Area */}
      <main
        className={clsx(
          'pt-16 min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Root App Component                                                */
/* ------------------------------------------------------------------ */

function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Landing page: full-screen, no sidebar */}
        <Route path="/" element={<Landing />} />

        {/* All other pages: sidebar layout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/visualization" element={<Visualization />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/import" element={<Import />} />
          <Route path="/about" element={<TechnicalDesign />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default App
