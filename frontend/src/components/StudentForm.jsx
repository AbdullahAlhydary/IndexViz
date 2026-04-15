import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, UserPlus, Loader2 } from 'lucide-react'

const levels = ['FR', 'SO', 'JR', 'SR']

function StudentForm({ onSubmit, onCancel, initialData, mode = 'add' }) {
  const [form, setForm] = useState({
    id: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    universityLevel: 'FR',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id || '',
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        dateOfBirth: initialData.dateOfBirth || '',
        universityLevel: initialData.universityLevel || 'FR',
      })
    }
  }, [initialData])

  const validate = () => {
    const newErrors = {}
    if (!form.id || isNaN(form.id) || parseInt(form.id) <= 0) {
      newErrors.id = 'ID must be a positive integer'
    }
    if (!form.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!form.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }
    if (!levels.includes(form.universityLevel)) {
      newErrors.universityLevel = 'Must be FR, SO, JR, or SR'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await onSubmit({
        ...form,
        id: parseInt(form.id),
      })
    } catch (err) {
      setErrors({ submit: err.message || 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <AnimatePresence>
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
          className="w-full max-w-lg glass-card p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              {mode === 'add' ? (
                <>
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  Add New Student
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 text-cyan-400" />
                  Edit Student
                </>
              )}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Student ID
              </label>
              <input
                type="number"
                value={form.id}
                onChange={(e) => handleChange('id', e.target.value)}
                className="input-field"
                placeholder="e.g., 45231"
                disabled={mode === 'edit'}
              />
              {errors.id && (
                <p className="mt-1 text-xs text-rose-400">{errors.id}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="input-field"
                  placeholder="Mohammed"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-rose-400">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="input-field"
                  placeholder="Al-Ghamdi"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-rose-400">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Date of Birth
              </label>
              <input
                type="text"
                value={form.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="input-field"
                placeholder="DD/MM/YYYY"
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-xs text-rose-400">{errors.dateOfBirth}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                University Level
              </label>
              <select
                value={form.universityLevel}
                onChange={(e) => handleChange('universityLevel', e.target.value)}
                className="select-field"
              >
                {levels.map((l) => (
                  <option key={l} value={l}>
                    {l} - {l === 'FR' ? 'Freshman' : l === 'SO' ? 'Sophomore' : l === 'JR' ? 'Junior' : 'Senior'}
                  </option>
                ))}
              </select>
              {errors.universityLevel && (
                <p className="mt-1 text-xs text-rose-400">{errors.universityLevel}</p>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-sm text-rose-400">
                {errors.submit}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2 flex-1 justify-center"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : mode === 'add' ? (
                  <UserPlus className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? 'Saving...' : mode === 'add' ? 'Add Student' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default StudentForm
