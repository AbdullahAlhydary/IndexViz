import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Hash, Layers, Zap, BarChart3, ArrowRight, Database, GitBranch, Search } from 'lucide-react'

const features = [
  {
    icon: Layers,
    title: 'Multi-Index Architecture',
    description: 'Three concurrent access paths (ID, first name, last name) pointing to the same physical storage for O(1) lookups.',
    color: 'indigo',
  },
  {
    icon: GitBranch,
    title: 'Quadratic Probing',
    description: 'Collision resolution using alternating +i/-i quadratic probing to minimize clustering and ensure table coverage.',
    color: 'violet',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description: 'Real-time comparison of hash table lookups vs linear scanning with visual performance metrics and benchmarks.',
    color: 'purple',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const colorMap = {
  indigo: {
    iconBg: 'bg-indigo-500/10',
    iconText: 'text-indigo-400',
    border: 'border-indigo-500/20',
    glow: 'group-hover:shadow-indigo-500/10',
  },
  violet: {
    iconBg: 'bg-violet-500/10',
    iconText: 'text-violet-400',
    border: 'border-violet-500/20',
    glow: 'group-hover:shadow-violet-500/10',
  },
  purple: {
    iconBg: 'bg-purple-500/10',
    iconText: 'text-purple-400',
    border: 'border-purple-500/20',
    glow: 'group-hover:shadow-purple-500/10',
  },
}

function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="hero-gradient-orb hero-gradient-orb-indigo absolute top-1/4 left-1/4 w-[500px] h-[500px]" />
        <div className="hero-gradient-orb hero-gradient-orb-violet absolute bottom-1/4 right-1/4 w-[400px] h-[400px]" />
        <div className="hero-gradient-orb hero-gradient-orb-purple absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none grid-pattern" />

      {/* Content */}
      <div className="relative z-10">
        {/* Nav bar */}
        <nav className="flex items-center justify-between px-6 sm:px-12 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">IndexViz</span>
          </div>
          <Link
            to="/dashboard"
            className="text-sm text-slate-400 hover:text-indigo-400 transition-colors font-medium"
          >
            Skip to Dashboard
          </Link>
        </nav>

        {/* Hero */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto px-6 sm:px-12 pt-16 sm:pt-24 pb-20 text-center"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium mb-6">
              <Database className="w-4 h-4" />
              ICS202 Data Structures Project
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              IndexViz
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl font-medium text-slate-400 mb-4"
          >
            Algorithm Visualization Platform
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Explore how multi-indexed hash tables with quadratic probing enable O(1) student
            record retrieval through three concurrent access paths
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4"
            >
              Launch Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/visualization"
              className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-4"
            >
              <Search className="w-5 h-5" />
              Explore Visualization
            </Link>
          </motion.div>
        </motion.section>

        {/* Features */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="max-w-6xl mx-auto px-6 sm:px-12 pb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const colors = colorMap[feature.color]
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className={`group glass-card p-8 hover:bg-slate-800/70 transition-all duration-300 hover:shadow-xl ${colors.glow}`}
                >
                  <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center mb-5`}>
                    <feature.icon className={`w-6 h-6 ${colors.iconText}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-100 mb-3">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* Why Multi-Indexing */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="max-w-4xl mx-auto px-6 sm:px-12 pb-20"
        >
          <motion.div variants={itemVariants} className="glass-card p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-6">
              Why Multi-Indexing?
            </h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                Traditional data structures force a choice: optimize for one search key or accept
                slower lookups on others. A student record might be searched by ID, first name,
                or last name, but a single hash table can only hash on one field.
              </p>
              <p>
                Our multi-indexed approach maintains three separate index maps (ID, firstName,
                lastName) that all point to the same physical storage: a 2D array of hash tables
                partitioned by university level. This means:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="text-indigo-400 font-mono font-bold text-2xl mb-1">O(1)</div>
                  <div className="text-sm text-slate-400">Lookup by ID via direct hash</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="text-violet-400 font-mono font-bold text-2xl mb-1">O(1)</div>
                  <div className="text-sm text-slate-400">Lookup by first name via index</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="text-purple-400 font-mono font-bold text-2xl mb-1">O(1)</div>
                  <div className="text-sm text-slate-400">Lookup by last name via index</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Architecture Preview */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="max-w-4xl mx-auto px-6 sm:px-12 pb-20"
        >
          <motion.div variants={itemVariants} className="glass-card p-8 sm:p-12">
            <h2 className="text-xl font-bold text-slate-100 mb-6">Architecture at a Glance</h2>
            <div className="code-block">
              <div className="text-slate-500 mb-4">{'// Physical Storage: 2D Array'}</div>
              <div className="text-violet-400 mb-1">levels[4][151]</div>
              <div className="text-slate-600 mb-4">{'  FR[0..150]  SO[0..150]  JR[0..150]  SR[0..150]'}</div>
              <div className="text-slate-500 mb-2">{'// Three Index Maps -> Same Storage'}</div>
              <div className="flex flex-col gap-1">
                <div>
                  <span className="text-indigo-400">IdMap</span>
                  <span className="text-slate-600">{' ........... '}</span>
                  <span className="text-slate-400">{'{ 45231 -> slot 97 }'}</span>
                </div>
                <div>
                  <span className="text-violet-400">firstNameMap</span>
                  <span className="text-slate-600">{' .... '}</span>
                  <span className="text-slate-400">{'{ "Mohammed" -> [97, 10042] }'}</span>
                </div>
                <div>
                  <span className="text-purple-400">lastNameMap</span>
                  <span className="text-slate-600">{' ..... '}</span>
                  <span className="text-slate-400">{'{ "Al-Ghamdi" -> [97, 20015] }'}</span>
                </div>
              </div>
              <div className="text-slate-500 mt-4">{'// Hash: id % 151 | Probe: slot +/- i^2'}</div>
            </div>
          </motion.div>
        </motion.section>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-slate-800/50">
          <p className="text-slate-500 text-sm">
            Built for ICS202 -- Data Structures and Algorithms
          </p>
          <p className="text-slate-600 text-xs mt-2">
            Multi-Indexed Hash Table with Quadratic Probing
          </p>
        </footer>
      </div>
    </div>
  )
}

export default Landing
