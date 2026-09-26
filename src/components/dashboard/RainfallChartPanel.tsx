import { BarChart3 } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
  CategoryScale,
  Chart,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import { FloatingPanel } from '../ui/FloatingPanel'
import { networkBreakEvenMmHr } from '../../utils/floodPredictionEngine'
import type { HorizonSummary, TimeHorizon } from '../../types'

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip)

const MONO = "'IBM Plex Mono', monospace"
const BREAK_EVEN = networkBreakEvenMmHr()

interface RainfallChartPanelProps {
  series: HorizonSummary[]
  horizon: TimeHorizon
  delay?: number
}

export function RainfallChartPanel({ series, horizon, delay = 0 }: RainfallChartPanelProps) {
  const activeIndex = series.findIndex((s) => s.horizon === horizon)

  const data = {
    labels: series.map((s) => s.label),
    datasets: [
      {
        label: 'Surface runoff load',
        data: series.map((s) => Math.round(s.runoffM3Hr)),
        borderColor: '#22D3EE',
        backgroundColor: 'rgba(34, 211, 238, 0.12)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: series.map((_, i) => (i === activeIndex ? 4 : 0)),
        pointHoverRadius: 5,
        pointBackgroundColor: '#22D3EE',
      },
      {
        label: 'Rated drain capacity',
        data: series.map((s) => Math.round(s.capacityM3Hr)),
        borderColor: '#22C55E',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0,
        fill: false,
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 550, easing: 'easeOutQuart' },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        labels: {
          color: '#9AA3C0',
          boxWidth: 8,
          boxHeight: 8,
          font: { family: MONO, size: 9.5 },
        },
      },
      tooltip: {
        backgroundColor: '#151B2E',
        borderColor: '#242B45',
        borderWidth: 1,
        titleColor: '#F8FAFC',
        bodyColor: '#9AA3C0',
        titleFont: { family: MONO, size: 11 },
        bodyFont: { family: MONO, size: 10.5 },
        padding: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.parsed.y).toLocaleString('en-IN')} m³/hr`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(36, 43, 69, 0.5)' },
        ticks: { color: '#6B7399', font: { family: MONO, size: 9.5 } },
      },
      y: {
        grid: { color: 'rgba(36, 43, 69, 0.5)' },
        border: { display: false },
        ticks: {
          color: '#6B7399',
          font: { family: MONO, size: 9.5 },
          maxTicksLimit: 5,
          callback: (v) => `${(Number(v) / 1000).toFixed(0)}k`,
        },
      },
    },
  }

  return (
    <FloatingPanel
      title="Rainfall vs Drainage Load"
      icon={<BarChart3 className="h-4 w-4" />}
      delay={delay}
      footer={
        <>
          Network aggregate · sustained demand crosses rated capacity at ≈{' '}
          {BREAK_EVEN.toFixed(0)} mm/hr
        </>
      }
    >
      <div className="h-[142px]">
        <Line data={data} options={options} />
      </div>
    </FloatingPanel>
  )
}
