import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './Navbar'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

function Layout() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}

export default Layout
