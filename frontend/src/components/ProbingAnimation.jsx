import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Hash, ArrowRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

function ProbingAnimation({ trace, speed = 500 }) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showHash, setShowHash] = useState(false)
  const timerRef = useRef(null)

  const steps = trace?.probingSteps || []

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setCurrentStep(-1)
    setShowHash(false)
    setIsPlaying(false)
  }, [trace])

  const play = () => {
    if (!trace) return

    if (currentStep >= steps.length - 1) {
      setCurrentStep(-1)
      setShowHash(false)
    }

    setIsPlaying(true)
    setShowHash(true)

    const startStep = currentStep < 0 ? 0 : currentStep + 1

    let step = startStep
    const animate = () => {
      if (step < steps.length) {
        setCurrentStep(step)
        step++
        timerRef.current = setTimeout(animate, speed)
      } else {
        setIsPlaying(false)
      }
    }

    timerRef.current = setTimeout(animate, speed)
  }

  const pause = () => {
    setIsPlaying(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const reset = () => {
    setIsPlaying(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    setCurrentStep(-1)
    setShowHash(false)
  }

  const getStepIcon = (step) => {
    if (step.isTarget) return <CheckCircle2 className="w-5 h-5 text-emerald-400" />
    if (step.slotStatus === 'OCCUPIED') return <XCircle className="w-5 h-5 text-rose-400" />
    if (step.slotStatus === 'EMPTY') return <CheckCircle2 className="w-5 h-5 text-emerald-400" />
    if (step.slotStatus === 'DELETED') return <AlertCircle className="w-5 h-5 text-amber-400" />
    return <ArrowRight className="w-5 h-5 text-slate-400" />
  }

  const getStepColor = (step) => {
    if (step.isTarget) return 'border-emerald-500/50 bg-emerald-500/5'
    if (step.slotStatus === 'OCCUPIED') return 'border-rose-500/50 bg-rose-500/5'
    if (step.slotStatus === 'EMPTY') return 'border-emerald-500/50 bg-emerald-500/5'
    if (step.slotStatus === 'DELETED') return 'border-amber-500/50 bg-amber-500/5'
    return 'border-slate-700 bg-slate-800/50'
  }

  const getStepLabel = (step) => {
    if (step.isTarget && trace.operationType === 'SEARCH_BY_ID') return 'Found student!'
    if (step.isTarget) return 'Slot available! Inserting here.'
    if (step.slotStatus === 'OCCUPIED') return `Collision! Slot ${step.slot} is occupied (ID: ${step.studentIdAtSlot})`
    if (step.slotStatus === 'EMPTY') return `Slot ${step.slot} is empty. Inserting here.`
    if (step.slotStatus === 'DELETED') return `Slot ${step.slot} is deleted (tombstone). Continuing...`
    return `Checking slot ${step.slot}...`
  }

  if (!trace) {
    return (
      <div className="glass-card p-8 text-center">
        <Hash className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Enter a student ID and click Search or Insert to see the probing animation</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {!isPlaying ? (
          <button onClick={play} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
            <Play className="w-4 h-4" />
            {currentStep >= 0 ? 'Resume' : 'Play'}
          </button>
        ) : (
          <button onClick={pause} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}
        <button onClick={reset} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <div className="text-sm text-slate-400 ml-auto">
          Step {Math.max(0, currentStep + 1)} of {steps.length}
        </div>
      </div>

      <AnimatePresence>
        {showHash && trace.hashComputation && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="glass-card p-4"
          >
            <div className="flex items-center gap-2 text-sm mb-2">
              <Hash className="w-4 h-4 text-cyan-400" />
              <span className="font-medium text-cyan-400">Hash Computation</span>
            </div>
            <div className="font-mono text-lg text-slate-200 bg-slate-900/50 rounded-lg p-3 text-center">
              <span className="text-cyan-400">{trace.hashComputation.inputValue}</span>
              <span className="text-slate-500"> % </span>
              <span className="text-slate-300">{trace.hashComputation.capacity}</span>
              <span className="text-slate-500"> = </span>
              <span className="text-emerald-400 font-bold">{trace.hashComputation.hashResult}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center font-mono">
              {trace.hashComputation.formula}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <AnimatePresence>
          {steps.slice(0, currentStep + 1).map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={clsx(
                'border rounded-xl p-4 transition-all duration-300',
                i === currentStep ? getStepColor(step) : 'border-slate-800 bg-slate-900/30 opacity-60'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800/80 text-xs font-mono font-bold text-slate-300">
                  {step.attempt}
                </div>
                {getStepIcon(step)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono font-semibold text-slate-200">
                      Slot [{step.slot}]
                    </span>
                    {step.direction && step.attempt > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                        {step.direction === '+' ? '+' : '-'}({step.attempt}&sup2;)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {getStepLabel(step)}
                  </p>
                </div>
                <span
                  className={clsx(
                    'text-xs font-semibold px-2.5 py-1 rounded-lg',
                    step.slotStatus === 'EMPTY' ? 'bg-slate-700/50 text-slate-400' :
                    step.slotStatus === 'OCCUPIED' ? 'bg-emerald-500/10 text-emerald-400' :
                    'bg-rose-500/10 text-rose-400'
                  )}
                >
                  {step.slotStatus}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {currentStep === steps.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 border-emerald-500/30"
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-400">Final Slot: </span>
                <span className="font-mono font-bold text-emerald-400">{trace.finalSlot}</span>
              </div>
              <div>
                <span className="text-slate-400">Total Probes: </span>
                <span className="font-mono font-bold text-cyan-400">{trace.totalProbes}</span>
              </div>
              <div>
                <span className="text-slate-400">Collisions: </span>
                <span className="font-mono font-bold text-rose-400">{trace.collisions}</span>
              </div>
            </div>
            {trace.indexUsed && (
              <span className="text-xs px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Index: {trace.indexUsed}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ProbingAnimation
