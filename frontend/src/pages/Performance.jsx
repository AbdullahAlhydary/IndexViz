import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Cell,
} from 'recharts'
import {
  Zap, Search, Timer, ArrowRight, TrendingUp, BarChart3, BookOpen,
  AlertCircle, Loader2, Database, RotateCcw, Play, CheckCircle2,
  Hash, ChevronRight, Gauge, FlaskConical, Target, Award, Minus,
  Layers, Clock, Activity,
} from 'lucide-react'
import { studentApi } from '../api'

/* ================================================================== */
/*  CONSTANTS                                                         */
/* ================================================================== */

const SEARCH_TYPES = [
  { value: 'id', label: 'Student ID', icon: Hash, placeholder: 'e.g. 45231' },
  { value: 'firstName', label: 'First Name', icon: Search, placeholder: 'e.g. Mohammed' },
  { value: 'lastName', label: 'Last Name', icon: Search, placeholder: 'e.g. Al-Ghamdi' },
]

const COMPLEXITY_DATA = [
  { n: 10, indexed: 1, linear: 5, binary: 3.3 },
  { n: 50, indexed: 1, linear: 25, binary: 5.6 },
  { n: 100, indexed: 1, linear: 50, binary: 6.6 },
  { n: 200, indexed: 1, linear: 100, binary: 7.6 },
  { n: 500, indexed: 1, linear: 250, binary: 9 },
  { n: 1000, indexed: 1, linear: 500, binary: 10 },
]

const DARK_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    fontSize: '12px',
  },
  labelStyle: { color: '#94a3b8' },
}

/* ================================================================== */
/*  CUSTOM RECHARTS TOOLTIP                                           */
/* ================================================================== */

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-600/60 rounded-xl p-3 shadow-2xl text-xs">
      <div className="text-slate-400 mb-1.5 font-medium">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="font-mono font-semibold" style={{ color: entry.color }}>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ================================================================== */
/*  SECTION 1: QUICK SEARCH BENCHMARK                                 */
/* ================================================================== */

function QuickBenchmark({ onResult }) {
  const [searchType, setSearchType] = useState('id')
  const [searchKey, setSearchKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const currentType = SEARCH_TYPES.find(t => t.value === searchType)

  const runComparison = async () => {
    if (!searchKey.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await studentApi.comparePerformance(searchType, searchKey.trim())
      const data = res.data?.data || res.data
      onResult(data)
    } catch (err) {
      setError(err.message || 'Comparison failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Gauge className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="section-header text-xl">Quick Search Benchmark</h2>
          <p className="section-subheader text-xs">Compare indexed O(1) lookup vs linear O(n) scan in real-time</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[160px]">
            <label className="text-xs text-slate-500 mb-1 block">Search Type</label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="select-field !py-2.5 text-sm"
            >
              {SEARCH_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-slate-500 mb-1 block">Search Key</label>
            <input
              type="text"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              placeholder={currentType?.placeholder}
              className="input-field !py-2.5 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && runComparison()}
            />
          </div>
          <button
            onClick={runComparison}
            disabled={loading || !searchKey.trim()}
            className="btn-primary !py-2.5 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Compare
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-sm text-rose-400"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}

/* ================================================================== */
/*  SECTION 2: RESULTS DISPLAY                                        */
/* ================================================================== */

function ResultsDisplay({ result }) {
  if (!result) return null

  const stepsData = [
    { name: 'Indexed', steps: result.indexedSteps, fill: '#34d399' },
    { name: 'Linear', steps: result.linearSteps, fill: '#fb7185' },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={result.searchKey}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="section-header text-xl">Results</h2>
          <p className="section-subheader text-xs">
            Search for "{result.searchKey}" by {result.searchType}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Indexed Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 border-l-4 border-l-emerald-500/60"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-emerald-400">Indexed Search</h3>
            <span className="ml-auto badge-emerald text-[10px]">O(1) / O(k)</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-[10px] text-slate-500 mb-0.5">Steps</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{result.indexedSteps}</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-[10px] text-slate-500 mb-0.5">Time</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{(result.indexedTimeNanos / 1000).toFixed(1)}<span className="text-sm text-slate-500">us</span></div>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-[10px] text-slate-500 mb-1">Index Used</div>
            <span className="badge-indigo text-xs">{result.indexUsed}</span>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 mb-2">Path Taken</div>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
              {result.indexedPath?.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className="flex items-start gap-2 text-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-[9px] text-emerald-400 font-bold mt-0.5">
                    {i + 1}
                  </div>
                  <code className="text-slate-300 font-mono text-[11px] leading-relaxed">{step}</code>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Linear Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 border-l-4 border-l-rose-500/60"
        >
          <div className="flex items-center gap-2 mb-4">
            <Timer className="w-5 h-5 text-rose-400" />
            <h3 className="text-lg font-semibold text-rose-400">Linear Search</h3>
            <span className="ml-auto badge-rose text-[10px]">O(n)</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-[10px] text-slate-500 mb-0.5">Steps</div>
              <div className="text-2xl font-bold font-mono text-rose-400">{result.linearSteps}</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="text-[10px] text-slate-500 mb-0.5">Time</div>
              <div className="text-2xl font-bold font-mono text-rose-400">{(result.linearTimeNanos / 1000).toFixed(1)}<span className="text-sm text-slate-500">us</span></div>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 mb-2">Path Taken (abbreviated)</div>
            <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
              {result.linearPath?.slice(0, 8).map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-start gap-2 text-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0 text-[9px] text-rose-400 font-bold mt-0.5">
                    {i + 1}
                  </div>
                  <code className="text-slate-400 font-mono text-[11px] leading-relaxed">{step}</code>
                </motion.div>
              ))}
              {(result.linearPath?.length || 0) > 8 && (
                <div className="text-[10px] text-slate-600 text-center pt-1">
                  ... {result.linearPath.length - 8} more steps
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Speedup + Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Speedup Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="glass-card p-6 flex flex-col items-center justify-center"
        >
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Speedup Factor</div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="relative"
          >
            <div className="text-6xl font-extrabold gradient-text font-mono">
              {result.speedupFactor?.toFixed(1)}x
            </div>
            <motion.div
              className="absolute -inset-4 rounded-2xl bg-indigo-500/5 blur-xl"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <div className="text-sm text-slate-400 mt-3">faster with indexing</div>
          <div className="flex items-center gap-2 mt-4">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">
              {result.speedupFactor >= 50 ? 'Exceptional' :
               result.speedupFactor >= 20 ? 'Excellent' :
               result.speedupFactor >= 10 ? 'Very Good' :
               result.speedupFactor >= 5 ? 'Good' : 'Moderate'} Performance
            </span>
          </div>
        </motion.div>

        {/* Bar Race Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5 lg:col-span-2"
        >
          <div className="text-xs text-slate-500 mb-3">Steps Comparison</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stepsData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={70} axisLine={{ stroke: '#334155' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="steps" radius={[0, 8, 8, 0]} animationDuration={1200}>
                {stepsData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Animated bars */}
          <div className="space-y-2 mt-2">
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-emerald-400 font-medium">Indexed</span>
                <span className="font-mono text-emerald-400">{result.indexedSteps} steps</span>
              </div>
              <div className="h-3 bg-slate-900/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max((result.indexedSteps / result.linearSteps) * 100, 2)}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-rose-400 font-medium">Linear</span>
                <span className="font-mono text-rose-400">{result.linearSteps} steps</span>
              </div>
              <div className="h-3 bg-slate-900/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5, ease: 'easeOut', delay: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

/* ================================================================== */
/*  SECTION 4: TIME COMPLEXITY EDUCATION                              */
/* ================================================================== */

function ComplexityEducation() {
  const complexities = [
    {
      title: 'Hash Table (Quadratic Probing)',
      avg: 'O(1)',
      worst: 'O(n)',
      note: 'Average O(1) with a good hash function and low load factor. Degrades toward O(n) as the table fills beyond ~70% capacity.',
      color: 'indigo',
      formula: 'h(k) = k mod m, probe: (h + i^2) mod m',
    },
    {
      title: 'Multi-Index Lookup',
      avg: 'O(1)',
      worst: 'O(1)',
      note: 'HashMap lookup O(1) to get the encoded identifier index, then O(1) direct array access to levels[level][slot].',
      color: 'violet',
      formula: 'IdMap.get(key) -> decode -> levels[l][s]',
    },
    {
      title: 'Linear Scan',
      avg: 'O(n)',
      worst: 'O(n)',
      note: 'Must check every occupied slot in every level until the target is found. Always proportional to total records.',
      color: 'rose',
      formula: 'for each level: for each slot: compare',
    },
  ]

  const colorStyles = {
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', badge: 'badge-indigo' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', badge: 'badge-violet' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', badge: 'badge-rose' },
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="section-header text-xl">Time Complexity Analysis</h2>
          <p className="section-subheader text-xs">Theoretical performance characteristics of each approach</p>
        </div>
      </div>

      {/* Complexity cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {complexities.map((c, idx) => {
          const style = colorStyles[c.color]
          return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
              className={`glass-card p-5 ${style.border} border-l-4`}
            >
              <h3 className={`text-sm font-semibold ${style.text} mb-3`}>{c.title}</h3>
              <div className="flex items-center gap-4 mb-3">
                <div>
                  <div className="text-[10px] text-slate-500">Average</div>
                  <div className={`text-2xl font-bold font-mono ${style.text}`}>{c.avg}</div>
                </div>
                <div className="h-8 w-px bg-slate-700/50" />
                <div>
                  <div className="text-[10px] text-slate-500">Worst</div>
                  <div className={`text-2xl font-bold font-mono ${style.text}`}>{c.worst}</div>
                </div>
              </div>
              <div className="code-block !p-2.5 !text-[10px] mb-3">
                <code className={style.text}>{c.formula}</code>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{c.note}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Theoretical Performance Curves */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-slate-200">Theoretical Performance Curves</span>
          <span className="text-[10px] text-slate-500 ml-auto">Expected steps vs dataset size</span>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={COMPLEXITY_DATA} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="n"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              label={{ value: 'Dataset Size (n)', position: 'bottom', offset: -5, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              label={{ value: 'Expected Steps', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="indexed"
              name="Indexed (Hash + Map)"
              stroke="#34d399"
              strokeWidth={3}
              dot={{ r: 4, fill: '#34d399' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="linear"
              name="Linear Scan"
              stroke="#fb7185"
              strokeWidth={3}
              dot={{ r: 4, fill: '#fb7185' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="binary"
              name="Binary Search (ref)"
              stroke="#818cf8"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={{ r: 3, fill: '#818cf8' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-emerald-400 rounded" /> Indexed: nearly flat O(1) regardless of n
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-rose-400 rounded" /> Linear: grows proportionally O(n)
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-4 h-px bg-indigo-400 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #818cf8 0, #818cf8 4px, transparent 4px, transparent 7px)' }} /> Binary Search: O(log n) reference
          </span>
        </div>
      </div>
    </motion.section>
  )
}

/* ================================================================== */
/*  SECTION 5: BATCH BENCHMARK                                        */
/* ================================================================== */

function BatchBenchmark({ students }) {
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState([])
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const aggregates = useMemo(() => {
    if (results.length === 0) return null
    const speedups = results.map(r => r.speedupFactor)
    return {
      avg: (speedups.reduce((a, b) => a + b, 0) / speedups.length).toFixed(1),
      max: Math.max(...speedups).toFixed(1),
      min: Math.min(...speedups).toFixed(1),
      total: results.length,
    }
  }, [results])

  const chartData = useMemo(() => {
    return results.map((r, i) => ({
      name: `${r.searchType === 'id' ? 'ID' : r.searchType === 'firstName' ? 'FN' : 'LN'}: ${r.searchKey?.toString().slice(0, 8)}`,
      indexed: r.indexedSteps,
      linear: r.linearSteps,
      speedup: r.speedupFactor,
    }))
  }, [results])

  const runBenchmark = async () => {
    setRunning(true)
    setResults([])
    setProgress(0)
    setError(null)

    const allResults = []

    try {
      // Get sample data for random keys
      const allRes = await studentApi.getAll()
      const allStudents = allRes.data?.data || allRes.data || []

      if (allStudents.length === 0) {
        setError('No students found. Load sample data first.')
        setRunning(false)
        return
      }

      // Pick random samples
      const shuffle = (arr) => arr.sort(() => Math.random() - 0.5)
      const randomStudents = shuffle([...allStudents])

      const tests = []
      // 5 random IDs
      for (let i = 0; i < Math.min(5, randomStudents.length); i++) {
        tests.push({ type: 'id', key: randomStudents[i].id?.toString() })
      }
      // 5 random first names
      const firstNames = [...new Set(allStudents.map(s => s.firstName))].filter(Boolean)
      shuffle(firstNames)
      for (let i = 0; i < Math.min(5, firstNames.length); i++) {
        tests.push({ type: 'firstName', key: firstNames[i] })
      }
      // 5 random last names
      const lastNames = [...new Set(allStudents.map(s => s.lastName))].filter(Boolean)
      shuffle(lastNames)
      for (let i = 0; i < Math.min(5, lastNames.length); i++) {
        tests.push({ type: 'lastName', key: lastNames[i] })
      }

      for (let i = 0; i < tests.length; i++) {
        try {
          const res = await studentApi.comparePerformance(tests[i].type, tests[i].key)
          const data = res.data?.data || res.data
          if (data) {
            allResults.push(data)
            setResults([...allResults])
          }
        } catch {
          // Skip failed individual tests
        }
        setProgress(((i + 1) / tests.length) * 100)
      }
    } catch (err) {
      setError(err.message || 'Benchmark failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <FlaskConical className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="section-header text-xl">Batch Benchmark</h2>
          <p className="section-subheader text-xs">Run multiple comparisons across all search types</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={runBenchmark}
            disabled={running}
            className="btn-primary !py-2.5 flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {running ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {running ? 'Running...' : 'Run Full Benchmark'}
          </button>
          <span className="text-xs text-slate-500">Tests 5 IDs + 5 first names + 5 last names</span>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-sm text-rose-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Progress */}
        {running && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">Running benchmark...</span>
              <span className="text-indigo-400 font-mono">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Aggregates */}
        {aggregates && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="bg-slate-900/50 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-500 mb-0.5">Tests Run</div>
              <div className="text-xl font-bold font-mono text-slate-200">{aggregates.total}</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-500 mb-0.5">Avg Speedup</div>
              <div className="text-xl font-bold font-mono gradient-text">{aggregates.avg}x</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-500 mb-0.5">Max Speedup</div>
              <div className="text-xl font-bold font-mono text-emerald-400">{aggregates.max}x</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-500 mb-0.5">Min Speedup</div>
              <div className="text-xl font-bold font-mono text-amber-400">{aggregates.min}x</div>
            </div>
          </div>
        )}

        {/* Results Table */}
        {results.length > 0 && (
          <>
            <div className="overflow-x-auto mb-5">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">#</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Type</th>
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Key</th>
                    <th className="text-right py-2 px-3 text-slate-500 font-medium">Indexed Steps</th>
                    <th className="text-right py-2 px-3 text-slate-500 font-medium">Linear Steps</th>
                    <th className="text-right py-2 px-3 text-slate-500 font-medium">Speedup</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="py-2 px-3 text-slate-600">{i + 1}</td>
                      <td className="py-2 px-3">
                        <span className={`badge text-[9px] ${
                          r.searchType === 'id' ? 'badge-indigo' :
                          r.searchType === 'firstName' ? 'badge-violet' :
                          'badge-amber'
                        }`}>
                          {r.searchType === 'id' ? 'ID' : r.searchType === 'firstName' ? 'First Name' : 'Last Name'}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-300 max-w-[120px] truncate">{r.searchKey}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-400">{r.indexedSteps}</td>
                      <td className="py-2 px-3 text-right font-mono text-rose-400">{r.linearSteps}</td>
                      <td className="py-2 px-3 text-right">
                        <span className="font-mono font-semibold gradient-text">{r.speedupFactor?.toFixed(1)}x</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Benchmark Chart */}
            <div>
              <div className="text-xs text-slate-500 mb-3">Steps Comparison Across All Tests</div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 9 }}
                    axisLine={{ stroke: '#334155' }}
                    angle={-35}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    iconType="circle"
                  />
                  <Bar dataKey="indexed" name="Indexed" fill="#34d399" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="linear" name="Linear" fill="#fb7185" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Empty results */}
        {!running && results.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="text-sm">Click "Run Full Benchmark" to test performance across all search types</p>
          </div>
        )}
      </div>
    </motion.section>
  )
}

/* ================================================================== */
/*  EMPTY STATE                                                       */
/* ================================================================== */

function EmptyState({ onLoadSample, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
        <Database className="w-10 h-10 text-indigo-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-100 mb-3">No Data Loaded</h2>
      <p className="text-slate-400 max-w-md mb-8">
        Load sample data first to run performance comparisons between indexed lookups and linear scanning.
      </p>
      <button
        onClick={onLoadSample}
        disabled={loading}
        className="btn-primary flex items-center gap-2 text-base px-8 py-4"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Database className="w-5 h-5" />
        )}
        Load Sample Data
      </button>
    </motion.div>
  )
}

/* ================================================================== */
/*  MAIN PAGE COMPONENT                                               */
/* ================================================================== */

export default function Performance() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingSample, setLoadingSample] = useState(false)
  const [error, setError] = useState(null)
  const [comparisonResult, setComparisonResult] = useState(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await studentApi.getStats()
      setStats(res.data?.data || res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleLoadSample = async () => {
    setLoadingSample(true)
    try {
      await studentApi.loadSample()
      await fetchStats()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingSample(false)
    }
  }

  const isEmpty = !loading && (!stats || stats.totalStudents === 0)

  /* Loading */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading statistics...</p>
      </div>
    )
  }

  /* Error */
  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Connection Error</h2>
        <p className="text-slate-400 mb-6 text-sm">{error}</p>
        <button onClick={fetchStats} className="btn-secondary flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Retry
        </button>
      </div>
    )
  }

  /* Empty */
  if (isEmpty) {
    return <EmptyState onLoadSample={handleLoadSample} loading={loadingSample} />
  }

  /* Stats bar */
  const statsBar = stats ? (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-3 mb-6"
    >
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-400">Students: <span className="text-slate-100 font-semibold">{stats.totalStudents}</span></span>
        </div>
        <div className="h-4 w-px bg-slate-700/50" />
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-400" />
          <span className="text-slate-400">ID Index: <span className="text-slate-100 font-semibold">{stats.idIndexSize}</span></span>
        </div>
        <div className="h-4 w-px bg-slate-700/50" />
        <div className="flex items-center gap-2">
          <span className="text-slate-400">First Name Index: <span className="text-slate-100 font-semibold">{stats.firstNameIndexSize}</span></span>
        </div>
        <div className="h-4 w-px bg-slate-700/50" />
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Last Name Index: <span className="text-slate-100 font-semibold">{stats.lastNameIndexSize}</span></span>
        </div>
        <div className="flex-1" />
        <button onClick={fetchStats} className="btn-ghost !p-1.5 text-slate-500 hover:text-indigo-400">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  ) : null

  return (
    <div className="space-y-8">
      {statsBar}

      <QuickBenchmark onResult={setComparisonResult} />

      <AnimatePresence mode="wait">
        {comparisonResult && <ResultsDisplay result={comparisonResult} />}
      </AnimatePresence>

      <ComplexityEducation />

      <BatchBenchmark />
    </div>
  )
}
