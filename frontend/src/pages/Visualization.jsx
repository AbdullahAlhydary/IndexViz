import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  Eye, Play, Pause, SkipForward, RotateCcw, Search, Plus, Hash,
  AlertCircle, Loader2, Database, Info, ChevronRight, Zap, Target,
  Layers, ArrowRight, Grid3X3, Activity, CheckCircle2, XCircle,
  Minus, Clock, MousePointerClick,
} from 'lucide-react'
import { studentApi } from '../api'

/* ================================================================== */
/*  CONSTANTS                                                         */
/* ================================================================== */

const LEVEL_NAMES = ['FR', 'SO', 'JR', 'SR']
const LEVEL_COLORS = {
  FR: { bg: 'bg-blue-400', text: 'text-blue-400', hex: '#60a5fa', ring: 'ring-blue-400/30' },
  SO: { bg: 'bg-emerald-400', text: 'text-emerald-400', hex: '#34d399', ring: 'ring-emerald-400/30' },
  JR: { bg: 'bg-amber-400', text: 'text-amber-400', hex: '#fbbf24', ring: 'ring-amber-400/30' },
  SR: { bg: 'bg-rose-400', text: 'text-rose-400', hex: '#fb7185', ring: 'ring-rose-400/30' },
}

const STATUS_STYLES = {
  E: { bg: 'bg-slate-800/30', border: 'border-slate-700/30', label: 'Empty' },
  O: { bg: 'bg-indigo-500/60', border: 'border-indigo-400/40', label: 'Occupied' },
  D: { bg: 'bg-rose-500/25', border: 'border-rose-500/30', label: 'Deleted' },
}

const ANIMATION_SPEEDS = [
  { label: '0.5x', ms: 2000 },
  { label: '1x', ms: 1000 },
  { label: '2x', ms: 500 },
  { label: '4x', ms: 250 },
]

/* ================================================================== */
/*  HELPER: SLOT CELL                                                 */
/* ================================================================== */

function SlotCell({ slot, index, isHighlighted, highlightType, onHover, onLeave, compact }) {
  const status = STATUS_STYLES[slot.status] || STATUS_STYLES.E
  const isOccupied = slot.status === 'O'
  const isDisplaced = isOccupied && slot.isDisplaced

  let extraClass = ''
  if (highlightType === 'current') extraClass = 'slot-probe-current'
  else if (highlightType === 'found') extraClass = 'slot-probe-found'
  else if (highlightType === 'collision') extraClass = 'slot-probe-collision'

  return (
    <div
      className={`
        relative border rounded transition-all duration-300 cursor-pointer flex-shrink-0
        ${compact ? 'w-4 h-4 rounded-sm' : 'w-7 h-7 rounded-md'}
        ${extraClass || `${status.bg} ${status.border}`}
        ${isDisplaced && !extraClass ? 'ring-1 ring-amber-400/40 shadow-sm shadow-amber-500/20' : ''}
        ${isHighlighted && !extraClass ? 'ring-2 ring-indigo-400/60 scale-110 z-10' : ''}
        hover:scale-110 hover:z-10
      `}
      onMouseEnter={() => onHover?.(index)}
      onMouseLeave={() => onLeave?.()}
    >
      {isOccupied && !compact && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
        </div>
      )}
      {slot.status === 'D' && !compact && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-px bg-rose-400/50 rotate-45" />
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  HELPER: SLOT TOOLTIP                                              */
/* ================================================================== */

function SlotTooltip({ slot, index, levelName }) {
  if (!slot) return null
  const st = slot.student
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="tooltip-card min-w-[220px] z-50"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-slate-500">Slot {index}</span>
        <span className={`badge text-[10px] ${
          slot.status === 'O' ? 'badge-indigo' : slot.status === 'D' ? 'badge-rose' : 'bg-slate-700/50 text-slate-500 border border-slate-600/30'
        }`}>
          {STATUS_STYLES[slot.status]?.label}
        </span>
      </div>
      {st && (
        <div className="space-y-1 text-xs">
          <div className="text-slate-200 font-medium">{st.firstName} {st.lastName}</div>
          <div className="text-slate-400">ID: <span className="font-mono text-indigo-400">{st.id}</span></div>
          <div className="text-slate-400">DOB: {st.dateOfBirth}</div>
          <div className="text-slate-400">Level: <span className={LEVEL_COLORS[levelName]?.text}>{levelName}</span></div>
          <div className="border-t border-slate-700/50 pt-1 mt-1">
            <div className="text-slate-500">Natural Hash: <span className="font-mono text-amber-400">{slot.naturalHash}</span></div>
            {slot.isDisplaced && (
              <div className="text-amber-400 text-[10px] mt-0.5 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Displaced via probing
              </div>
            )}
          </div>
        </div>
      )}
      {!st && slot.status === 'D' && (
        <div className="text-xs text-rose-400">Tombstone (deleted record)</div>
      )}
    </motion.div>
  )
}

/* ================================================================== */
/*  SECTION 1: HASH TABLE GRID                                        */
/* ================================================================== */

function HashTableGrid({ hashTable, stats, hoveredStudent, onStudentHover }) {
  const [activeLevel, setActiveLevel] = useState(0)
  const [hoveredSlot, setHoveredSlot] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const gridRef = useRef(null)

  const levels = hashTable?.levels || []
  const currentLevel = levels[activeLevel]

  const slotDistribution = useMemo(() => {
    if (!currentLevel) return []
    return [
      { name: 'Occupied', value: currentLevel.occupiedCount, color: '#818cf8' },
      { name: 'Empty', value: currentLevel.emptyCount, color: '#334155' },
      { name: 'Deleted', value: currentLevel.deletedCount, color: '#fb7185' },
    ].filter(d => d.value > 0)
  }, [currentLevel])

  if (!hashTable || levels.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Grid3X3 className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="section-header text-xl">Hash Table Grid</h2>
          <p className="section-subheader text-xs">2D array: 4 levels x {hashTable.capacity} slots</p>
        </div>
      </div>

      {/* Level Tabs */}
      <div className="flex items-center gap-2 mb-4">
        {LEVEL_NAMES.map((name, idx) => {
          const lvl = levels[idx]
          const active = idx === activeLevel
          const colors = LEVEL_COLORS[name]
          return (
            <button
              key={name}
              onClick={() => setActiveLevel(idx)}
              className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                active
                  ? `bg-slate-800/80 ${colors.text} border border-slate-600/50 shadow-lg`
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              {name}
              {lvl && (
                <span className="ml-2 text-[10px] opacity-70">{lvl.occupiedCount}</span>
              )}
              {active && (
                <motion.div
                  layoutId="level-tab-indicator"
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full ${colors.bg}`}
                />
              )}
            </button>
          )
        })}
        <div className="flex-1" />
        <div className="flex items-center gap-1 bg-slate-800/40 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-2.5 py-1 text-xs rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('compact')}
            className={`px-2.5 py-1 text-xs rounded-md transition-all ${viewMode === 'compact' ? 'bg-slate-700 text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Compact
          </button>
        </div>
      </div>

      {/* Level Stats Bar */}
      {currentLevel && (
        <div className="glass-card p-3 mb-4 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-indigo-500/60 border border-indigo-400/40" />
            <span className="text-slate-400">Occupied: <span className="text-slate-200 font-semibold">{currentLevel.occupiedCount}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-800/50 border border-slate-700/40" />
            <span className="text-slate-400">Empty: <span className="text-slate-200 font-semibold">{currentLevel.emptyCount}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-rose-500/25 border border-rose-500/30" />
            <span className="text-slate-400">Deleted: <span className="text-slate-200 font-semibold">{currentLevel.deletedCount}</span></span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Load Factor:</span>
            <div className="w-24 h-2 bg-slate-900/80 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                initial={{ width: 0 }}
                animate={{ width: `${(currentLevel.loadFactor * 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-indigo-400 font-mono font-semibold">{(currentLevel.loadFactor * 100).toFixed(1)}%</span>
          </div>

          {/* Mini pie chart */}
          <div className="w-10 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slotDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={10}
                  outerRadius={18}
                  dataKey="value"
                  stroke="none"
                >
                  {slotDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Slot Grid */}
      <div className="glass-card p-4 relative" ref={gridRef}>
        <div className={`flex flex-wrap gap-1 ${viewMode === 'compact' ? 'gap-px' : 'gap-1'}`}>
          {currentLevel?.slots?.map((slot, idx) => (
            <SlotCell
              key={idx}
              slot={slot}
              index={idx}
              compact={viewMode === 'compact'}
              isHighlighted={
                hoveredStudent &&
                slot.status === 'O' &&
                slot.student?.id === hoveredStudent
              }
              onHover={(i) => {
                setHoveredSlot(i)
                if (slot.status === 'O' && slot.student) {
                  onStudentHover?.(slot.student.id)
                }
              }}
              onLeave={() => {
                setHoveredSlot(null)
                onStudentHover?.(null)
              }}
            />
          ))}
        </div>

        {/* Slot index ruler */}
        <div className="flex items-center gap-1 mt-2 text-[9px] text-slate-600 font-mono overflow-x-auto">
          {[0, 25, 50, 75, 100, 125, 150].map(i => (
            <span key={i} className="flex-shrink-0" style={{ marginLeft: i === 0 ? 0 : 'auto' }}>{i}</span>
          ))}
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredSlot !== null && currentLevel?.slots?.[hoveredSlot] && (
            <div className="absolute z-50 pointer-events-none" style={{ top: 8, right: 8 }}>
              <SlotTooltip
                slot={currentLevel.slots[hoveredSlot]}
                index={hoveredSlot}
                levelName={LEVEL_NAMES[activeLevel]}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}

/* ================================================================== */
/*  SECTION 2: MULTI-INDEX VISUALIZATION                              */
/* ================================================================== */

function MultiIndexViz({ hashTable, hoveredStudent, onStudentHover }) {
  const [selectedStudent, setSelectedStudent] = useState(null)

  const allStudents = useMemo(() => {
    if (!hashTable?.levels) return []
    const students = []
    hashTable.levels.forEach((lvl) => {
      lvl.slots?.forEach((slot) => {
        if (slot.status === 'O' && slot.student) {
          students.push({
            ...slot.student,
            levelName: lvl.levelName,
            slotIndex: slot.index,
            naturalHash: slot.naturalHash,
            isDisplaced: slot.isDisplaced,
          })
        }
      })
    })
    return students
  }, [hashTable])

  const firstNameGroups = useMemo(() => {
    const map = {}
    allStudents.forEach(s => {
      if (!map[s.firstName]) map[s.firstName] = []
      map[s.firstName].push(s)
    })
    return map
  }, [allStudents])

  const lastNameGroups = useMemo(() => {
    const map = {}
    allStudents.forEach(s => {
      if (!map[s.lastName]) map[s.lastName] = []
      map[s.lastName].push(s)
    })
    return map
  }, [allStudents])

  const displayStudents = allStudents.slice(0, 12)
  const active = selectedStudent || (hoveredStudent ? allStudents.find(s => s.id === hoveredStudent) : null)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Layers className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="section-header text-xl">Multi-Index Architecture</h2>
          <p className="section-subheader text-xs">Three access paths pointing to the same physical storage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ID Map */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-400">IdMap</span>
            <span className="text-[10px] text-slate-500 ml-auto font-mono">HashMap&lt;int, int&gt;</span>
          </div>
          <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
            {displayStudents.map((s) => {
              const isActive = active?.id === s.id
              return (
                <motion.div
                  key={s.id}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                    isActive ? 'bg-indigo-500/15 border border-indigo-500/30' : 'hover:bg-slate-700/40'
                  }`}
                  onMouseEnter={() => { onStudentHover?.(s.id); setSelectedStudent(s) }}
                  onMouseLeave={() => { onStudentHover?.(null); setSelectedStudent(null) }}
                  whileHover={{ x: 3 }}
                >
                  <span className="font-mono text-indigo-400 w-12">{s.id}</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                  <span className={`font-mono ${LEVEL_COLORS[s.levelName]?.text} text-[10px]`}>
                    [{s.levelName}][{s.slotIndex}]
                  </span>
                </motion.div>
              )
            })}
            {allStudents.length > 12 && (
              <div className="text-[10px] text-slate-600 text-center pt-1">
                + {allStudents.length - 12} more entries
              </div>
            )}
          </div>
        </div>

        {/* Student Card (center) */}
        <div className="glass-card p-4 flex flex-col items-center justify-center min-h-[320px]">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full"
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-900/40 mb-3">
                    {active.firstName?.[0]}{active.lastName?.[0]}
                  </div>
                  <div className="text-lg font-semibold text-slate-100">{active.firstName} {active.lastName}</div>
                  <div className="text-sm font-mono text-indigo-400 mt-1">ID: {active.id}</div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between px-3 py-2 bg-slate-900/50 rounded-lg">
                    <span className="text-slate-500">Level</span>
                    <span className={LEVEL_COLORS[active.levelName]?.text + ' font-semibold'}>{active.levelName}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 bg-slate-900/50 rounded-lg">
                    <span className="text-slate-500">Date of Birth</span>
                    <span className="text-slate-300">{active.dateOfBirth}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 bg-slate-900/50 rounded-lg">
                    <span className="text-slate-500">Slot</span>
                    <span className="font-mono text-slate-300">[{active.levelName}][{active.slotIndex}]</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 bg-slate-900/50 rounded-lg">
                    <span className="text-slate-500">Natural Hash</span>
                    <span className="font-mono text-amber-400">{active.naturalHash}</span>
                  </div>
                  {active.isDisplaced && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
                      <Zap className="w-3 h-3" /> Displaced via quadratic probing
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-slate-500"
              >
                <MousePointerClick className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                <p className="text-sm">Hover over an index entry to view student details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Name Maps */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-violet-400">Name Maps</span>
            <span className="text-[10px] text-slate-500 ml-auto font-mono">HashMap&lt;String, List&gt;</span>
          </div>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">First Name</div>
            {Object.entries(firstNameGroups).slice(0, 6).map(([name, students]) => {
              const isActive = active && students.some(s => s.id === active.id)
              return (
                <div
                  key={'fn-' + name}
                  className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    isActive ? 'bg-violet-500/15 border border-violet-500/30' : 'hover:bg-slate-700/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-violet-400 font-medium truncate max-w-[80px]">{name}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                    <span className="font-mono text-slate-400 text-[10px] truncate">
                      {students.slice(0, 3).map(s => `[${s.levelName}][${s.slotIndex}]`).join(', ')}
                      {students.length > 3 && ` +${students.length - 3}`}
                    </span>
                  </div>
                </div>
              )
            })}

            <div className="border-t border-slate-700/30 my-2" />
            <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Last Name</div>
            {Object.entries(lastNameGroups).slice(0, 6).map(([name, students]) => {
              const isActive = active && students.some(s => s.id === active.id)
              return (
                <div
                  key={'ln-' + name}
                  className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    isActive ? 'bg-purple-500/15 border border-purple-500/30' : 'hover:bg-slate-700/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-medium truncate max-w-[80px]">{name}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                    <span className="font-mono text-slate-400 text-[10px] truncate">
                      {students.slice(0, 3).map(s => `[${s.levelName}][${s.slotIndex}]`).join(', ')}
                      {students.length > 3 && ` +${students.length - 3}`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.section>
  )
}

/* ================================================================== */
/*  SECTION 3: PROBING SIMULATION                                     */
/* ================================================================== */

function ProbingSimulation({ hashTable, onOperationComplete }) {
  const [studentId, setStudentId] = useState('')
  const [operation, setOperation] = useState('search')
  const [simulating, setSimulating] = useState(false)
  const [trace, setTrace] = useState(null)
  const [error, setError] = useState(null)

  /* animation state */
  const [animStep, setAnimStep] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(1)
  const [animPhase, setAnimPhase] = useState('idle') // idle | hash | probing | done
  const timerRef = useRef(null)

  const probingSeq = trace?.probingSequence || []
  const speed = ANIMATION_SPEEDS[speedIdx].ms

  /* derived highlights for the grid section */
  const getSlotHighlight = useCallback((levelIdx, slotIdx) => {
    if (!trace || animPhase === 'idle') return null
    if (trace.levelIndex !== levelIdx) return null

    if (animPhase === 'hash' && slotIdx === trace.initialHash) return 'current'

    if (animPhase === 'probing' || animPhase === 'done') {
      for (let i = 0; i <= Math.min(animStep, probingSeq.length - 1); i++) {
        const step = probingSeq[i]
        if (step.slot === slotIdx) {
          if (i === animStep && animPhase === 'probing') return 'current'
          if (i === probingSeq.length - 1 && animPhase === 'done' && i === animStep) return 'found'
          if (step.isCollision) return 'collision'
          if (i === probingSeq.length - 1 && animPhase === 'done') return 'found'
        }
      }
    }
    return null
  }, [trace, animPhase, animStep, probingSeq])

  /* cleanup timer */
  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  /* auto-play logic */
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (!playing || !trace || animPhase !== 'probing') return

    timerRef.current = setInterval(() => {
      setAnimStep(prev => {
        const next = prev + 1
        if (next >= probingSeq.length) {
          setPlaying(false)
          setAnimPhase('done')
          clearInterval(timerRef.current)
          return prev
        }
        return next
      })
    }, speed)

    return () => clearInterval(timerRef.current)
  }, [playing, trace, speed, probingSeq.length, animPhase])

  const startSimulation = async () => {
    if (!studentId.trim()) return
    setError(null)
    setSimulating(true)
    setTrace(null)
    setAnimStep(-1)
    setPlaying(false)
    setAnimPhase('idle')

    try {
      let res
      if (operation === 'search') {
        res = await studentApi.searchById(studentId.trim())
      } else {
        res = await studentApi.addStudent({
          id: parseInt(studentId.trim()),
          firstName: 'Test',
          lastName: 'Student',
          dateOfBirth: '01/01/2000',
          universityLevel: 'FR',
        })
      }

      const data = res.data
      if (data.trace) {
        setTrace(data.trace)
        setAnimPhase('hash')
        setTimeout(() => {
          setAnimPhase('probing')
          setAnimStep(0)
          setPlaying(true)
        }, 1200)
      } else if (!data.success) {
        setError(data.message || 'Operation failed')
      }
    } catch (err) {
      setError(err.message || 'Operation failed')
    } finally {
      setSimulating(false)
    }
  }

  const stepForward = () => {
    if (!trace || animPhase === 'idle') return
    if (animPhase === 'hash') {
      setAnimPhase('probing')
      setAnimStep(0)
      return
    }
    if (animStep < probingSeq.length - 1) {
      setAnimStep(prev => prev + 1)
    } else {
      setAnimPhase('done')
    }
  }

  const resetAnimation = () => {
    setPlaying(false)
    if (timerRef.current) clearInterval(timerRef.current)
    setAnimStep(-1)
    setAnimPhase('idle')
    setTrace(null)
    setError(null)
  }

  const togglePlay = () => {
    if (animPhase === 'done') {
      setAnimPhase('probing')
      setAnimStep(0)
      setPlaying(true)
    } else if (animPhase === 'hash') {
      setAnimPhase('probing')
      setAnimStep(0)
      setPlaying(true)
    } else {
      setPlaying(prev => !prev)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Target className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="section-header text-xl">Probing Simulation</h2>
          <p className="section-subheader text-xs">Watch quadratic probing resolve collisions step by step</p>
        </div>
      </div>

      <div className="glass-card p-5">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-3 mb-5">
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs text-slate-500 mb-1 block">Student ID</label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. 45231"
              className="input-field !py-2.5 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && startSimulation()}
            />
          </div>
          <div className="min-w-[140px]">
            <label className="text-xs text-slate-500 mb-1 block">Operation</label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="select-field !py-2.5 text-sm"
            >
              <option value="search">Search</option>
              <option value="insert">Insert</option>
            </select>
          </div>
          <button
            onClick={startSimulation}
            disabled={simulating || !studentId.trim()}
            className="btn-primary !py-2.5 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {simulating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Simulate
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-sm text-rose-400"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Hash Computation Display */}
        <AnimatePresence>
          {trace && (animPhase === 'hash' || animPhase === 'probing' || animPhase === 'done') && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="px-4 py-2.5 bg-slate-900/80 border border-slate-700/50 rounded-xl">
                  <span className="text-xs text-slate-500 block mb-0.5">Hash Function</span>
                  <span className="font-mono text-sm text-indigo-400">{trace.hashFunction}</span>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-slate-600"
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl"
                >
                  <span className="text-xs text-slate-500 block mb-0.5">Initial Hash</span>
                  <span className="font-mono text-sm text-indigo-400 font-bold">{trace.initialHash}</span>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: 'spring' }}
                  className="text-slate-600"
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: 'spring' }}
                  className={`px-4 py-2.5 rounded-xl ${LEVEL_COLORS[trace.levelName]?.ring} border border-slate-700/50 bg-slate-900/80`}
                >
                  <span className="text-xs text-slate-500 block mb-0.5">Level</span>
                  <span className={`text-sm font-semibold ${LEVEL_COLORS[trace.levelName]?.text}`}>{trace.levelName}</span>
                </motion.div>
              </div>

              {/* Animated probing slots strip */}
              <div className="relative bg-slate-900/50 rounded-xl p-4 border border-slate-800/50 overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max">
                  {probingSeq.map((step, idx) => {
                    const isReached = animPhase === 'done' ? true : (animPhase === 'probing' && idx <= animStep)
                    const isCurrent = animPhase === 'probing' && idx === animStep
                    const isFinal = idx === probingSeq.length - 1 && (animPhase === 'done' || (isCurrent && !step.isCollision))
                    const isCollision = step.isCollision && isReached

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                          opacity: isReached ? 1 : 0.25,
                          scale: isCurrent ? 1.15 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center gap-1"
                      >
                        <div className="text-[9px] text-slate-500 font-mono">Step {step.step}</div>
                        <div
                          className={`
                            w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300
                            ${isFinal && isReached ? 'bg-emerald-500/20 border-emerald-400/60 shadow-lg shadow-emerald-500/20' :
                              isCollision ? 'bg-rose-500/15 border-rose-400/40' :
                              isCurrent ? 'bg-amber-500/20 border-amber-400/60 shadow-lg shadow-amber-500/20' :
                              isReached ? 'bg-indigo-500/15 border-indigo-400/30' :
                              'bg-slate-800/30 border-slate-700/30'}
                          `}
                        >
                          <span className={`font-mono text-sm font-bold ${
                            isFinal && isReached ? 'text-emerald-400' :
                            isCollision ? 'text-rose-400' :
                            isCurrent ? 'text-amber-400' :
                            'text-slate-400'
                          }`}>
                            {step.slot}
                          </span>
                        </div>
                        <div className="text-[8px] font-mono text-slate-600 max-w-[80px] text-center truncate">
                          {step.formula}
                        </div>
                        {isCollision && isReached && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="badge-rose text-[8px] !px-1.5 !py-0.5"
                          >
                            Collision
                          </motion.div>
                        )}
                        {isFinal && isReached && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="badge-emerald text-[8px] !px-1.5 !py-0.5"
                          >
                            {trace.success ? 'Found' : 'Empty'}
                          </motion.div>
                        )}
                        {step.occupantInfo && isReached && isCollision && (
                          <div className="text-[7px] text-slate-600 truncate max-w-[70px]">{step.occupantInfo}</div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {/* Progress line */}
                {probingSeq.length > 1 && (
                  <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 via-amber-500 to-emerald-500 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{
                        width: animPhase === 'done'
                          ? '100%'
                          : `${((animStep + 1) / probingSeq.length) * 100}%`
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>

              {/* Animation Controls */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={togglePlay}
                  disabled={!trace}
                  className="btn-icon !p-2 bg-slate-800/60 border border-slate-700/50 disabled:opacity-40"
                >
                  {playing ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                </button>
                <button
                  onClick={stepForward}
                  disabled={!trace || animPhase === 'done'}
                  className="btn-icon !p-2 bg-slate-800/60 border border-slate-700/50 disabled:opacity-40"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                <button
                  onClick={resetAnimation}
                  className="btn-icon !p-2 bg-slate-800/60 border border-slate-700/50"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div className="h-5 w-px bg-slate-700/50" />
                <div className="flex items-center gap-1 bg-slate-800/40 rounded-lg p-0.5">
                  {ANIMATION_SPEEDS.map((s, i) => (
                    <button
                      key={s.label}
                      onClick={() => setSpeedIdx(i)}
                      className={`px-2 py-1 text-[10px] rounded-md transition-all font-mono ${
                        i === speedIdx ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <div className="flex-1" />
                {trace && (
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500">
                      Collisions: <span className="text-rose-400 font-semibold">{trace.collisionCount}</span>
                    </span>
                    <span className="text-slate-500">
                      Probes: <span className="text-amber-400 font-semibold">{trace.probeCount}</span>
                    </span>
                    <span className="text-slate-500">
                      Final Slot: <span className="text-emerald-400 font-semibold">{trace.finalSlot}</span>
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}

/* ================================================================== */
/*  SECTION 4: LIVE OPERATION TRACE TIMELINE                          */
/* ================================================================== */

function OperationTraceTimeline({ trace }) {
  if (!trace) return null

  const steps = trace.probingSequence || []

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Activity className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="section-header text-xl">Operation Trace</h2>
          <p className="section-subheader text-xs">
            {trace.operation} on key {trace.inputKey || trace.inputKeyString} -- {trace.message}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {trace.success ? (
            <span className="badge-emerald text-xs"><CheckCircle2 className="w-3 h-3" /> Success</span>
          ) : (
            <span className="badge-rose text-xs"><XCircle className="w-3 h-3" /> Failed</span>
          )}
          <span className="text-[10px] text-slate-600 font-mono">
            {(trace.durationNanos / 1000).toFixed(1)}us
          </span>
        </div>
      </div>

      <div className="glass-card p-4">
        {/* Summary row */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="px-3 py-2 bg-slate-900/60 rounded-lg">
            <span className="text-[10px] text-slate-500 block">Operation</span>
            <span className="text-sm font-semibold text-indigo-400">{trace.operation}</span>
          </div>
          <div className="px-3 py-2 bg-slate-900/60 rounded-lg">
            <span className="text-[10px] text-slate-500 block">Hash</span>
            <span className="text-sm font-mono text-violet-400">{trace.initialHash}</span>
          </div>
          <div className="px-3 py-2 bg-slate-900/60 rounded-lg">
            <span className="text-[10px] text-slate-500 block">Final Slot</span>
            <span className="text-sm font-mono text-emerald-400">{trace.finalSlot}</span>
          </div>
          <div className="px-3 py-2 bg-slate-900/60 rounded-lg">
            <span className="text-[10px] text-slate-500 block">Collisions</span>
            <span className="text-sm font-mono text-rose-400">{trace.collisionCount}</span>
          </div>
          <div className="px-3 py-2 bg-slate-900/60 rounded-lg">
            <span className="text-[10px] text-slate-500 block">Probes</span>
            <span className="text-sm font-mono text-amber-400">{trace.probeCount}</span>
          </div>
          <div className="px-3 py-2 bg-slate-900/60 rounded-lg">
            <span className="text-[10px] text-slate-500 block">Level</span>
            <span className={`text-sm font-semibold ${LEVEL_COLORS[trace.levelName]?.text || 'text-slate-300'}`}>{trace.levelName}</span>
          </div>
        </div>

        {/* Timeline steps */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-700/50" />

          <div className="space-y-2">
            {steps.map((step, idx) => {
              const isLast = idx === steps.length - 1
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="relative flex items-start gap-3 pl-2"
                >
                  {/* Node */}
                  <div className={`
                    relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-[10px] font-bold
                    ${isLast && trace.success ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-400' :
                      step.isCollision ? 'bg-rose-500/15 border-rose-400/40 text-rose-400' :
                      'bg-indigo-500/15 border-indigo-400/30 text-indigo-400'}
                  `}>
                    {step.step}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 px-3 py-2 rounded-lg border text-xs ${
                    isLast && trace.success ? 'bg-emerald-500/5 border-emerald-500/20' :
                    step.isCollision ? 'bg-rose-500/5 border-rose-500/15' :
                    'bg-slate-800/30 border-slate-700/30'
                  }`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-slate-300">Slot {step.slot}</span>
                      <code className="text-[10px] px-2 py-0.5 bg-slate-900/60 rounded text-indigo-400 font-mono">{step.formula}</code>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        step.slotStatus === 'EMPTY' ? 'bg-slate-700/50 text-slate-400' :
                        step.slotStatus === 'OCCUPIED' ? 'bg-indigo-500/15 text-indigo-400' :
                        'bg-rose-500/15 text-rose-400'
                      }`}>
                        {step.slotStatus}
                      </span>
                      {step.isCollision && (
                        <span className="badge-rose text-[9px] !px-1.5 !py-0">Collision</span>
                      )}
                    </div>
                    {step.occupantInfo && (
                      <div className="text-[10px] text-slate-500 mt-1">{step.occupantInfo}</div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
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
        The hash table is empty. Load sample data to start exploring the interactive visualization
        with probing animations and multi-index architecture.
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

export default function Visualization() {
  const [hashTable, setHashTable] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingSample, setLoadingSample] = useState(false)
  const [error, setError] = useState(null)
  const [hoveredStudent, setHoveredStudent] = useState(null)
  const [lastTrace, setLastTrace] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [htRes, stRes] = await Promise.all([
        studentApi.getHashTable(),
        studentApi.getStats(),
      ])
      setHashTable(htRes.data?.data || htRes.data)
      setStats(stRes.data?.data || stRes.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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
      setError(err.message)
    } finally {
      setLoadingSample(false)
    }
  }

  const isEmpty = !loading && (!hashTable?.levels || hashTable.levels.every(l => l.occupiedCount === 0))

  /* Loading state */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading hash table data...</p>
      </div>
    )
  }

  /* Error state */
  if (error && !hashTable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Failed to Load Data</h2>
        <p className="text-slate-400 mb-6 text-sm">{error}</p>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Retry
        </button>
      </div>
    )
  }

  /* Empty state */
  if (isEmpty) {
    return <EmptyState onLoadSample={handleLoadSample} loading={loadingSample} />
  }

  /* Stats summary bar */
  const statsBar = stats ? (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-3 mb-6"
    >
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-400">Total: <span className="text-slate-100 font-semibold">{stats.totalStudents}</span></span>
        </div>
        <div className="h-4 w-px bg-slate-700/50" />
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-violet-400" />
          <span className="text-slate-400">Capacity: <span className="text-slate-100 font-semibold">{stats.totalSlots}</span></span>
        </div>
        <div className="h-4 w-px bg-slate-700/50" />
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">Load: <span className="text-amber-400 font-semibold">{(stats.overallLoadFactor * 100).toFixed(1)}%</span></span>
        </div>
        <div className="h-4 w-px bg-slate-700/50" />
        {LEVEL_NAMES.map(name => (
          <div key={name} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${LEVEL_COLORS[name].bg}`} />
            <span className="text-slate-500">{name}: <span className="text-slate-300 font-semibold">{stats.studentsPerLevel?.[name] || 0}</span></span>
          </div>
        ))}
        <div className="flex-1" />
        <button onClick={fetchData} className="btn-ghost !p-1.5 text-slate-500 hover:text-indigo-400">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  ) : null

  return (
    <div className="space-y-8">
      {statsBar}

      <HashTableGrid
        hashTable={hashTable}
        stats={stats}
        hoveredStudent={hoveredStudent}
        onStudentHover={setHoveredStudent}
      />

      <MultiIndexViz
        hashTable={hashTable}
        hoveredStudent={hoveredStudent}
        onStudentHover={setHoveredStudent}
      />

      <ProbingSimulation
        hashTable={hashTable}
        onOperationComplete={(trace) => {
          setLastTrace(trace)
          fetchData()
        }}
      />

      <OperationTraceTimeline trace={lastTrace} />
    </div>
  )
}
