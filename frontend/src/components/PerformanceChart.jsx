import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-2xl">
      <p className="text-sm font-semibold text-slate-200 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="font-mono font-semibold text-slate-200">{entry.value} steps</span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="mt-2 pt-2 border-t border-slate-700 text-xs">
          <span className="text-slate-400">Speedup: </span>
          <span className="font-mono font-bold text-emerald-400">
            {(payload[1].value / Math.max(1, payload[0].value)).toFixed(1)}x faster
          </span>
        </div>
      )}
    </div>
  )
}

function PerformanceChart({ data }) {
  if (!data || !data.operations || data.operations.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-slate-400">No performance data available. Run a benchmark to see results.</p>
      </div>
    )
  }

  const chartData = data.operations.map((op) => ({
    name: `ID ${op.sampleId}`,
    'Hash Table': op.indexed.probes,
    'Linear Scan': op.linear.steps,
    speedup: op.speedup,
  }))

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-slate-200 mb-1">Indexed Lookup vs Linear Scan</h3>
      <p className="text-sm text-slate-400 mb-6">
        Steps required to find each student record
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={{ stroke: '#334155' }}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={{ stroke: '#334155' }}
            label={{
              value: 'Steps',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#64748b', fontSize: 12 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 16 }}
            formatter={(value) => (
              <span className="text-sm text-slate-300">{value}</span>
            )}
          />
          <Bar dataKey="Hash Table" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill="#10b981" fillOpacity={0.8} />
            ))}
          </Bar>
          <Bar dataKey="Linear Scan" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill="#f43f5e" fillOpacity={0.6} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PerformanceChart
