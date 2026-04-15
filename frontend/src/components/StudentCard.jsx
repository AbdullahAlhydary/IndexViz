import { motion } from 'framer-motion'
import { Edit3, Trash2, GraduationCap } from 'lucide-react'
import clsx from 'clsx'

const levelColors = {
  FR: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  SO: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  JR: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  SR: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
}

function StudentCard({ student, onEdit, onDelete }) {
  const level = levelColors[student.universityLevel] || levelColors.FR

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card p-5 hover:bg-slate-800/70 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">
              {student.firstName} {student.lastName}
            </h3>
            <p className="text-sm text-slate-500 font-mono">ID: {student.id}</p>
          </div>
        </div>
        <span
          className={clsx(
            'px-3 py-1 text-xs font-semibold rounded-lg border',
            level.bg,
            level.text,
            level.border
          )}
        >
          {student.universityLevel}
        </span>
      </div>

      <div className="text-sm text-slate-400 mb-4">
        <span>DOB: {student.dateOfBirth}</span>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => onEdit(student)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg border border-cyan-500/20 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          onClick={() => onDelete(student)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg border border-rose-500/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </motion.div>
  )
}

export default StudentCard
