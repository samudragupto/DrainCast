export const fmtInt = (n: number): string => Math.round(n).toLocaleString('en-IN')

export const fmtM3 = (n: number): string => `${fmtInt(n)} m³/hr`

export const fmtKm = (m: number): string => `${(m / 1000).toFixed(1)} km`

export const fmtCm = (cm: number): string => `${cm.toFixed(1)} cm`

export const fmtMin = (min: number): string => `${Math.round(min)} min`

export const fmtCompact = (n: number): string => {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${Math.round(n)}`
}
