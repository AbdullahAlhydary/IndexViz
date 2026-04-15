import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, UserPlus, Filter, ChevronDown, Edit3, Trash2, GraduationCap,
  Loader2, AlertTriangle, X, Hash, ArrowRight, CheckCircle2, XCircle,
  Clock, Zap, Database, RefreshCw, ChevronLeft, ChevronRight, Info,
  Save, User, AlertCircle,
} from 'lucide-react'
import clsx from 'clsx'
import { studentApi } from '../api'
import StudentForm from '../components/StudentForm'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const LEVEL_COLORS = {
  FR: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Freshman' },
  SO: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Sophomore' },
  JR: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Junior' },
  SR: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', label: 'Senior' },
}

const SEARCH_TYPES = [
  { value: 'id', label: 'By ID', icon: Hash, placeholder: 'Enter student ID...' },
  { value: 'firstName', label: 'By First Name', icon: User, placeholder: 'Enter first name...' },
  { value: 'lastName', label: 'By Last Name', icon: User, placeholder: 'Enter last name...' },
]

const STUDENTS_PER_PAGE = 12

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

/* ------------------------------------------------------------------ */
/*  Toast Notification                                                 */
/* ------------------------------------------------------------------ */

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      className={clsx(
        'fixed top-20 left-1/2 z-[60] px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-sm flex items-center gap-3 max-w-md',
        type === 'success' && 'bg-emerald-900/80 border-emerald-500/30 text-emerald-200',
        type === 'error' && 'bg-rose-900/80 border-rose-500/30 text-rose-200',
        type === 'info' && 'bg-indigo-900/80 border-indigo-500/30 text-indigo-200',
      )}
    >
      {type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
      {type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" />}
      {type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Delete Confirmation Modal                                          */
/* ------------------------------------------------------------------ */

function DeleteConfirm({ student, onConfirm, onCancel, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md glass-card p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Delete Student</h2>
            <p className="text-sm text-slate-400">This action cannot be undone</p>
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50 mb-6">
          <p className="text-slate-300 text-sm">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-white">{student.firstName} {student.lastName}</span>{' '}
            (ID: <span className="font-mono text-rose-400">{student.id}</span>)?
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger flex items-center gap-2 flex-1 justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {loading ? 'Deleting...' : 'Delete Student'}
          </button>
          <button onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Operation Trace Panel                                              */
/* ------------------------------------------------------------------ */

function TracePanel({ trace }) {
  if (!trace) {
    return (
      <div className="glass-card p-8 text-center sticky top-20">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
          <Hash className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Operation Trace</h3>
        <p className="text-sm text-slate-400 max-w-xs mx-auto">
          Perform an operation (add, edit, delete, or search) to see a detailed step-by-step
          trace of the hashing and probing process.
        </p>
      </div>
    )
  }

  const operationColors = {
    INSERT: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'INSERT' },
    DELETE: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', label: 'DELETE' },
    SEARCH_BY_ID: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', label: 'SEARCH' },
    SEARCH_BY_FIRST_NAME: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30', label: 'SEARCH' },
    SEARCH_BY_LAST_NAME: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30', label: 'SEARCH' },
    UPDATE: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'UPDATE' },
  }

  const opStyle = operationColors[trace.operation] || operationColors.INSERT
  const probingSeq = trace.probingSequence || []

  return (
    <div className="glass-card overflow-hidden sticky top-20">
      {/* Header */}
      <div className={clsx('p-4 border-b border-slate-700/50', opStyle.bg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={clsx('px-3 py-1 text-xs font-bold rounded-lg border', opStyle.bg, opStyle.text, opStyle.border)}>
              {opStyle.label}
            </span>
            <span className="text-sm font-semibold text-slate-200">{trace.operation} Operation</span>
          </div>
          {trace.success ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Success
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-rose-400">
              <XCircle className="w-3.5 h-3.5" />
              Failed
            </span>
          )}
        </div>
        {trace.message && (
          <p className="text-xs text-slate-400 mt-2">{trace.message}</p>
        )}
      </div>

      {/* Hash Info */}
      <div className="p-4 border-b border-slate-700/30">
        <div className="flex items-center gap-2 text-sm mb-3">
          <Hash className="w-4 h-4 text-cyan-400" />
          <span className="font-medium text-cyan-400">Hash Computation</span>
        </div>
        <div className="font-mono text-base text-slate-200 bg-slate-900/60 rounded-xl p-3 text-center border border-slate-800/50">
          <span className="text-sm text-slate-500">h(</span>
          <span className="text-cyan-400">{trace.inputKey || trace.inputKeyString}</span>
          <span className="text-sm text-slate-500">) = </span>
          <span className="text-cyan-400">{trace.inputKey || trace.inputKeyString}</span>
          <span className="text-slate-500"> % 151 = </span>
          <span className="text-emerald-400 font-bold">{trace.initialHash}</span>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center font-mono">{trace.hashFunction}</p>
        {trace.levelName && (
          <div className="mt-2 text-center">
            <span className="text-xs text-slate-500">Target Level: </span>
            <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-md border',
              LEVEL_COLORS[trace.levelName]?.bg,
              LEVEL_COLORS[trace.levelName]?.text,
              LEVEL_COLORS[trace.levelName]?.border,
            )}>
              {trace.levelName}
            </span>
          </div>
        )}
      </div>

      {/* Probing Sequence */}
      <div className="p-4 border-b border-slate-700/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-300">Probing Sequence</span>
          <span className="text-xs text-slate-500 font-mono">{probingSeq.length} step{probingSeq.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {probingSeq.map((step, i) => {
            const isLast = i === probingSeq.length - 1
            const isCollision = step.isCollision
            const isEmpty = step.slotStatus === 'EMPTY'
            const isDeleted = step.slotStatus === 'DELETED'
            const isSuccess = isLast && trace.success

            let stepColor = 'border-slate-700/50 bg-slate-900/30'
            let iconEl = <ArrowRight className="w-4 h-4 text-slate-500" />

            if (isSuccess && !isCollision) {
              stepColor = 'border-emerald-500/40 bg-emerald-500/5'
              iconEl = <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            } else if (isCollision) {
              stepColor = 'border-rose-500/30 bg-rose-500/5'
              iconEl = <XCircle className="w-4 h-4 text-rose-400" />
            } else if (isDeleted) {
              stepColor = 'border-amber-500/30 bg-amber-500/5'
              iconEl = <AlertCircle className="w-4 h-4 text-amber-400" />
            } else if (isEmpty) {
              stepColor = 'border-emerald-500/30 bg-emerald-500/5'
              iconEl = <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            }

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className={clsx('border rounded-xl p-3 transition-all duration-200', stepColor)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800/80 text-xs font-mono font-bold text-slate-300 flex-shrink-0">
                    {step.step}
                  </div>
                  {iconEl}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold text-sm text-slate-200">
                        Slot [{step.slot}]
                      </span>
                      <span className={clsx(
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                        step.slotStatus === 'OCCUPIED' ? 'bg-indigo-500/15 text-indigo-400' :
                        step.slotStatus === 'EMPTY' ? 'bg-slate-700/50 text-slate-400' :
                        'bg-rose-500/15 text-rose-400'
                      )}>
                        {step.slotStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono truncate">{step.formula}</p>
                    {step.occupantInfo && (
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{step.occupantInfo}</p>
                    )}
                  </div>
                  {isCollision && (
                    <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded flex-shrink-0">
                      COLLISION
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-4 border-b border-slate-700/30">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Final Slot</p>
            <p className="text-lg font-bold font-mono text-emerald-400">{trace.finalSlot ?? '-'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Collisions</p>
            <p className="text-lg font-bold font-mono text-rose-400">{trace.collisionCount ?? 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Probes</p>
            <p className="text-lg font-bold font-mono text-cyan-400">{trace.probeCount ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Index Updates */}
      {trace.indexUpdates && (
        <div className="p-4 border-b border-slate-700/30">
          <div className="flex items-center gap-2 text-sm mb-3">
            <Database className="w-4 h-4 text-violet-400" />
            <span className="font-medium text-violet-400">Index Updates</span>
          </div>
          <div className="space-y-2">
            {Object.entries(trace.indexUpdates).map(([indexName, update]) => (
              <div key={indexName} className="flex items-center gap-2 text-xs p-2 bg-slate-900/40 rounded-lg">
                <span className="font-mono font-semibold text-slate-300 min-w-[100px]">{indexName}</span>
                <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                <span className="text-slate-400 truncate">
                  {update.key && <span className="font-mono text-cyan-400">{update.key}</span>}
                  {update.value !== undefined && (
                    <span className="ml-1 text-slate-500">= <span className="text-emerald-400">{update.value}</span></span>
                  )}
                  {update.action && (
                    <span className={clsx(
                      'ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold',
                      update.action === 'added' ? 'bg-emerald-500/10 text-emerald-400' :
                      update.action === 'removed' ? 'bg-rose-500/10 text-rose-400' :
                      'bg-slate-700/50 text-slate-400'
                    )}>
                      {update.action}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Duration */}
      {trace.durationNanos != null && (
        <div className="p-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Execution Time</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono font-semibold text-amber-400">
                {trace.durationNanos.toLocaleString()} ns
              </span>
              <span className="text-slate-500">
                ({(trace.durationNanos / 1_000_000).toFixed(3)} ms)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function StudentManagement() {
  /* ---- State ---- */
  const [students, setStudents] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Search
  const [searchType, setSearchType] = useState('id')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false)

  // Filter
  const [levelFilter, setLevelFilter] = useState('ALL')

  // Pagination
  const [page, setPage] = useState(0)

  // Modals
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [deletingStudent, setDeletingStudent] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Trace
  const [trace, setTrace] = useState(null)

  const searchInputRef = useRef(null)
  const searchDropdownRef = useRef(null)

  /* ---- Close dropdown on outside click ---- */
  useEffect(() => {
    const handle = (e) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) {
        setSearchDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  /* ---- Fetch all students ---- */
  const fetchStudents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await studentApi.getAll()
      const data = res.data?.data || res.data || []
      const list = Array.isArray(data) ? data : []
      setAllStudents(list)
      setStudents(list)
      setPage(0)
    } catch (err) {
      setError(err.message || 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  /* ---- Derived: filtered + paginated ---- */
  const filteredStudents = levelFilter === 'ALL'
    ? students
    : students.filter((s) => s.universityLevel === levelFilter)

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE))
  const paginatedStudents = filteredStudents.slice(
    page * STUDENTS_PER_PAGE,
    (page + 1) * STUDENTS_PER_PAGE
  )

  /* ---- Search ---- */
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setStudents(allStudents)
      setPage(0)
      return
    }

    setSearchLoading(true)
    setError(null)

    try {
      let res
      if (searchType === 'id') {
        res = await studentApi.searchById(searchQuery.trim())
      } else if (searchType === 'firstName') {
        res = await studentApi.searchByFirstName(searchQuery.trim())
      } else {
        res = await studentApi.searchByLastName(searchQuery.trim())
      }

      const responseData = res.data
      const traceData = responseData?.trace || null
      if (traceData) setTrace(traceData)

      const resultData = responseData?.data
      if (resultData) {
        const resultList = Array.isArray(resultData) ? resultData : [resultData]
        setStudents(resultList)
      } else {
        setStudents([])
      }
      setPage(0)
      if (responseData?.message) {
        setToast({ message: responseData.message, type: responseData.success ? 'info' : 'error' })
      }
    } catch (err) {
      setStudents([])
      setToast({ message: err.message || 'Search failed', type: 'error' })
    } finally {
      setSearchLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setStudents(allStudents)
    setPage(0)
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  /* ---- Filter by level ---- */
  const handleLevelFilter = async (level) => {
    setLevelFilter(level)
    setPage(0)

    if (level === 'ALL') {
      if (searchQuery.trim()) return
      setStudents(allStudents)
      return
    }

    try {
      const res = await studentApi.getByLevel(level)
      const data = res.data?.data || res.data || []
      const list = Array.isArray(data) ? data : []
      setStudents(list)
      setSearchQuery('')
    } catch (err) {
      setToast({ message: err.message || 'Failed to filter by level', type: 'error' })
    }
  }

  /* ---- Add Student ---- */
  const handleAddStudent = async (formData) => {
    const res = await studentApi.addStudent(formData)
    const responseData = res.data
    if (responseData?.trace) setTrace(responseData.trace)
    setShowAddForm(false)
    setToast({ message: responseData?.message || 'Student added successfully', type: 'success' })
    await fetchStudents()
  }

  /* ---- Edit Student ---- */
  const handleEditStudent = async (formData) => {
    const res = await studentApi.updateStudent(formData.id, formData)
    const responseData = res.data
    if (responseData?.trace) setTrace(responseData.trace)
    setEditingStudent(null)
    setToast({ message: responseData?.message || 'Student updated successfully', type: 'success' })
    await fetchStudents()
  }

  /* ---- Delete Student ---- */
  const handleDeleteStudent = async () => {
    if (!deletingStudent) return
    setDeleteLoading(true)
    try {
      const res = await studentApi.deleteStudent(deletingStudent.id)
      const responseData = res.data
      if (responseData?.trace) setTrace(responseData.trace)
      setToast({ message: responseData?.message || 'Student deleted', type: 'success' })
      setDeletingStudent(null)
      await fetchStudents()
    } catch (err) {
      setToast({ message: err.message || 'Delete failed', type: 'error' })
    } finally {
      setDeleteLoading(false)
    }
  }

  /* ---- Render ---- */
  const currentSearchType = SEARCH_TYPES.find((t) => t.value === searchType)

  return (
    <div className="relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showAddForm && (
          <StudentForm
            mode="add"
            onSubmit={handleAddStudent}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingStudent && (
          <StudentForm
            mode="edit"
            initialData={editingStudent}
            onSubmit={handleEditStudent}
            onCancel={() => setEditingStudent(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingStudent && (
          <DeleteConfirm
            student={deletingStudent}
            onConfirm={handleDeleteStudent}
            onCancel={() => setDeletingStudent(null)}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>

      {/* Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT COLUMN - Student List */}
        <div className="flex-1 lg:w-[60%] min-w-0 space-y-4">
          {/* Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Search type dropdown */}
                <div className="relative" ref={searchDropdownRef}>
                  <button
                    onClick={() => setSearchDropdownOpen(!searchDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-sm text-slate-300 hover:bg-slate-800/80 transition-colors whitespace-nowrap"
                  >
                    {currentSearchType && <currentSearchType.icon className="w-4 h-4 text-slate-400" />}
                    <span className="hidden sm:inline">{currentSearchType?.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <AnimatePresence>
                    {searchDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-30"
                      >
                        {SEARCH_TYPES.map((st) => (
                          <button
                            key={st.value}
                            onClick={() => {
                              setSearchType(st.value)
                              setSearchDropdownOpen(false)
                              searchInputRef.current?.focus()
                            }}
                            className={clsx(
                              'flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-colors',
                              searchType === st.value
                                ? 'bg-indigo-500/10 text-indigo-400'
                                : 'text-slate-300 hover:bg-slate-700/50'
                            )}
                          >
                            <st.icon className="w-4 h-4" />
                            {st.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Search input */}
                <div className="flex-1 relative">
                  <input
                    ref={searchInputRef}
                    type={searchType === 'id' ? 'number' : 'text'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={currentSearchType?.placeholder}
                    className="input-field pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search button */}
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="btn-primary flex items-center gap-2 py-3 px-4"
                >
                  {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>

              {/* Add button */}
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex items-center gap-2 py-3 px-4 whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>

            {/* Level filter pills */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Filter className="w-4 h-4 text-slate-500" />
              <button
                onClick={() => handleLevelFilter('ALL')}
                className={clsx(
                  'px-3 py-1 text-xs font-semibold rounded-lg border transition-all',
                  levelFilter === 'ALL'
                    ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50'
                )}
              >
                All
              </button>
              {['FR', 'SO', 'JR', 'SR'].map((lvl) => {
                const lc = LEVEL_COLORS[lvl]
                return (
                  <button
                    key={lvl}
                    onClick={() => handleLevelFilter(lvl)}
                    className={clsx(
                      'px-3 py-1 text-xs font-semibold rounded-lg border transition-all',
                      levelFilter === lvl
                        ? clsx(lc.bg, lc.text, lc.border)
                        : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50'
                    )}
                  >
                    {lvl}
                  </button>
                )
              })}
              <span className="text-xs text-slate-500 ml-auto">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span className="text-sm text-rose-300">{error}</span>
              <button onClick={fetchStudents} className="ml-auto text-xs text-rose-400 hover:text-rose-300 underline">
                Retry
              </button>
            </motion.div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredStudents.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-12 text-center"
            >
              <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-200 mb-2">
                {searchQuery ? 'No Results Found' : 'No Students Yet'}
              </h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
                {searchQuery
                  ? `No students match your search for "${searchQuery}". Try a different query.`
                  : 'Add students manually or load sample data from the Dashboard to get started.'}
              </p>
              {!searchQuery && (
                <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center gap-2 mx-auto">
                  <UserPlus className="w-4 h-4" />
                  Add First Student
                </button>
              )}
            </motion.div>
          )}

          {/* Student Grid */}
          {!loading && paginatedStudents.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <AnimatePresence mode="popLayout">
                {paginatedStudents.map((student) => {
                  const lc = LEVEL_COLORS[student.universityLevel] || LEVEL_COLORS.FR
                  return (
                    <motion.div
                      key={student.id}
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="glass-card p-4 hover:bg-slate-800/70 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-4.5 h-4.5 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-100 text-sm truncate">
                              {student.firstName} {student.lastName}
                            </h3>
                            <p className="text-xs text-slate-500 font-mono">ID: {student.id}</p>
                          </div>
                        </div>
                        <span className={clsx('px-2.5 py-0.5 text-[10px] font-bold rounded-md border flex-shrink-0', lc.bg, lc.text, lc.border)}>
                          {student.universityLevel}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 mb-3 ml-12">
                        DOB: {student.dateOfBirth}
                      </div>

                      <div className="flex items-center gap-2 ml-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg border border-cyan-500/20 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingStudent(student)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg border border-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between glass-card p-3"
            >
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="btn-ghost flex items-center gap-1 text-sm py-1.5 px-3 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={clsx(
                      'w-8 h-8 rounded-lg text-xs font-semibold transition-all',
                      page === i
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-400 hover:bg-slate-800/50'
                    )}
                  >
                    {i + 1}
                  </button>
                )).slice(
                  Math.max(0, page - 2),
                  Math.min(totalPages, page + 3)
                )}
                {page + 3 < totalPages && <span className="text-slate-500 px-1">...</span>}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="btn-ghost flex items-center gap-1 text-sm py-1.5 px-3 disabled:opacity-30"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>

        {/* RIGHT COLUMN - Trace Panel */}
        <div className="lg:w-[40%] flex-shrink-0">
          <TracePanel trace={trace} />
        </div>
      </div>
    </div>
  )
}
