export function getWeekdayDates(year, month, weekday) {
  const dates = []
  const d = new Date(year, month - 1, 1)
  while (d.getMonth() === month - 1) {
    if (d.getDay() === weekday) {
      dates.push(formatDate(d))
    }
    d.setDate(d.getDate() + 1)
  }
  return dates
}

export function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const STANDARD_SESSIONS = 4

export function getAdjustedPrice(cuota, yearMonth, holidays) {
  if (!cuota) return 0
  const [year, month] = yearMonth.split('-').map(Number)
  const allDays = getWeekdayDates(year, month, cuota.weekday)
  if (allDays.length === 0) return 0
  const holidaySet = new Set(holidays)
  const activeDays = allDays.filter(d => !holidaySet.has(d)).length
  const pricePerSession = cuota.price / STANDARD_SESSIONS
  return Math.round(pricePerSession * activeDays * 100) / 100
}

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function weekdayName(index) {
  return WEEKDAYS[index]
}
