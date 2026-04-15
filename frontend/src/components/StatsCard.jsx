import { motion } from 'framer-motion'
import clsx from 'clsx'

const colorMap = {
  emerald: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-500/5',
    icon: 'text-emerald-400 bg-emerald-500/10',
    value: 'text-emerald-400',
  },
  cyan: {
    border: 'border-l-cyan-500',
    bg: 'bg-cyan-500/5',
    icon: 'text-cyan-400 bg-cyan-500/10',
    value: 'text-cyan-400',
  },
  amber: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-500/5',
    icon: 'text-amber-400 bg-amber-500/10',
    value: 'text-amber-400',
  },
  rose: {
    border: 'border-l-rose-500',
    bg: 'bg-rose-500/5',
    icon: 'text-rose-400 bg-rose-500/10',
    value: 'text-rose-400',
  },
  purple: {
    border: 'border-l-purple-500',
    bg: 'bg-purple-500/5',
    icon: 'text-purple-400 bg-purple-500/10',
    value: 'text-purple-400',
  },
}

function StatsCard({ title, value, subtitle, icon: Icon, color = 'emerald' }) {
  const colors = colorMap[color] || colorMap.emerald

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'glass-card border-l-4 p-6 hover:bg-slate-800/70 transition-all duration-300',
        colors.border,
        colors.bg
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <p className={clsx('text-3xl font-bold tracking-tight', colors.value)}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-xl', colors.icon)}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StatsCard
