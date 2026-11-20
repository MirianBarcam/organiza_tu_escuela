<script setup>
import { computed } from 'vue'
import { getWeekdayDates, weekdayName } from '../composables/usePricing.js'

const props = defineProps({
  month: String,
  holidays: Array,
  cuotas: Array
})
const emit = defineEmits(['toggle'])

const WEEKDAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const relevantDays = computed(() => {
  const [year, month] = props.month.split('-').map(Number)
  const weekdays = [...new Set(props.cuotas.map(c => c.weekday))]
  weekdays.sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))

  return weekdays.map(wd => ({
    weekday: wd,
    label: weekdayName(wd),
    dates: getWeekdayDates(year, month, wd)
  }))
})

function dayNumber(dateStr) {
  return parseInt(dateStr.split('-')[2])
}
</script>

<template>
  <div class="holiday-manager">
    <h2 class="section-title">Festivos</h2>
    <p class="hint">Marca los días que no hay clase. El importe se ajusta automáticamente.</p>

    <div v-if="relevantDays.length === 0" class="empty">
      Añade cuotas primero para ver los días de clase.
    </div>

    <div v-for="group in relevantDays" :key="group.weekday" class="day-group">
      <span class="day-label">{{ group.label }}</span>
      <div class="day-chips">
        <button
          v-for="date in group.dates"
          :key="date"
          class="chip"
          :class="{ 'chip--holiday': holidays.includes(date) }"
          @click="emit('toggle', date)"
        >
          {{ dayNumber(date) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.holiday-manager {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.25rem;
}

.section-title {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
  color: var(--color-primary);
}

.hint {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
}

.empty {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  text-align: center;
  padding: 0.5rem;
}

.day-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.day-group:last-child {
  margin-bottom: 0;
}

.day-label {
  font-weight: 600;
  font-size: 0.85rem;
  min-width: 5.5rem;
}

.day-chips {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.chip {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: var(--radius);
  background: var(--color-bg);
  color: var(--color-text);
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 2px solid transparent;
}

.chip:hover {
  border-color: var(--color-primary);
}

.chip--holiday {
  background: var(--color-danger);
  color: white;
  text-decoration: line-through;
}
</style>
