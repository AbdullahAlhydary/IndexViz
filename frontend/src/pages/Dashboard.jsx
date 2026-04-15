import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts'
import {
  Users, Percent, AlertTriangle, Database, Key, User, UserCircle,
  RefreshCw, Loader2, Download, Trash2, Activity, Hash, Layers,
  TrendingUp, Server, HardDrive,
} from 'lucide-react'
import clsx from 'clsx'
import { studentApi } from '../api'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const LEVEL_COLORS = {
  FR: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', fill: '#3b82f6', label: 'Freshman' },
  SO: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', fill: '#10b981', label: 'Sophomore' },
  JR: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', fill: '#f59e0b', label: 'Junior' },
  SR: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', fill: '#f43f5e', label: 'Senior' },
}

const LEVEL_ORDER = ['FR', 'SO', 'JR', 'SR']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/* ------------------------------------------------------------------ */
/*  Chart Tooltip                                                      */
/* ------------------------------------------------------------------ */

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-2xl">
      <p className="text-sm font-semibold text-slate-200 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="font-mono font-semibold text-slate-200">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-2xl">
      <p className="text-sm font-semibold text-slate-200">{d.name}</p>
      <p className="text-xs text-slate-400 mt-1">
        <span className="font-mono text-slate-200">{d.value}</span> students
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Skeleton Loader                                                    */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-3 w-24 bg-slate-700/50 rounded" />
          <div className="h-8 w-20 bg-slate-700/50 rounded" />
          <div className="h-2.5 w-32 bg-slate-700/30 rounded" />
        </div>
        <div className="w-12 h-12 bg-slate-700/30 rounded-xl" />
      </div>
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="h-4 w-40 bg-slate-700/50 rounded mb-2" />
      <div className="h-3 w-64 bg-slate-700/30 rounded mb-6" />
      <div className="h-48 bg-slate-700/20 rounded-xl" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

const statCardColors = {
  indigo: { border: 'border-l-indigo-500', bg: 'bg-indigo-500/5', icon: 'text-indigo-400 bg-indigo-500/10', value: 'text-indigo-400' },
  emerald: { border: 'border-l-emerald-500', bg: 'bg-emerald-500/5', icon: 'text-emerald-400 bg-emerald-500/10', value: 'text-emerald-400' },
  amber: { border: 'border-l-amber-500', bg: 'bg-amber-500/5', icon: 'text-amber-400 bg-amber-500/10', value: 'text-amber-400' },
  rose: { border: 'border-l-rose-500', bg: 'bg-rose-500/5', icon: 'text-rose-400 bg-rose-500/10', value: 'text-rose-400' },
  violet: { border: 'border-l-violet-500', bg: 'bg-violet-500/5', icon: 'text-violet-400 bg-violet-500/10', value: 'text-violet-400' },
  cyan: { border: 'border-l-cyan-500', bg: 'bg-cyan-500/5', icon: 'text-cyan-400 bg-cyan-500/10', value: 'text-cyan-400' },
}

function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', children }) {
  const c = statCardColors[color] || statCardColors.indigo
  return (
    <motion.div variants={itemVariants} className={clsx('glass-card border-l-4 p-6 hover:bg-slate-800/70 transition-all duration-300', c.border, c.bg)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <p className={clsx('text-3xl font-bold tracking-tight', c.value)}>{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
          {children}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-xl flex-shrink-0', c.icon)}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Hash Table Mini Grid                                               */
/* ------------------------------------------------------------------ */

function MiniHashGrid({ hashTableData }) {
  const [hoveredSlot, setHoveredSlot] = useState(null)

  if (!hashTableData || !Array.isArray(hashTableData)) return null

  const levels = hashTableData
  const capacity = levels[0]?.length || 151

  return (
    <motion.div variants={itemVariants} className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Hash Table Occupancy Grid</h3>
          <p className="text-sm text-slate-400 mt-0.5">
            {levels.length} levels x {capacity} slots = {levels.length * capacity} total slots
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500/60" />
            Occupied
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-700/60" />
            Empty
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/40" />
            Deleted
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {levels.map((levelSlots, levelIdx) => {
          const levelName = LEVEL_ORDER[levelIdx] || `L${levelIdx}`
          const lc = LEVEL_COLORS[levelName]
          const occupied = levelSlots.filter(s => s.status === 'OCCUPIED').length
          const deleted = levelSlots.filter(s => s.status === 'DELETED').length

          return (
            <div key={levelIdx}>
              <div className="flex items-center gap-3 mb-1">
                <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-md border', lc?.bg, lc?.text, lc?.border)}>
                  {levelName}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {occupied}/{levelSlots.length} occupied
                  {deleted > 0 && <span className="text-rose-400 ml-2">{deleted} tombstones</span>}
                </span>
              </div>
              <div className="flex flex-wrap gap-[3px]">
                {levelSlots.map((slot, slotIdx) => {
                  const isOccupied = slot.status === 'OCCUPIED'
                  const isDeleted = slot.status === 'DELETED'
                  const isHovered = hoveredSlot?.level === levelIdx && hoveredSlot?.slot === slotIdx

                  return (
                    <div
                      key={slotIdx}
                      className={clsx(
                        'w-[5px] h-[5px] rounded-[1px] transition-all duration-150 cursor-pointer',
                        isOccupied
                          ? 'bg-indigo-500/70 hover:bg-indigo-400'
                          : isDeleted
                          ? 'bg-rose-500/40 hover:bg-rose-400'
                          : 'bg-slate-700/40 hover:bg-slate-600',
                        isHovered && 'ring-1 ring-white/50 scale-[2]'
                      )}
                      onMouseEnter={() => setHoveredSlot({ level: levelIdx, slot: slotIdx, data: slot })}
                      onMouseLeave={() => setHoveredSlot(null)}
                      title={`[${levelName}][${slotIdx}] ${slot.status}${isOccupied && slot.student ? ` - ${slot.student.firstName} ${slot.student.lastName} (ID: ${slot.student.id})` : ''}`}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {hoveredSlot && hoveredSlot.data && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-slate-900/80 rounded-xl border border-slate-700/50 text-xs"
        >
          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              Slot <span className="font-mono text-slate-200">[{LEVEL_ORDER[hoveredSlot.level]}][{hoveredSlot.slot}]</span>
            </span>
            <span className={clsx(
              'px-2 py-0.5 rounded-md font-semibold',
              hoveredSlot.data.status === 'OCCUPIED' ? 'bg-indigo-500/20 text-indigo-400' :
              hoveredSlot.data.status === 'DELETED' ? 'bg-rose-500/20 text-rose-400' :
              'bg-slate-700/50 text-slate-400'
            )}>
              {hoveredSlot.data.status}
            </span>
            {hoveredSlot.data.student && (
              <span className="text-slate-300">
                {hoveredSlot.data.student.firstName} {hoveredSlot.data.student.lastName}
                <span className="text-slate-500 ml-2">ID: {hoveredSlot.data.student.id}</span>
              </span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

function EmptyState({ onLoadSample, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-8">
        <Database className="w-12 h-12 text-indigo-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-100 mb-3">No Data Loaded</h2>
      <p className="text-slate-400 max-w-md text-center mb-8">
        The hash table engine is empty. Load sample data to populate the dashboard with statistics, charts, and the occupancy grid.
      </p>
      <button
        onClick={onLoadSample}
        disabled={loading}
        className="btn-primary flex items-center gap-2 text-base px-8 py-4"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
        {loading ? 'Loading...' : 'Load Sample Data'}
      </button>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard Component                                           */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [hashTable, setHashTable] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingSample, setLoadingSample] = useState(false)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const [statsRes, hashRes] = await Promise.all([
        studentApi.getStats(),
        studentApi.getHashTable(),
      ])
      setStats(statsRes.data?.data || statsRes.data)
      setHashTable(hashRes.data?.data || hashRes.data)
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleLoadSample = async () => {
    setLoadingSample(true)
    try {
      await studentApi.loadSample()
      await fetchData()
    } catch (err) {
      setError(err.message || 'Failed to load sample data')
    } finally {
      setLoadingSample(false)
    }
  }

  const handleReset = async () => {
    try {
      await studentApi.reset()
      await fetchData()
    } catch (err) {
      setError(err.message || 'Failed to reset data')
    }
  }

  /* ---- Loading State ---- */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <SkeletonChart />
      </div>
    )
  }

  /* ---- Error State ---- */
  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-100 mb-2">Connection Error</h2>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => fetchData()} className="btn-primary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
          <button onClick={handleLoadSample} disabled={loadingSample} className="btn-secondary flex items-center gap-2">
            {loadingSample ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Load Sample Data
          </button>
        </div>
      </motion.div>
    )
  }

  /* ---- Empty State ---- */
  if (!stats || stats.totalStudents === 0) {
    return <EmptyState onLoadSample={handleLoadSample} loading={loadingSample} />
  }

  /* ---- Derived Data ---- */
  const levelBarData = LEVEL_ORDER.map((lvl) => ({
    name: lvl,
    fullName: LEVEL_COLORS[lvl].label,
    students: stats.studentsPerLevel?.[lvl] || 0,
    loadFactor: Math.round((stats.loadFactorPerLevel?.[lvl] || 0) * 100),
    fill: LEVEL_COLORS[lvl].fill,
  }))

  const levelPieData = LEVEL_ORDER.map((lvl) => ({
    name: `${lvl} - ${LEVEL_COLORS[lvl].label}`,
    value: stats.studentsPerLevel?.[lvl] || 0,
    fill: LEVEL_COLORS[lvl].fill,
  }))

  const loadFactorPercent = Math.round((stats.overallLoadFactor || 0) * 100)

  /* ---- Render ---- */
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header with actions */}
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Engine Overview</h2>
          <p className="text-sm text-slate-400 mt-1">Real-time statistics from the multi-indexed hash table engine</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="btn-ghost flex items-center gap-2 text-sm"
          >
            <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin')} />
            Refresh
          </button>
          <button onClick={handleLoadSample} disabled={loadingSample} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
            {loadingSample ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Load Sample
          </button>
          <button onClick={handleReset} className="btn-danger flex items-center gap-2 text-sm py-2 px-4">
            <Trash2 className="w-4 h-4" />
            Reset
          </button>
        </div>
      </motion.div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents.toLocaleString()}
          subtitle={`Across ${LEVEL_ORDER.length} university levels`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Load Factor"
          value={`${loadFactorPercent}%`}
          icon={Percent}
          color="emerald"
        >
          <div className="mt-3">
            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${loadFactorPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                className={clsx(
                  'h-full rounded-full',
                  loadFactorPercent > 75 ? 'bg-rose-500' :
                  loadFactorPercent > 50 ? 'bg-amber-500' :
                  'bg-emerald-500'
                )}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">{stats.totalStudents} / {stats.totalSlots} slots used</p>
          </div>
        </StatCard>
        <StatCard
          title="Total Collisions"
          value={stats.totalCollisions.toLocaleString()}
          subtitle={`${stats.totalProbes.toLocaleString()} total probes`}
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Table Capacity"
          value={`${stats.totalSlots.toLocaleString()}`}
          subtitle={`${stats.capacity} slots x ${LEVEL_ORDER.length} levels`}
          icon={Database}
          color="violet"
        />
      </div>

      {/* Students by Level + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-1">Students by Level</h3>
          <p className="text-sm text-slate-400 mb-6">Distribution of students across university levels with load factors</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={levelBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="students" name="Students" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {levelBarData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-1">Level Distribution</h3>
          <p className="text-sm text-slate-400 mb-4">Proportional breakdown</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={levelPieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {levelPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {LEVEL_ORDER.map((lvl) => {
              const lc = LEVEL_COLORS[lvl]
              const count = stats.studentsPerLevel?.[lvl] || 0
              return (
                <div key={lvl} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: lc.fill }} />
                  <span className="text-slate-400">{lvl}</span>
                  <span className="font-mono text-slate-300 ml-auto">{count}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Level Load Factor Bars */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Load Factor by Level</h3>
        <p className="text-sm text-slate-400 mb-5">Capacity utilization per hash table partition</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LEVEL_ORDER.map((lvl) => {
            const lc = LEVEL_COLORS[lvl]
            const lf = Math.round((stats.loadFactorPerLevel?.[lvl] || 0) * 100)
            const count = stats.studentsPerLevel?.[lvl] || 0

            return (
              <div key={lvl} className={clsx('p-4 rounded-xl border', lc.bg, lc.border)}>
                <div className="flex items-center justify-between mb-2">
                  <span className={clsx('text-sm font-semibold', lc.text)}>
                    {lvl} - {lc.label}
                  </span>
                  <span className={clsx('text-lg font-bold font-mono', lc.text)}>
                    {lf}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800/60 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${lf}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: lc.fill }}
                  />
                </div>
                <p className="text-xs text-slate-500">{count} / {stats.capacity} slots</p>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Index Sizes + Probing Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="glass-card p-6 hover:bg-slate-800/70 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">ID Index</h4>
              <p className="text-xs text-slate-500">Student ID to slot mapping</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-400 font-mono">{stats.idIndexSize?.toLocaleString() || 0}</p>
          <p className="text-xs text-slate-500 mt-2">
            Direct O(1) lookup from student ID to their physical slot in the hash table.
            Each ID maps to exactly one slot.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 hover:bg-slate-800/70 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">First Name Index</h4>
              <p className="text-xs text-slate-500">Name to identifier indices</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-cyan-400 font-mono">{stats.firstNameIndexSize?.toLocaleString() || 0}</p>
          <p className="text-xs text-slate-500 mt-2">
            Maps first names to lists of identifier indices. Multiple students can share
            the same first name, so each key maps to a list.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 hover:bg-slate-800/70 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
              <UserCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Last Name Index</h4>
              <p className="text-xs text-slate-500">Name to identifier indices</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-violet-400 font-mono">{stats.lastNameIndexSize?.toLocaleString() || 0}</p>
          <p className="text-xs text-slate-500 mt-2">
            Maps last names to lists of identifier indices. Enables O(1) lookup by
            last name with support for multiple matches.
          </p>
        </motion.div>
      </div>

      {/* Probing & Tombstone Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-slate-300">Total Probes</span>
          </div>
          <p className="text-2xl font-bold text-cyan-400 font-mono">{stats.totalProbes?.toLocaleString() || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Cumulative probe steps across all operations</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-slate-300">Avg Probes/Insert</span>
          </div>
          <p className="text-2xl font-bold text-amber-400 font-mono">
            {stats.totalStudents > 0 ? (stats.totalProbes / stats.totalStudents).toFixed(2) : '0'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Average probing depth per student insertion</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-medium text-slate-300">Collision Rate</span>
          </div>
          <p className="text-2xl font-bold text-rose-400 font-mono">
            {stats.totalStudents > 0 ? `${Math.round((stats.totalCollisions / stats.totalStudents) * 100)}%` : '0%'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Percentage of insertions that encountered collisions</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-medium text-slate-300">Tombstones</span>
          </div>
          <p className="text-2xl font-bold text-rose-400 font-mono">{stats.tombstoneCount?.toLocaleString() || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Deleted slots marked for lazy cleanup during probing</p>
        </motion.div>
      </div>

      {/* Hash Table Occupancy Grid */}
      <MiniHashGrid hashTableData={hashTable} />

      {/* Engine Architecture Summary */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">Engine Architecture</h3>
            <p className="text-sm text-slate-400">Multi-indexed hash table with quadratic probing</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-slate-200">Physical Storage</span>
            </div>
            <p className="text-xs text-slate-400">
              2D array <span className="font-mono text-indigo-400">levels[{LEVEL_ORDER.length}][{stats.capacity}]</span> partitioned
              by university level (FR, SO, JR, SR).
            </p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-slate-200">Hash Function</span>
            </div>
            <p className="text-xs text-slate-400">
              <span className="font-mono text-violet-400">id % {stats.capacity}</span> with alternating
              quadratic probing <span className="font-mono text-slate-500">+/- i^2</span> for collision resolution.
            </p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-slate-200">Three Indices</span>
            </div>
            <p className="text-xs text-slate-400">
              Concurrent access via <span className="font-mono text-emerald-400">IdMap</span>,{' '}
              <span className="font-mono text-cyan-400">firstNameMap</span>, and{' '}
              <span className="font-mono text-violet-400">lastNameMap</span> for O(1) lookups.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
