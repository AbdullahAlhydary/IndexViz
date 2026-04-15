import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  Upload,
  RotateCcw,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  FileUp,
  Users,
  Hash,
  Loader2,
  Info,
  BarChart3,
} from 'lucide-react'
import { studentApi } from '../api'

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

/* ------------------------------------------------------------------ */
/*  Toast notification system                                          */
/* ------------------------------------------------------------------ */

function Toast({ toast, onDismiss }) {
  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
  }

  const borderMap = {
    success: 'border-emerald-500/30',
    error: 'border-rose-500/30',
    warning: 'border-amber-500/30',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 px-5 py-4 bg-slate-800/90 backdrop-blur-xl border ${borderMap[toast.type]} rounded-xl shadow-2xl max-w-md w-full`}
    >
      {iconMap[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-100">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-slate-400 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Confirm Dialog                                                     */
/* ------------------------------------------------------------------ */

function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-card p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-rose-500/10">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        </div>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-ghost text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger text-sm flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Reset All Data
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  CSV Preview Table                                                  */
/* ------------------------------------------------------------------ */

function CsvPreview({ rows, headers }) {
  if (!headers || headers.length === 0) return null

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-700/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-800/80">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className={ri % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/20'}
            >
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2 text-slate-300 whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Level badge component                                              */
/* ------------------------------------------------------------------ */

const levelColors = {
  FR: 'badge-indigo',
  SO: 'badge-violet',
  JR: 'badge-amber',
  SR: 'badge-emerald',
}

const levelLabels = {
  FR: 'Freshman',
  SO: 'Sophomore',
  JR: 'Junior',
  SR: 'Senior',
}

/* ------------------------------------------------------------------ */
/*  Main Import Page                                                   */
/* ------------------------------------------------------------------ */

function Import() {
  // Toast state
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)

  // Operation loading states
  const [loadingSample, setLoadingSample] = useState(false)
  const [loadingImport, setLoadingImport] = useState(false)
  const [loadingReset, setLoadingReset] = useState(false)

  // CSV state
  const [csvContent, setCsvContent] = useState(null)
  const [csvFileName, setCsvFileName] = useState('')
  const [csvPreviewHeaders, setCsvPreviewHeaders] = useState([])
  const [csvPreviewRows, setCsvPreviewRows] = useState([])

  // Drag state
  const [isDragging, setIsDragging] = useState(false)

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Stats
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const fileInputRef = useRef(null)

  // ---- Toast helpers ----
  const addToast = useCallback((type, title, message) => {
    const id = ++toastId.current
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ---- Fetch stats ----
  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await studentApi.getStats()
      setStats(res.data?.data || res.data)
    } catch {
      // silently fail
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // ---- Load Sample Data ----
  const handleLoadSample = async () => {
    setLoadingSample(true)
    try {
      const res = await studentApi.loadSample()
      const data = res.data
      const count = data?.data?.totalStudents || data?.data?.count || data?.message?.match(/\d+/)?.[0] || '200+'
      addToast('success', 'Sample Data Loaded', `Successfully loaded ${count} student records.`)
      fetchStats()
    } catch (err) {
      addToast('error', 'Failed to Load Sample', err.message)
    } finally {
      setLoadingSample(false)
    }
  }

  // ---- Parse CSV file ----
  const parseCsvFile = useCallback((file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      addToast('error', 'Invalid File Type', 'Please select a .csv file.')
      return
    }

    setCsvFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      setCsvContent(text)

      // Parse preview (first 5 data rows)
      const lines = text.split('\n').filter((l) => l.trim() !== '')
      if (lines.length > 0) {
        const headers = lines[0].split(',').map((h) => h.trim())
        setCsvPreviewHeaders(headers)
        const dataRows = lines.slice(1, 6).map((line) =>
          line.split(',').map((c) => c.trim())
        )
        setCsvPreviewRows(dataRows)
      }
    }
    reader.readAsText(file)
  }, [addToast])

  // ---- Import CSV ----
  const handleImportCsv = async () => {
    if (!csvContent) return
    setLoadingImport(true)
    try {
      const res = await studentApi.importCsv(csvContent)
      const data = res.data
      const count = data?.data?.totalStudents || data?.data?.count || data?.message?.match(/\d+/)?.[0] || 'your'
      addToast('success', 'CSV Imported', `Successfully imported ${count} student records from ${csvFileName}.`)
      // Reset CSV state
      setCsvContent(null)
      setCsvFileName('')
      setCsvPreviewHeaders([])
      setCsvPreviewRows([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchStats()
    } catch (err) {
      addToast('error', 'Import Failed', err.message)
    } finally {
      setLoadingImport(false)
    }
  }

  // ---- Reset ----
  const handleReset = async () => {
    setLoadingReset(true)
    try {
      await studentApi.reset()
      addToast('success', 'Data Reset', 'All student records have been cleared.')
      setConfirmOpen(false)
      fetchStats()
    } catch (err) {
      addToast('error', 'Reset Failed', err.message)
      setConfirmOpen(false)
    } finally {
      setLoadingReset(false)
    }
  }

  // ---- Drag & Drop handlers ----
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      const file = e.dataTransfer?.files?.[0]
      if (file) parseCsvFile(file)
    },
    [parseCsvFile]
  )

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (file) parseCsvFile(file)
    },
    [parseCsvFile]
  )

  // ---- Derived values ----
  const hasData = stats && (stats.totalStudents > 0 || stats.total > 0)
  const totalStudents = stats?.totalStudents ?? stats?.total ?? 0
  const levelCounts = stats?.levelCounts || stats?.studentsPerLevel || {}
  const loadFactor = stats?.loadFactor ?? stats?.averageLoadFactor ?? null

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <AnimatePresence>
        {confirmOpen && (
          <ConfirmDialog
            open={confirmOpen}
            title="Reset All Data"
            message="Are you sure? This will permanently delete all student records and reset the hash table engine. This action cannot be undone."
            onConfirm={handleReset}
            onCancel={() => setConfirmOpen(false)}
            loading={loadingReset}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants}>
          <h1 className="section-header">Data Import</h1>
          <p className="section-subheader">
            Load sample data, import CSV files, or reset the dataset
          </p>
        </motion.div>

        {/* Section 1: Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Load Sample Data */}
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-500/10">
                <Database className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                Load Sample Data
              </h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed flex-1">
              Load 200+ pre-built student records with realistic data across all 4 academic levels.
            </p>
            {hasData && (
              <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-xs text-amber-400">
                  This will add to existing data
                </span>
              </div>
            )}
            <button
              onClick={handleLoadSample}
              disabled={loadingSample}
              className="btn-primary mt-4 w-full flex items-center justify-center gap-2 text-sm"
            >
              {loadingSample ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Load Sample Data
                </>
              )}
            </button>
          </motion.div>

          {/* Card 2: Import CSV */}
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-violet-500/10">
                <Upload className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                Import CSV
              </h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed flex-1">
              Import your own student records from a CSV file. Supports drag & drop.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {csvFileName ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700/50">
                  <FileText className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300 truncate">{csvFileName}</span>
                  <button
                    onClick={() => {
                      setCsvContent(null)
                      setCsvFileName('')
                      setCsvPreviewHeaders([])
                      setCsvPreviewRows([])
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="ml-auto p-1 rounded text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={handleImportCsv}
                  disabled={loadingImport}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
                >
                  {loadingImport ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Import {csvPreviewRows.length > 0 ? `(${csvPreviewRows.length}+ rows)` : ''}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary mt-4 w-full flex items-center justify-center gap-2 text-sm"
              >
                <FileUp className="w-4 h-4" />
                Choose File
              </button>
            )}
          </motion.div>

          {/* Card 3: Reset Dataset */}
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10">
                <RotateCcw className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                Reset Dataset
              </h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed flex-1">
              Clear all student records and reset the hash table engine. This action cannot be undone.
            </p>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={loadingReset}
              className="btn-danger mt-4 w-full flex items-center justify-center gap-2 text-sm"
            >
              {loadingReset ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Reset All Data
                </>
              )}
            </button>
          </motion.div>
        </div>

        {/* Section 4: Drag & Drop Zone */}
        <motion.div variants={itemVariants}>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
              flex flex-col items-center justify-center py-16 px-8
              ${
                isDragging
                  ? 'border-indigo-400 bg-indigo-500/5 shadow-lg shadow-indigo-500/10'
                  : 'border-slate-700/60 bg-slate-800/20 hover:border-slate-600/60 hover:bg-slate-800/30'
              }
            `}
          >
            <motion.div
              animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="mb-4"
            >
              <div className={`p-4 rounded-2xl ${isDragging ? 'bg-indigo-500/15' : 'bg-slate-800/60'} transition-colors duration-300`}>
                <FileUp className={`w-10 h-10 ${isDragging ? 'text-indigo-400' : 'text-slate-500'} transition-colors duration-300`} />
              </div>
            </motion.div>
            <p className={`text-lg font-medium mb-2 transition-colors duration-300 ${isDragging ? 'text-indigo-300' : 'text-slate-300'}`}>
              {isDragging ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
            </p>
            <p className="text-sm text-slate-500">
              or{' '}
              <span className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2 decoration-indigo-400/30">
                click to browse
              </span>
            </p>
            <p className="text-xs text-slate-600 mt-3">Accepts .csv files only</p>
          </div>
        </motion.div>

        {/* CSV Preview */}
        <AnimatePresence>
          {csvPreviewHeaders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-semibold text-slate-100">
                    Preview: {csvFileName}
                  </h3>
                  <span className="badge-violet ml-auto">
                    {csvPreviewRows.length} row{csvPreviewRows.length !== 1 ? 's' : ''} shown
                  </span>
                </div>
                <CsvPreview headers={csvPreviewHeaders} rows={csvPreviewRows} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section 2: CSV Format Guide */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-100">CSV Format Guide</h3>
          </div>
          <div className="code-block text-indigo-300">
            <div className="text-slate-500 text-xs mb-3">{'// Expected CSV format'}</div>
            <div className="text-violet-400">ID,Last_Name,First_Name,Date_of_Birth,University_Level</div>
            <div className="text-slate-400 mt-1">45231,Al-Ghamdi,Mohammed,15/05/2005,FR</div>
            <div className="text-slate-400">78456,Al-Otaibi,Abdullah,23/11/2004,SO</div>
            <div className="text-slate-400">62189,Al-Shehri,Khalid,08/03/2003,JR</div>
            <div className="text-slate-400">93014,Al-Dosari,Faisal,19/07/2002,SR</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <div className="flex items-start gap-2.5">
              <Hash className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-300">ID</p>
                <p className="text-xs text-slate-500">5-digit integer (10000 - 99999)</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Users className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-300">University Level</p>
                <p className="text-xs text-slate-500">FR, SO, JR, or SR</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-300">Date Format</p>
                <p className="text-xs text-slate-500">dd/mm/yyyy</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <BarChart3 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-300">Headers</p>
                <p className="text-xs text-slate-500">First row must contain column headers</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 3: Engine Status / Import History */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-semibold text-slate-100">Engine Status</h3>
            </div>
            <button
              onClick={fetchStats}
              disabled={statsLoading}
              className="btn-ghost text-xs flex items-center gap-1.5"
            >
              {statsLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              Refresh
            </button>
          </div>

          {stats ? (
            <div className="space-y-5">
              {/* Total students and load factor */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/60">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold text-indigo-400">{totalStudents}</p>
                </div>
                {loadFactor !== null && (
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/60">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                      Load Factor
                    </p>
                    <p className="text-2xl font-bold text-violet-400">
                      {typeof loadFactor === 'number'
                        ? `${(loadFactor * 100).toFixed(1)}%`
                        : loadFactor}
                    </p>
                  </div>
                )}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/60">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                    Capacity
                  </p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {stats.capacity || '151'}
                  </p>
                </div>
              </div>

              {/* Per-level breakdown */}
              {Object.keys(levelCounts).length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                    Students by Level
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['FR', 'SO', 'JR', 'SR'].map((level) => {
                      const count = levelCounts[level] ?? levelCounts[level.toLowerCase()] ?? 0
                      const maxCount = Math.max(
                        ...Object.values(levelCounts).map(Number),
                        1
                      )
                      const pct = (count / maxCount) * 100

                      return (
                        <div
                          key={level}
                          className="bg-slate-900/50 rounded-xl p-3 border border-slate-800/60"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={levelColors[level]}>{level}</span>
                            <span className="text-sm font-bold text-slate-200">{count}</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                            />
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{levelLabels[level]}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              {statsLoading ? (
                <>
                  <Loader2 className="w-8 h-8 text-slate-600 animate-spin mb-3" />
                  <p className="text-sm text-slate-500">Loading engine status...</p>
                </>
              ) : (
                <>
                  <Database className="w-8 h-8 text-slate-700 mb-3" />
                  <p className="text-sm text-slate-500">
                    No data available. Load sample data or import a CSV to get started.
                  </p>
                </>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  )
}

export default Import
