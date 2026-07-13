import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
)

// Global defaults — applied to ALL charts automatically
ChartJS.defaults.color = '#94a3b8'
ChartJS.defaults.font.family = 'Inter, sans-serif'
ChartJS.defaults.font.size = 11
ChartJS.defaults.borderColor = 'rgba(30,40,64,0.6)'
ChartJS.defaults.plugins.legend.labels.usePointStyle = true
ChartJS.defaults.plugins.legend.labels.pointStyleWidth = 8
ChartJS.defaults.plugins.legend.labels.boxHeight = 8
ChartJS.defaults.plugins.legend.labels.padding = 16

// Reusable chart config objects (export these — use in every chart):
export const TOOLTIP_CONFIG = {
  backgroundColor: '#161b27',
  borderColor: '#1e2840',
  borderWidth: 1,
  titleColor: '#f1f5f9',
  titleFont: { size: 13, weight: '500' },
  bodyColor: '#94a3b8',
  bodyFont: { size: 12 },
  padding: 12,
  cornerRadius: 8,
  displayColors: true,
  boxWidth: 8, boxHeight: 8,
}

export const SCALE_CONFIG = {
  x: {
    grid: { color: 'rgba(30,40,64,0.5)', drawBorder: false },
    ticks: { color: '#475569', font: { size: 11 } },
    border: { display: false }
  },
  y: {
    grid: { color: 'rgba(30,40,64,0.5)', drawBorder: false },
    ticks: { color: '#475569', font: { size: 11 } },
    border: { display: false },
    beginAtZero: true
  }
}
