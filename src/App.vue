<script setup>
import { ref, computed } from 'vue'
import { useFirestore } from './composables/useFirestore.js'
import { getAdjustedPrice } from './composables/usePricing.js'
import PinLock from './components/PinLock.vue'
import MonthSelector from './components/MonthSelector.vue'
import StudentList from './components/StudentList.vue'
import AddStudent from './components/AddStudent.vue'
import CuotaManager from './components/CuotaManager.vue'
import HolidayManager from './components/HolidayManager.vue'
import HorarioManager from './components/HorarioManager.vue'
import GastosView from './components/GastosView.vue'
import PaymentLog from './components/PaymentLog.vue'

const { data: cuotas, loaded: cuotasLoaded } = useFirestore('cuotas', [])
const { data: students, loaded: studentsLoaded } = useFirestore('students', [])
const { data: payments, loaded: paymentsLoaded } = useFirestore('payments', {})
const { data: holidays, loaded: holidaysLoaded } = useFirestore('holidays', {})
const { data: horarios, loaded: horariosLoaded } = useFirestore('horarios', [])
const { data: pistaSettings, loaded: pistaSettingsLoaded } = useFirestore('pistaSettings', { pricePerHour: 10 })
const { data: paymentLogs, loaded: logsLoaded } = useFirestore('paymentLogs', [])

const allLoaded = computed(() =>
  cuotasLoaded.value && studentsLoaded.value && paymentsLoaded.value &&
  holidaysLoaded.value && horariosLoaded.value && pistaSettingsLoaded.value && logsLoaded.value
)

const tab = ref('pagos')

const now = new Date()
const currentMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

const monthHolidays = computed(() => holidays.value[currentMonth.value] || [])

function getStudentCuotas(student) {
  return (student.cuotaIds || []).map(id => cuotas.value.find(c => c.id === id)).filter(Boolean)
}

function getStudentPrice(student) {
  return getStudentCuotas(student).reduce(
    (sum, cuota) => sum + getAdjustedPrice(cuota, currentMonth.value, monthHolidays.value), 0
  )
}

// --- Cuotas ---
function addCuota(cuota) {
  cuotas.value.push({ id: Date.now().toString(36), ...cuota })
}
function removeCuota(id) {
  cuotas.value = cuotas.value.filter(c => c.id !== id)
}

// --- Horarios ---
function addHorario(h) {
  horarios.value.push({ id: Date.now().toString(36), ...h })
  horarios.value = [...horarios.value]
}
function removeHorario(id) {
  horarios.value = horarios.value.filter(h => h.id !== id)
}

// --- Students ---
function addStudent(data) {
  students.value.push({ id: Date.now().toString(36), ...data })
}
function updateStudent(updated) {
  const idx = students.value.findIndex(s => s.id === updated.id)
  if (idx === -1) return
  students.value[idx] = { ...students.value[idx], ...updated }
  students.value = [...students.value]
}
function removeStudent(id) {
  students.value = students.value.filter(s => s.id !== id)
  const cleaned = { ...payments.value }
  for (const month of Object.keys(cleaned)) {
    delete cleaned[month][id]
    if (Object.keys(cleaned[month]).length === 0) delete cleaned[month]
  }
  payments.value = cleaned
}

// --- Payments ---
function paymentStatus(studentId) {
  return payments.value[currentMonth.value]?.[studentId] || false
}

function payStudent({ id, method }) {
  const month = currentMonth.value
  if (!payments.value[month]) payments.value[month] = {}
  payments.value[month][id] = method
  payments.value = { ...payments.value }

  const student = students.value.find(s => s.id === id)
  paymentLogs.value = [{
    studentId: id,
    studentName: student?.name || '?',
    month,
    action: 'paid',
    method,
    amount: getStudentPrice(student),
    timestamp: new Date().toISOString()
  }, ...paymentLogs.value]
}

function unpayStudent(id) {
  const month = currentMonth.value
  if (!payments.value[month]) return
  payments.value[month][id] = false
  payments.value = { ...payments.value }

  const student = students.value.find(s => s.id === id)
  paymentLogs.value = [{
    studentId: id,
    studentName: student?.name || '?',
    month,
    action: 'unpaid',
    method: null,
    amount: null,
    timestamp: new Date().toISOString()
  }, ...paymentLogs.value]
}

// --- Holidays ---
function toggleHoliday(date) {
  const month = currentMonth.value
  const current = holidays.value[month] || []
  if (current.includes(date)) {
    holidays.value[month] = current.filter(d => d !== date)
  } else {
    holidays.value[month] = [...current, date]
  }
  holidays.value = { ...holidays.value }
}

// --- Summary ---
const summary = computed(() => {
  const total = students.value.length
  const paidStudents = students.value.filter(s => paymentStatus(s.id))
  const paid = paidStudents.length
  const totalAmount = students.value.reduce((sum, s) => sum + getStudentPrice(s), 0)
  const paidAmount = paidStudents.reduce((sum, s) => sum + getStudentPrice(s), 0)
  const bizumStudents = paidStudents.filter(s => paymentStatus(s.id) === 'bizum')
  const efectivoStudents = paidStudents.filter(s => paymentStatus(s.id) === 'efectivo')
  return {
    total, paid, pending: total - paid,
    totalAmount, paidAmount, pendingAmount: totalAmount - paidAmount,
    bizumCount: bizumStudents.length,
    efectivoCount: efectivoStudents.length,
    bizumAmount: bizumStudents.reduce((sum, s) => sum + getStudentPrice(s), 0),
    efectivoAmount: efectivoStudents.reduce((sum, s) => sum + getStudentPrice(s), 0)
  }
})
</script>

<template>
  <PinLock>
  <div class="app">
    <header class="header">
      <h1>🎾 Organiza tu Escuela 🎾</h1>
      <p class="subtitle">Control de pagos de pádel</p>
    </header>

    <div v-if="!allLoaded" class="loading">
      <span class="spinner"></span>
      <span>Cargando datos...</span>
    </div>

    <nav v-else class="tabs">
      <button class="tab" :class="{ 'tab--active': tab === 'pagos' }" @click="tab = 'pagos'">Pagos</button>
      <button class="tab" :class="{ 'tab--active': tab === 'gastos' }" @click="tab = 'gastos'">Gastos</button>
      <button class="tab" :class="{ 'tab--active': tab === 'historial' }" @click="tab = 'historial'">Historial</button>
      <button class="tab" :class="{ 'tab--active': tab === 'ajustes' }" @click="tab = 'ajustes'">Ajustes</button>
    </nav>

    <main v-if="!allLoaded"></main>

    <main class="main" v-else-if="tab === 'pagos'">
      <MonthSelector v-model="currentMonth" />

      <div class="summary-cards">
        <div class="card card--total">
          <span class="card__number">{{ summary.total }}</span>
          <span class="card__label">Alumnos</span>
        </div>
        <div class="card card--paid">
          <span class="card__number">{{ summary.paidAmount.toFixed(2) }}€</span>
          <span class="card__label">Cobrado</span>
        </div>
        <div class="card card--pending">
          <span class="card__number">{{ summary.pendingAmount.toFixed(2) }}€</span>
          <span class="card__label">Pendiente</span>
        </div>
      </div>

      <div v-if="summary.paid > 0" class="method-summary">
        <span v-if="summary.bizumCount" class="method-tag method-tag--bizum">Bizum: {{ summary.bizumCount }}</span>
        <span v-if="summary.efectivoCount" class="method-tag method-tag--efectivo">Efectivo: {{ summary.efectivoCount }}</span>
      </div>

      <AddStudent :cuotas="cuotas" :horarios="horarios" @add="addStudent" />

      <StudentList
        :students="students"
        :cuotas="cuotas"
        :horarios="horarios"
        :payment-status="paymentStatus"
        :get-price="getStudentPrice"
        @pay="payStudent"
        @unpay="unpayStudent"
        @edit="updateStudent"
        @remove="removeStudent"
      />
    </main>

    <main class="main" v-else-if="tab === 'gastos'">
      <MonthSelector v-model="currentMonth" />
      <GastosView
        :horarios="horarios"
        :pista-settings="pistaSettings"
        :month="currentMonth"
        :holidays="monthHolidays"
        :paid-income="summary.paidAmount"
        :bizum-amount="summary.bizumAmount"
        :efectivo-amount="summary.efectivoAmount"
      />
    </main>

    <main class="main" v-else-if="tab === 'historial'">
      <MonthSelector v-model="currentMonth" />
      <PaymentLog :logs="paymentLogs.filter(l => l.month === currentMonth)" />
    </main>

    <main class="main" v-else>
      <HorarioManager
        :horarios="horarios"
        @add="addHorario"
        @remove="removeHorario"
      />

      <CuotaManager
        :cuotas="cuotas"
        @add="addCuota"
        @remove="removeCuota"
      />

      <MonthSelector v-model="currentMonth" />

      <HolidayManager
        :month="currentMonth"
        :holidays="monthHolidays"
        :cuotas="cuotas"
        @toggle="toggleHoliday"
      />
    </main>
  </div>
  </PinLock>
</template>

<style scoped>
.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  text-align: center;
  padding: 1.5rem 0 0.75rem;
}

.header h1 {
  font-size: 1.6rem;
  color: var(--color-primary);
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab {
  flex: 1;
  padding: 0.7rem;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-weight: 600;
  border: 2px solid var(--color-border);
}

.tab--active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: 1rem;
  text-align: center;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.card__number {
  font-size: 1.4rem;
  font-weight: 700;
}

.card__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.card--paid .card__number {
  color: var(--color-paid-text);
}

.card--pending .card__number {
  color: var(--color-unpaid-text);
}

.method-summary {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.method-tag {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
}

.method-tag--bizum {
  background: #ede9fe;
  color: #6b21a8;
}

.method-tag--efectivo {
  background: var(--color-paid);
  color: var(--color-paid-text);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
