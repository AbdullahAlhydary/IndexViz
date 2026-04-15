import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Key, User, UserCircle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

function IndexMapViz({ indices }) {
  const [expandedIndex, setExpandedIndex] = useState(null)
  const [selectedKey, setSelectedKey] = useState(null)
  const [selectedType, setSelectedType] = useState(null)

  if (!indices) {
    return (
      <div className="glass-card p-8 text-center">
        <Key className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Load data to view index maps</p>
      </div>
    )
  }

  const indexConfigs = [
    {
      key: 'idMap',
      title: 'ID Index',
      subtitle: 'Student ID to slot',
      icon: Key,
      color: 'emerald',
      data: indices.idMap || {},
    },
    {
      key: 'firstNameMap',
      title: 'First Name Index',
      subtitle: 'Name to identifier indices',
      icon: User,
      color: 'cyan',
      data: indices.firstNameMap || {},
    },
    {
      key: 'lastNameMap',
      title: 'Last Name Index',
      subtitle: 'Name to identifier indices',
      icon: UserCircle,
      color: 'purple',
      data: indices.lastNameMap || {},
    },
  ]

  const colorClasses = {
    emerald: {
      header: 'bg-emerald-500/10 border-emerald-500/30',
      icon: 'text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-400',
      ring: 'ring-emerald-500/50',
    },
    cyan: {
      header: 'bg-cyan-500/10 border-cyan-500/30',
      icon: 'text-cyan-400',
      badge: 'bg-cyan-500/10 text-cyan-400',
      ring: 'ring-cyan-500/50',
    },
    purple: {
      header: 'bg-purple-500/10 border-purple-500/30',
      icon: 'text-purple-400',
      badge: 'bg-purple-500/10 text-purple-400',
      ring: 'ring-purple-500/50',
    },
  }

  const decodeIdentifierIndex = (encoded) => {
    const num = parseInt(encoded)
    if (isNaN(num)) return { slot: encoded, level: '?' }
    const slot = num % 10000
    const level = Math.floor(num / 10000)
    const levelNames = ['FR', 'SO', 'JR', 'SR']
    return { slot, level: levelNames[level] || level }
  }

  const handleKeyClick = (type, key) => {
    if (selectedType === type && selectedKey === key) {
      setSelectedKey(null)
      setSelectedType(null)
    } else {
      setSelectedKey(key)
      setSelectedType(type)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {indexConfigs.map((config) => {
        const colors = colorClasses[config.color]
        const entries = Object.entries(config.data)
        const isExpanded = expandedIndex === config.key

        return (
          <div key={config.key} className="glass-card overflow-hidden">
            <div
              className={clsx('p-4 border-b cursor-pointer transition-colors', colors.header)}
              onClick={() => setExpandedIndex(isExpanded ? null : config.key)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <config.icon className={clsx('w-5 h-5', colors.icon)} />
                  <div>
                    <h3 className="font-semibold text-slate-200 text-sm">{config.title}</h3>
                    <p className="text-xs text-slate-500">{config.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx('text-xs font-mono px-2 py-0.5 rounded-full', colors.badge)}>
                    {entries.length} entries
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="max-h-80 overflow-y-auto p-2">
                    {entries.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No entries</p>
                    ) : (
                      <div className="space-y-1">
                        {entries.map(([key, value]) => {
                          const isSelected = selectedType === config.key && selectedKey === key
                          const valueDisplay = Array.isArray(value)
                            ? value.map((v) => {
                                const decoded = decodeIdentifierIndex(v)
                                return `${decoded.level}:${decoded.slot}`
                              })
                            : config.key === 'idMap'
                            ? [value]
                            : [value]

                          return (
                            <motion.div
                              key={key}
                              layout
                              onClick={() => handleKeyClick(config.key, key)}
                              className={clsx(
                                'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 text-xs',
                                isSelected
                                  ? `bg-slate-700/50 ring-1 ${colors.ring}`
                                  : 'hover:bg-slate-800/50'
                              )}
                            >
                              <span className="font-mono text-slate-300 font-medium truncate min-w-0 flex-shrink">
                                {key}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                              <div className="flex flex-wrap gap-1 flex-1 justify-end">
                                {(Array.isArray(valueDisplay) ? valueDisplay : [valueDisplay]).map((v, i) => (
                                  <span
                                    key={i}
                                    className={clsx(
                                      'font-mono px-1.5 py-0.5 rounded text-xs',
                                      colors.badge
                                    )}
                                  >
                                    {typeof v === 'object' ? JSON.stringify(v) : v}
                                  </span>
                                ))}
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isExpanded && entries.length > 0 && (
              <div className="p-3 text-xs text-slate-500 text-center">
                Click to expand {entries.length} entries
              </div>
            )}
          </div>
        )
      })}

      {selectedKey && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 glass-card p-4"
        >
          <h4 className="text-sm font-semibold text-slate-200 mb-2">Identifier Index Encoding</h4>
          <p className="text-xs text-slate-400 mb-3">
            Each identifier index encodes both slot position and level: <span className="font-mono text-cyan-400">slot + level x 10000</span>
          </p>
          <div className="flex items-center gap-4 font-mono text-sm">
            <span className="text-slate-300">Selected: <span className="text-emerald-400">{selectedKey}</span></span>
            <span className="text-slate-500">in</span>
            <span className="text-cyan-400">{selectedType}</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default IndexMapViz
