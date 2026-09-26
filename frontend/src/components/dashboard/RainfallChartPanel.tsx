import { useMemo } from 'react'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { BarChart3 } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { networkLoadAt, RAINFALL_MAX, RAINFALL_MIN } from '../../utils/floodPredictionEngine'
import type { TimeHorizon } from '../../types'
import { FloatingPanel } from '../ui/FloatingPanel'
import { fmtCompact } from '../../utils/format'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const STEP = 5

export function RainfallChartPanel({
  rainfall,
  horizon,
  delay = 0,
}: {
  rainfall: number
  horizon: TimeHorizon
  delay?: number
}) {
  const { theme } = useTheme()

  const data = useMemo(() => {
    const intensities: number[] = []
    for (let i = RAINFALL_MIN; i <= RAINFALL_MAX; i += STEP) intensities.push(i)
    const runoff = intensities.map((i) => networkLoadAt(i).runoffM3Hr)
    const capacity = networkLoadAt(RAINFALL_MIN).capacityM3Hr
    return { intensities, runoff, capacity }
  }, [])

  // The horizon multiplier scales the effective intensity for the live marker.
  const multipliers: Record<TimeHorizon, number> = { now: 1, '1h': 1.15, '2h': 1.3, '3h': 1.45 }
  const markerRunoff = networkLoadAt(rainfall * multipliers[horizon]).runoffM3Hr

  const isDark = theme === 'dark'
  const gridColor = isDark ? 'rgba(38, 46, 77, 0.6)' : 'rgba(229, 231, 235, 0.9)'
  const textColor = isDark ? '#7C86B3' : '#475569'

  const chartData = {
    labels: data.intensities,
    datasets: [
      {
        type: 'line' as const,
        label: 'Surface Runoff Load',
        data: data.runoff,
        borderColor: '#22D3EE',
        backgroundColor: isDark ? 'rgba(34, 211, 238, 0.08)' : 'rgba(8, 145, 178, 0.08)',
        fill: true,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: (ctx: { dataIndex: number }) =>
          data.intensities[ctx.dataIndex] === rainfall ? 4.5 : 0,
        pointBackgroundColor: '#22D3EE',
        pointBorderColor: isDark ? '#101729' : '#FFFFFF',
        pointBorderWidth: 2,
      },
      {
        type: 'line' as const,
        label: 'Drainage Network Capacity',
        data: data.intensities.map(() => data.capacity),
        borderColor: isDark ? '#F97316' : '#EA580C',
        borderWidth: 1.8,
        borderDash: [6, 5],
        pointRadius: 0,
        tension: 0,
      },
    ],
  }

  const runoffAtMarker = markerRunoff

  return (
    <FloatingPanel
      title="Rainfall vs Drainage Load"
      icon={<BarChart3 className="h-4 w-4" />}
      delay={delay}
      collapsible={false}
      bodyClassName="px-3 py-2.5"
    >
      <div className="h-[132px]">
        <Chart
          type="line"
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 300, easing: 'easeOutCubic' },
            interaction: { intersect: false, mode: 'index' },
            plugins: {
              tooltip: {
                backgroundColor: isDark ? '#101729' : '#FFFFFF',
                borderColor: isDark ? '#262E4D' : '#E5E7EB',
                borderWidth: 1,
                titleColor: isDark ? '#F8FAFC' : '#0F1026',
                bodyColor: isDark ? '#B6BEDC' : '#334155',
                titleFont: { family: 'JetBrains Mono Variable, monospace', size: 10 },
                bodyFont: { family: 'JetBrains Mono Variable, monospace', size: 10 },
                padding: 8,
                cornerRadius: 8,
                displayColors: true,
                boxWidth: 8,
                boxHeight: 8,
                callbacks: {
                  title: (items) => `${items[0].label} mm/hr`,
                  label: (item) => ` ${item.dataset.label}: ${fmtInt(Number(item.parsed.y))} m³/hr`,
                },
              },
              legend: { display: false },
            },
            scales: {
              x: {
                grid: { display: false },
                border: { color: gridColor },
                ticks: {
                  color: textColor,
                  font: { family: 'JetBrains Mono Variable, monospace', size: 8.5 },
                  maxTicksLimit: 6,
                  callback: (value) => `${value}`,
                },
                title: {
                  display: true,
                  text: 'mm/hr',
                  color: textColor,
                  font: { family: 'JetBrains Mono Variable, monospace', size: 8.5 },
                },
              },
              y: {
                grid: { color: gridColor },
                border: { display: false },
                ticks: {
                  color: textColor,
                  font: { family: 'JetBrains Mono Variable, monospace', size: 8.5 },
                  maxTicksLimit: 5,
                  callback: (value) => fmtCompact(Number(value)),
                },
              },
            },
          }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between border-t border-line/60 pt-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[9.5px] text-ink-3">
            <span className="h-[2px] w-3.5 rounded-full bg-accent" /> Runoff
          </span>
          <span className="flex items-center gap-1.5 text-[9.5px] text-ink-3">
            <span className="h-[2px] w-3.5 rounded-full bg-[#F97316]" style={{ backgroundImage: 'linear-gradient(90deg,#F97316 55%,transparent 45%)' }} />
            Capacity
          </span>
        </div>
        <span className="tabular font-mono text-[9.5px] text-ink-3">
          live: <span className="text-ink-2">{fmtInt(runoffAtMarker)}</span> m³/hr
        </span>
      </div>
    </FloatingPanel>
  )
}

const fmtInt = (n: number) => Math.round(n).toLocaleString('en-IN')
