<script setup>
import { ref, computed } from 'vue'
import { getWeekdayDates } from '../composables/usePricing.js'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const props = defineProps({
  horarios: Array,
  pistaSettings: Object,
  month: String,
  holidays: Array,
  paidIncome: Number,
  bizumAmount: Number,
  efectivoAmount: Number,
  extras: Array
})

const emit = defineEmits(['update:pistaSettings', 'addExtra', 'removeExtra'])

const newExtraName = ref('')
const newExtraPrice = ref('')

function duration(start, end) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60
}

function updatePrice(val) {
  const n = parseFloat(val)
  if (!isNaN(n) && n >= 0) {
    props.pistaSettings.pricePerHour = n
  }
}

const dayGroups = computed(() => {
  const [year, month] = props.month.split('-').map(Number)
  const holidaySet = new Set(props.holidays)
  const priceH = props.pistaSettings.pricePerHour || 10

  const byDay = {}
  for (const h of props.horarios) {
    if (!byDay[h.day]) byDay[h.day] = []
    byDay[h.day].push(h)
  }

  const groups = []
  const sortedDays = Object.keys(byDay).map(Number).sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))

  for (const day of sortedDays) {
    const slots = byDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime))
    const allDates = getWeekdayDates(year, month, day)
    const activeDates = allDates.filter(d => !holidaySet.has(d))
    const cancelledDates = allDates.filter(d => holidaySet.has(d))

    const slotDetails = slots.map(s => {
      const dur = duration(s.startTime, s.endTime)
      const costPerSession = dur * priceH
      return {
        ...s,
        duration: dur,
        costPerSession,
        totalCost: costPerSession * activeDates.length
      }
    })

    const totalHoursPerDay = slotDetails.reduce((sum, s) => sum + s.duration, 0)
    const pistasPerDay = slots.length
    const costPerDay = slotDetails.reduce((sum, s) => sum + s.costPerSession, 0)
    const totalCost = slotDetails.reduce((sum, s) => sum + s.totalCost, 0)

    groups.push({
      day,
      label: DAYS[day],
      slots: slotDetails,
      allDates,
      activeDates,
      cancelledDates,
      pistasPerDay,
      totalHoursPerDay,
      costPerDay,
      totalCost
    })
  }

  return groups
})

const totalPistas = computed(() =>
  dayGroups.value.reduce((sum, g) => sum + g.totalCost, 0)
)

const totalExtras = computed(() =>
  (props.extras || []).reduce((sum, e) => sum + (e.price || 0), 0)
)

const totalGastos = computed(() => totalPistas.value + totalExtras.value)

const balance = computed(() => props.paidIncome - totalGastos.value)

function submitExtra() {
  const name = newExtraName.value.trim()
  const price = parseFloat(newExtraPrice.value)
  if (!name || isNaN(price) || price <= 0) return
  emit('addExtra', { name, price })
  newExtraName.value = ''
  newExtraPrice.value = ''
}

function dayNumber(dateStr) {
  return parseInt(dateStr.split('-')[2])
}
</script>

<template>
  <div class="gastos">
    <div class="balance-cards">
      <div class="bcard bcard--income">
        <span class="bcard__number">{{ paidIncome.toFixed(2) }}€</span>
        <span class="bcard__label">Cobrado</span>
      </div>
      <div class="bcard bcard--expense">
        <span class="bcard__number">{{ totalGastos.toFixed(2) }}€</span>
        <span class="bcard__label">Gastos</span>
      </div>
      <div class="bcard" :class="balance >= 0 ? 'bcard--positive' : 'bcard--negative'">
        <span class="bcard__number">{{ balance >= 0 ? '+' : '' }}{{ balance.toFixed(2) }}€</span>
        <span class="bcard__label">Balance</span>
      </div>
    </div>

    <div v-if="paidIncome > 0" class="method-breakdown">
      <div class="method-row">
        <span class="method-dot method-dot--efectivo"></span>
        <span class="method-name">Efectivo</span>
        <span class="method-amount">{{ efectivoAmount.toFixed(2) }}€</span>
      </div>
      <div class="method-row">
        <span class="method-dot method-dot--bizum"></span>
        <span class="method-name">Bizum</span>
        <span class="method-amount">{{ bizumAmount.toFixed(2) }}€</span>
      </div>
    </div>

    <div class="price-setting">
      <label class="price-label">Precio por hora de pista:</label>
      <div class="price-input-row">
        <input
          type="number"
          step="0.5"
          min="0"
          :value="pistaSettings.pricePerHour"
          @change="updatePrice($event.target.value)"
          class="price-input"
        />
        <span class="price-suffix">€/hora</span>
      </div>
    </div>

    <div v-if="horarios.length === 0" class="empty-panel">
      <p>No hay horarios configurados.</p>
      <p class="hint">Añade horarios en Ajustes y el gasto en pistas se calculará solo.</p>
    </div>

    <div v-for="group in dayGroups" :key="group.day" class="day-card">
      <div class="day-header">
        <div class="day-title">
          <strong>{{ group.label }}</strong>
          <span class="day-meta">
            {{ group.pistasPerDay }} pista{{ group.pistasPerDay > 1 ? 's' : '' }}
            · {{ group.totalHoursPerDay }}h
            · {{ group.costPerDay.toFixed(2) }}€/día
          </span>
        </div>
        <span class="day-total">{{ group.totalCost.toFixed(2) }}€</span>
      </div>

      <div class="slots">
        <div v-for="s in group.slots" :key="s.id" class="slot-row">
          <span class="slot-time">{{ s.startTime }}–{{ s.endTime }}</span>
          <span class="slot-detail">{{ s.duration }}h × {{ (pistaSettings.pricePerHour || 10).toFixed(2) }}€ = {{ s.costPerSession.toFixed(2) }}€</span>
        </div>
      </div>

      <div class="day-sessions">
        <span class="sessions-label">{{ group.activeDates.length }} sesiones</span>
        <span v-if="group.cancelledDates.length" class="cancelled-label">
          {{ group.cancelledDates.length }} festivo{{ group.cancelledDates.length > 1 ? 's' : '' }}
        </span>
      </div>

      <div class="date-chips">
        <span
          v-for="date in group.allDates"
          :key="date"
          class="date-chip"
          :class="{ 'date-chip--cancelled': group.cancelledDates.includes(date) }"
        >
          {{ dayNumber(date) }}
        </span>
      </div>
    </div>

    <!-- Otros gastos -->
    <div class="extras-section">
      <div class="extras-header">
        <strong>Otros gastos</strong>
        <span v-if="extras.length" class="extras-total">{{ totalExtras.toFixed(2) }}€</span>
      </div>

      <div v-if="extras.length" class="extras-list">
        <div v-for="e in extras" :key="e.id" class="extra-row">
          <span class="extra-name">{{ e.name }}</span>
          <span class="extra-price">{{ e.price.toFixed(2) }}€</span>
          <button class="extra-remove" @click="$emit('removeExtra', e.id)">×</button>
        </div>
      </div>

      <form class="extra-form" @submit.prevent="submitExtra">
        <input
          v-model="newExtraName"
          type="text"
          placeholder="Ej: Cajón de bolas"
          class="extra-input extra-input--name"
        />
        <input
          v-model="newExtraPrice"
          type="number"
          step="0.01"
          min="0"
          placeholder="€"
          class="extra-input extra-input--price"
        />
        <button type="submit" class="extra-add">+</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.gastos {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.balance-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.bcard {
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: 1rem;
  text-align: center;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.bcard__number {
  font-size: 1.3rem;
  font-weight: 700;
}

.bcard__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.bcard--income .bcard__number { color: var(--color-paid-text); }
.bcard--expense .bcard__number { color: var(--color-unpaid-text); }
.bcard--positive .bcard__number { color: var(--color-paid-text); }
.bcard--negative .bcard__number { color: var(--color-danger); }

.method-breakdown {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 0.75rem 1rem;
}

.method-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0;
}

.method-dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.method-dot--efectivo { background: var(--color-paid-text); }
.method-dot--bizum { background: #6b21a8; }

.method-name {
  flex: 1;
  font-size: 0.85rem;
  font-weight: 500;
}

.method-amount {
  font-size: 0.95rem;
  font-weight: 700;
}

.price-setting {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.price-label {
  font-size: 0.85rem;
  font-weight: 500;
}

.price-input-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.price-input {
  width: 4.5rem;
  text-align: center;
  font-weight: 600;
}

.price-suffix {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.empty-panel {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
}

.hint { font-size: 0.8rem; margin-top: 0.25rem; }

.day-card {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1rem;
}

.day-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.day-title {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.day-meta {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.day-total {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-unpaid-text);
  white-space: nowrap;
}

.slots {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.slot-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  padding: 0.3rem 0.5rem;
  background: var(--color-bg);
  border-radius: calc(var(--radius) / 2);
}

.slot-time {
  font-weight: 600;
  min-width: 6rem;
}

.slot-detail {
  color: var(--color-text-muted);
}

.day-sessions {
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 0.5rem;
}

.cancelled-label {
  color: var(--color-danger);
}

.date-chips {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.date-chip {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: var(--radius);
  background: var(--color-bg);
  color: var(--color-text);
  font-weight: 600;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-chip--cancelled {
  background: var(--color-danger);
  color: white;
  text-decoration: line-through;
}

.extras-section {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1rem;
}

.extras-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.extras-total {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-unpaid-text);
}

.extras-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.extra-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  background: var(--color-bg);
  border-radius: calc(var(--radius) / 2);
}

.extra-name {
  flex: 1;
  font-size: 0.85rem;
  font-weight: 500;
}

.extra-price {
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
}

.extra-remove {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  background: transparent;
  color: var(--color-danger);
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}

.extra-remove:hover {
  background: var(--color-danger);
  color: white;
}

.extra-form {
  display: flex;
  gap: 0.4rem;
}

.extra-input {
  font-size: 0.85rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: calc(var(--radius) / 2);
  outline: none;
  font-family: inherit;
}

.extra-input:focus {
  border-color: var(--color-primary);
}

.extra-input--name {
  flex: 1;
  min-width: 0;
}

.extra-input--price {
  width: 4.5rem;
  text-align: center;
}

.extra-add {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}

.extra-add:hover {
  background: var(--color-primary-hover);
}
</style>
