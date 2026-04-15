import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

function HashTableGrid({ slots = [], highlightedSlots = [], probePath = [], animationSpeed = 500 }) {
  const [tooltip, setTooltip] = useState(null)
  const [animatedIndex, setAnimatedIndex] = useState(-1)
  const [probeHistory, setProbeHistory] = useState([])
  const animationRef = useRef(null)

  useEffect(() => {
    if (probePath.length === 0) {
      setAnimatedIndex(-1)
      setProbeHistory([])
      if (animationRef.current) clearTimeout(animationRef.current)
      return
    }

    setAnimatedIndex(-1)
    setProbeHistory([])

    let step = 0
    const animate = () => {
      if (step < probePath.length) {
        setAnimatedIndex(probePath[step].slot)
        setProbeHistory((prev) => [...prev, probePath[step]])
        step++
        animationRef.current = setTimeout(animate, animationSpeed)
      }
    }

    animationRef.current = setTimeout(animate, 300)

    return () => {
      if (animationRef.current) clearTimeout(animationRef.current)
    }
  }, [probePath, animationSpeed])

  const getSlotStyle = (slot, index) => {
    const isAnimating = animatedIndex === index
    const isInHistory = probeHistory.some((p) => p.slot === index)
    const isHighlighted = highlightedSlots.includes(index)
    const isTarget = probeHistory.length > 0 && probeHistory[probeHistory.length - 1]?.slot === index && probeHistory[probeHistory.length - 1]?.isTarget

    if (isAnimating && isTarget) {
      return 'bg-emerald-500 text-white ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-emerald-500/40 scale-110'
    }
    if (isAnimating) {
      return 'bg-amber-500 text-white ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-amber-500/40 scale-110'
    }
    if (isInHistory) {
      const historyStep = probeHistory.find((p) => p.slot === index)
      if (historyStep?.isTarget) {
        return 'bg-emerald-600/80 text-white ring-1 ring-emerald-500/50'
      }
      return 'bg-rose-500/30 text-rose-300 ring-1 ring-rose-500/30'
    }
    if (isHighlighted) {
      return 'bg-cyan-500/30 text-cyan-300 ring-1 ring-cyan-500/50'
    }

    switch (slot.status) {
      case 'OCCUPIED':
        return 'bg-emerald-600/20 text-emerald-300 border-emerald-500/20'
      case 'DELETED':
        return 'bg-rose-500/10 text-rose-400/60 border-rose-500/20'
      case 'EMPTY':
      default:
        return 'bg-slate-800/40 text-slate-600 border-slate-700/30'
    }
  }

  const handleMouseEnter = (e, slot, index) => {
    if (slot.status === 'OCCUPIED' && slot.student) {
      const rect = e.currentTarget.getBoundingClientRect()
      setTooltip({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        student: slot.student,
        index,
        hash: slot.hashOfStudent,
      })
    }
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 justify-center">
        {slots.map((slot, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.003, type: 'spring', stiffness: 500, damping: 30 }}
            className={clsx(
              'w-10 h-10 rounded-lg flex items-center justify-center text-xs font-mono font-medium',
              'border cursor-pointer transition-all duration-200 relative',
              getSlotStyle(slot, index)
            )}
            onMouseEnter={(e) => handleMouseEnter(e, slot, index)}
            onMouseLeave={() => setTooltip(null)}
          >
            {index}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-slate-800 border border-slate-600 rounded-xl p-3 shadow-2xl text-sm min-w-48">
              <div className="text-slate-200 font-semibold mb-1">
                {tooltip.student.firstName} {tooltip.student.lastName}
              </div>
              <div className="space-y-0.5 text-xs text-slate-400">
                <div>
                  <span className="text-slate-500">ID:</span>{' '}
                  <span className="font-mono text-slate-300">{tooltip.student.id}</span>
                </div>
                <div>
                  <span className="text-slate-500">Slot:</span>{' '}
                  <span className="font-mono text-slate-300">{tooltip.index}</span>
                </div>
                <div>
                  <span className="text-slate-500">Hash:</span>{' '}
                  <span className="font-mono text-slate-300">{tooltip.hash}</span>
                </div>
                <div>
                  <span className="text-slate-500">Level:</span>{' '}
                  <span className="font-mono text-slate-300">{tooltip.student.universityLevel}</span>
                </div>
                <div>
                  <span className="text-slate-500">DOB:</span>{' '}
                  <span className="text-slate-300">{tooltip.student.dateOfBirth}</span>
                </div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-800" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HashTableGrid
