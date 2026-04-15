import { motion } from 'framer-motion'
import {
  Layers,
  GitBranch,
  Search,
  Trash2,
  PenLine,
  ArrowRightLeft,
  Cpu,
  Database,
  Globe,
  Palette,
  BarChart3,
  Zap,
  BookOpen,
  Code2,
  Box,
  Hash,
  ArrowRight,
  ChevronRight,
  Server,
  Monitor,
  HardDrive,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */

function Section({ id, children, className = '' }) {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      id={id}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/* ------------------------------------------------------------------ */
/*  Architecture diagram box                                           */
/* ------------------------------------------------------------------ */

function ArchBox({ icon: Icon, title, subtitle, color }) {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/30 text-indigo-400',
    violet: 'from-violet-500/20 to-violet-600/5 border-violet-500/30 text-violet-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
  }
  const c = colorMap[color] || colorMap.indigo

  return (
    <div
      className={`flex-1 min-w-[200px] bg-gradient-to-b ${c} border rounded-2xl p-5 backdrop-blur-sm text-center`}
    >
      <div className="flex justify-center mb-3">
        <Icon className={`w-7 h-7 ${c.split(' ').pop()}`} />
      </div>
      <p className="text-sm font-bold text-slate-100 mb-1">{title}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Animated connecting arrow                                          */
/* ------------------------------------------------------------------ */

function ConnectorArrow() {
  return (
    <div className="flex items-center justify-center w-12 flex-shrink-0 hidden md:flex">
      <motion.div
        variants={fadeIn}
        className="flex flex-col items-center gap-0.5"
      >
        <ArrowRight className="w-5 h-5 text-slate-600" />
        <ArrowRight className="w-5 h-5 text-slate-700 -mt-2.5 ml-0.5 opacity-50" />
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Hash slot visual                                                   */
/* ------------------------------------------------------------------ */

function SlotBox({ label, status = 'empty', small = false }) {
  const statusClasses = {
    occupied: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
    empty: 'bg-slate-800/40 border-slate-700/40 text-slate-600',
    deleted: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    probe: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    found: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  }

  return (
    <div
      className={`
        ${small ? 'w-8 h-8 text-[10px]' : 'w-11 h-11 text-xs'}
        border rounded-lg flex items-center justify-center font-mono font-medium
        ${statusClasses[status]}
        transition-all duration-200
      `}
    >
      {label}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Operation card                                                     */
/* ------------------------------------------------------------------ */

function OperationCard({ icon: Icon, title, steps, color }) {
  const iconColors = {
    indigo: 'text-indigo-400 bg-indigo-500/10',
    violet: 'text-violet-400 bg-violet-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    rose: 'text-rose-400 bg-rose-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    cyan: 'text-cyan-400 bg-cyan-500/10',
  }
  const c = iconColors[color] || iconColors.indigo

  return (
    <motion.div variants={itemVariants} className="glass-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl ${c}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h4 className="text-sm font-bold text-slate-100">{title}</h4>
      </div>
      <ol className="space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 mt-0.5">
              {i + 1}
            </span>
            <span className="text-sm text-slate-400 leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tech stack card                                                    */
/* ------------------------------------------------------------------ */

function TechCard({ name, description, color }) {
  const colorMap = {
    indigo: 'border-indigo-500/20 bg-indigo-500/5',
    violet: 'border-violet-500/20 bg-violet-500/5',
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
    rose: 'border-rose-500/20 bg-rose-500/5',
    cyan: 'border-cyan-500/20 bg-cyan-500/5',
    purple: 'border-purple-500/20 bg-purple-500/5',
  }
  const c = colorMap[color] || colorMap.indigo

  return (
    <motion.div
      variants={itemVariants}
      className={`border rounded-xl p-4 ${c} hover:scale-[1.02] transition-transform duration-200`}
    >
      <p className="text-sm font-semibold text-slate-100 mb-1">{name}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

function TechnicalDesign() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-12"
    >
      {/* ============================================================ */}
      {/* Section 1: Hero / Intro                                      */}
      {/* ============================================================ */}
      <Section id="intro">
        <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-2">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-medium mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            Architecture Documentation
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            <span className="gradient-text">Technical Design</span>
            <br />
            <span className="text-slate-300 text-2xl sm:text-3xl lg:text-4xl font-bold">
              & Architecture
            </span>
          </h1>
          <p className="text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            This project demonstrates a multi-index hash table storage engine with quadratic probing,
            implemented as a full-stack visualization platform. Each design decision is explained below.
          </p>
        </motion.div>
      </Section>

      {/* ============================================================ */}
      {/* Section 2: System Architecture Diagram                       */}
      {/* ============================================================ */}
      <Section id="architecture">
        <motion.div variants={itemVariants}>
          <h2 className="section-header mb-1">System Architecture</h2>
          <p className="section-subheader mb-6">Three-tier design with clear separation of concerns</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="glass-card p-6 sm:p-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-stretch gap-4">
            <ArchBox
              icon={Monitor}
              title="React Frontend"
              subtitle="Vite + Tailwind CSS + Framer Motion"
              color="indigo"
            />
            <ConnectorArrow />
            <ArchBox
              icon={Server}
              title="Spring Boot API"
              subtitle="REST + JSON / Port 8080"
              color="violet"
            />
            <ConnectorArrow />
            <ArchBox
              icon={HardDrive}
              title="Indexing Engine"
              subtitle="Student[4][151] + 3 Index Maps"
              color="purple"
            />
          </div>

          {/* Data flow description */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="px-3 py-2 rounded-lg bg-slate-900/40 border border-slate-800/40">
              <p className="text-xs text-slate-500">Renders UI, sends HTTP requests</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-slate-900/40 border border-slate-800/40">
              <p className="text-xs text-slate-500">Validates, routes, returns JSON + trace</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-slate-900/40 border border-slate-800/40">
              <p className="text-xs text-slate-500">Hashes, probes, stores, indexes</p>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ============================================================ */}
      {/* Section 3: Data Structure Deep Dive                          */}
      {/* ============================================================ */}
      <Section id="data-structures" className="space-y-8">
        <motion.div variants={itemVariants}>
          <h2 className="section-header mb-1">Data Structure Deep Dive</h2>
          <p className="section-subheader mb-6">Core storage and indexing mechanisms</p>
        </motion.div>

        {/* 3a: Hash Table Layout */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Hash Table Layout
            </h3>
            <span className="badge-indigo ml-auto">2D Array</span>
          </div>
          <p className="text-sm text-slate-400 mb-5 leading-relaxed">
            The physical storage is a two-dimensional array: 4 levels (FR, SO, JR, SR) each with 151 slots.
            The capacity of 151 is a prime number, which is critical for uniform distribution when using
            modular hashing and quadratic probing.
          </p>

          {/* Visual representation */}
          <div className="code-block space-y-3">
            {['FR', 'SO', 'JR', 'SR'].map((level, li) => (
              <div key={level} className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 w-16">
                  levels[{li}]
                </span>
                <span className={`text-xs font-bold w-6 ${
                  li === 0 ? 'text-indigo-400' : li === 1 ? 'text-violet-400' : li === 2 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {level}:
                </span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((s) => (
                    <SlotBox key={s} label={s} status={s === 1 && li === 0 ? 'occupied' : 'empty'} small />
                  ))}
                  <span className="text-slate-600 text-xs px-1">...</span>
                  <SlotBox label="150" status="empty" small />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2 px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
            <Zap className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-400">
              <span className="text-indigo-400 font-medium">Why prime?</span>{' '}
              A prime capacity ensures that quadratic probing sequences visit more unique slots
              before repeating, reducing cluster formation and guaranteeing all slots are reachable
              when the table is less than half full.
            </p>
          </div>
        </motion.div>

        {/* 3b: Multi-Index Architecture */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-4 h-4 text-violet-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Multi-Index Architecture
            </h3>
            <span className="badge-violet ml-auto">3 Maps</span>
          </div>
          <p className="text-sm text-slate-400 mb-5 leading-relaxed">
            Three concurrent index maps point into the same physical storage, enabling O(1) lookups
            on three different fields without duplicating data.
          </p>

          <div className="code-block space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-indigo-400 font-medium min-w-[110px]">IdMap:</span>
              <span className="text-slate-400">{'{ 45231'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-400">{'43 }'}</span>
              <span className="text-slate-600 ml-2">{'// O(1) by ID'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-violet-400 font-medium min-w-[110px]">firstNameMap:</span>
              <span className="text-slate-400">{'{ "Mohammed"'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-400">{'[43, 10012, 20088] }'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 font-medium min-w-[110px]">lastNameMap:</span>
              <span className="text-slate-400">{'{ "Al-Ghamdi"'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
              <span className="text-slate-400">{'[43, 155] }'}</span>
            </div>
          </div>

          {/* Identifier encoding */}
          <div className="mt-5 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60">
            <p className="text-sm font-semibold text-slate-200 mb-3">Identifier Encoding</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-1 rounded">
                  identifierIndex = slotIndex + levelIndex * 10000
                </span>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <p>
                  <span className="text-slate-400 font-medium">Encoding:</span>{' '}
                  Student at level JR (index 2), slot 88{' '}
                  <ChevronRight className="w-3 h-3 inline text-slate-600" />{' '}
                  <span className="text-indigo-400 font-mono">88 + 2 * 10000 = 20088</span>
                </p>
                <p>
                  <span className="text-slate-400 font-medium">Decoding:</span>{' '}
                  <span className="text-indigo-400 font-mono">20088</span>{' '}
                  <ChevronRight className="w-3 h-3 inline text-slate-600" />{' '}
                  level = 20088 / 10000 = <span className="text-violet-400">2 (JR)</span>,
                  slot = 20088 % 10000 = <span className="text-emerald-400">88</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3c: Quadratic Probing */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Quadratic Probing
            </h3>
            <span className="badge-amber ml-auto">Collision Resolution</span>
          </div>
          <p className="text-sm text-slate-400 mb-5 leading-relaxed">
            When a collision occurs during insertion, the engine uses alternating positive and negative
            quadratic offsets to find the next available slot. This significantly reduces primary clustering
            compared to linear probing.
          </p>

          <div className="code-block mb-5">
            <div className="text-slate-500 text-xs mb-2">{'// Probing formula'}</div>
            <div className="text-amber-400 font-medium">
              Try: (h + i<sup>2</sup>) % 151 &nbsp;and&nbsp; (h - i<sup>2</sup>) % 151
            </div>
            <div className="text-slate-500 text-xs mt-1">for i = 0, 1, 2, 3, ...</div>
            <div className="text-slate-500 text-xs">where h = id % 151</div>
          </div>

          {/* Visual probe example */}
          <p className="text-xs font-semibold text-slate-300 mb-3">
            Example: Insert ID 45231 (h = 45231 % 151 = 97)
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { slot: 95, status: 'occupied', label: '95', note: null },
              { slot: 96, status: 'occupied', label: '96', note: null },
              { slot: 97, status: 'probe', label: '97', note: 'i=0 collision' },
              { slot: 98, status: 'probe', label: '98', note: 'h+1 collision' },
              { slot: 99, status: 'found', label: '99', note: 'h+4 placed!' },
              { slot: 100, status: 'empty', label: '100', note: null },
            ].map((s) => (
              <div key={s.slot} className="flex flex-col items-center gap-1">
                <SlotBox label={s.label} status={s.status} />
                {s.note && (
                  <span className={`text-[9px] whitespace-nowrap ${
                    s.status === 'found' ? 'text-emerald-400' : 'text-amber-400/70'
                  }`}>
                    {s.note}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-800/40 border border-slate-700/40" /> Empty
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500/15 border border-indigo-500/30" /> Occupied
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/15 border border-amber-500/30" /> Probed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/15 border border-emerald-500/30" /> Placed
            </span>
          </div>
        </motion.div>
      </Section>

      {/* ============================================================ */}
      {/* Section 4: Operations Explained                              */}
      {/* ============================================================ */}
      <Section id="operations" className="space-y-6">
        <motion.div variants={itemVariants}>
          <h2 className="section-header mb-1">Operations Explained</h2>
          <p className="section-subheader mb-6">Algorithmic steps for each core operation</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <OperationCard
            icon={Database}
            title="Insert"
            color="indigo"
            steps={[
              'Compute hash: h = id % 151',
              'Determine level index from university level',
              'Probe with quadratic sequence until empty or tombstone slot found',
              'Place student record in the slot',
              'Update all 3 index maps (IdMap, firstNameMap, lastNameMap)',
            ]}
          />
          <OperationCard
            icon={Search}
            title="Search by ID"
            color="violet"
            steps={[
              'Look up id in IdMap to get identifierIndex',
              'Decode: level = identifierIndex / 10000',
              'Decode: slot = identifierIndex % 10000',
              'Direct array access: levels[level][slot]',
            ]}
          />
          <OperationCard
            icon={Search}
            title="Search by Name"
            color="cyan"
            steps={[
              'Look up name in firstNameMap or lastNameMap',
              'Get list of identifierIndexes',
              'Decode each identifierIndex to (level, slot)',
              'Collect all matching student records',
            ]}
          />
          <OperationCard
            icon={Trash2}
            title="Delete"
            color="rose"
            steps={[
              'Find student via IdMap lookup',
              'Mark slot as "D" (tombstone) to preserve probing chains',
              'Remove entry from IdMap',
              'Remove identifierIndex from firstNameMap list',
              'Remove identifierIndex from lastNameMap list',
            ]}
          />
          <OperationCard
            icon={PenLine}
            title="Edit (Name)"
            color="amber"
            steps={[
              'Look up student by ID via IdMap',
              'Update the name field in-place at the slot',
              'Remove old name entry from the relevant name index map',
              'Add new name entry to the relevant name index map',
            ]}
          />
          <OperationCard
            icon={ArrowRightLeft}
            title="Edit (Level)"
            color="emerald"
            steps={[
              'Delete student from old level (full delete with tombstone)',
              'Re-insert student into new level array',
              'New physical location computed via hash + probe in new level',
              'All 3 index maps updated with new identifierIndex',
            ]}
          />
        </div>
      </Section>

      {/* ============================================================ */}
      {/* Section 5: Complexity Analysis                               */}
      {/* ============================================================ */}
      <Section id="complexity">
        <motion.div variants={itemVariants}>
          <h2 className="section-header mb-1">Complexity Analysis</h2>
          <p className="section-subheader mb-6">Time and space complexity for each operation</p>
        </motion.div>

        <motion.div variants={itemVariants} className="overflow-x-auto rounded-2xl border border-slate-700/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/80">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Operation
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Average Case
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Worst Case
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Space
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { op: 'Insert', avg: 'O(1)', worst: 'O(n)', space: 'O(1)', color: 'text-indigo-400' },
                { op: 'Search by ID', avg: 'O(1)', worst: 'O(1)', space: '-', color: 'text-violet-400' },
                { op: 'Search by Name', avg: 'O(k)', worst: 'O(k)', space: '-', color: 'text-cyan-400' },
                { op: 'Delete', avg: 'O(1)', worst: 'O(1)', space: '-', color: 'text-rose-400' },
                { op: 'List by Level', avg: 'O(n)', worst: 'O(n)', space: 'O(n)', color: 'text-amber-400' },
              ].map((row, i) => (
                <tr
                  key={row.op}
                  className={i % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/10'}
                >
                  <td className={`px-5 py-3 font-medium ${row.color}`}>{row.op}</td>
                  <td className="px-5 py-3 font-mono text-slate-300">{row.avg}</td>
                  <td className="px-5 py-3 font-mono text-slate-300">{row.worst}</td>
                  <td className="px-5 py-3 font-mono text-slate-500">{row.space}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-3 text-xs text-slate-600 px-1">
          Where <span className="text-slate-400 font-mono">k</span> = number of students with that name,{' '}
          <span className="text-slate-400 font-mono">n</span> = table capacity (151)
        </motion.div>
      </Section>

      {/* ============================================================ */}
      {/* Section 6: Why This Matters                                  */}
      {/* ============================================================ */}
      <Section id="rationale">
        <motion.div variants={itemVariants}>
          <h2 className="section-header mb-1">Why This Matters</h2>
          <p className="section-subheader mb-6">Design rationale and engineering trade-offs</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: Layers,
                title: 'Multi-Index Lookups',
                desc: 'Three index maps enable O(1) lookups on ID, first name, and last name without duplicating student records or requiring a database.',
                color: 'text-indigo-400 bg-indigo-500/10',
              },
              {
                icon: GitBranch,
                title: 'Reduced Clustering',
                desc: 'Quadratic probing with alternating +/- offsets distributes collisions more uniformly than linear probing, reducing primary clustering.',
                color: 'text-violet-400 bg-violet-500/10',
              },
              {
                icon: Hash,
                title: 'Prime Capacity',
                desc: 'A capacity of 151 (prime) ensures that modular hashing and quadratic probing produce well-distributed, non-repeating probe sequences.',
                color: 'text-amber-400 bg-amber-500/10',
              },
              {
                icon: Trash2,
                title: 'Tombstone Deletion',
                desc: 'Marking deleted slots with "D" instead of clearing them preserves probing chains, ensuring searches that passed through a deleted slot still find their targets.',
                color: 'text-rose-400 bg-rose-500/10',
              },
              {
                icon: Code2,
                title: 'Identifier Encoding',
                desc: 'Packing level + slot into a single integer (slot + level * 10000) keeps index maps lightweight while allowing instant decoding to physical coordinates.',
                color: 'text-emerald-400 bg-emerald-500/10',
              },
              {
                icon: Zap,
                title: 'No Database Required',
                desc: 'Pure in-memory data structure with three access paths demonstrates that efficient multi-field search is achievable without SQL or external engines.',
                color: 'text-cyan-400 bg-cyan-500/10',
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/30 transition-colors">
                <div className={`p-2 rounded-lg ${item.color} flex-shrink-0`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200 mb-1">{item.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ============================================================ */}
      {/* Section 7: Tech Stack                                        */}
      {/* ============================================================ */}
      <Section id="tech-stack">
        <motion.div variants={itemVariants}>
          <h2 className="section-header mb-1">Tech Stack</h2>
          <p className="section-subheader mb-6">Technologies powering this platform</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <TechCard name="Java 17" description="Backend language with records & sealed classes" color="rose" />
          <TechCard name="Spring Boot 3.2" description="REST API framework with auto-configuration" color="emerald" />
          <TechCard name="React 18" description="Component-based UI with hooks & concurrent features" color="cyan" />
          <TechCard name="Vite" description="Lightning-fast dev server & build tool" color="purple" />
          <TechCard name="Tailwind CSS" description="Utility-first CSS for rapid dark-themed styling" color="indigo" />
          <TechCard name="Framer Motion" description="Production-ready animations & transitions" color="violet" />
          <TechCard name="Recharts" description="Composable charting library for React" color="amber" />
        </div>
      </Section>

      {/* ============================================================ */}
      {/* Section 8: Credits                                           */}
      {/* ============================================================ */}
      <Section id="credits">
        <motion.div
          variants={itemVariants}
          className="glass-card p-6 sm:p-8 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-900/30">
            <Box className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">IndexViz</h2>
          <p className="text-sm text-slate-400 mb-4">
            Built as an ICS202 Data Structures course project
          </p>
          <div className="divider max-w-xs mx-auto" />
          <p className="text-xs text-slate-600 mt-4">
            Multi-Indexed Hash Table with Quadratic Probing -- Full-Stack Visualization Platform
          </p>
        </motion.div>
      </Section>
    </motion.div>
  )
}

export default TechnicalDesign
