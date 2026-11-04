<script setup>
import { ref, computed } from 'vue'
import { useStorage } from './composables/useStorage.js'
import MonthSelector from './components/MonthSelector.vue'
import StudentList from './components/StudentList.vue'
import AddStudent from './components/AddStudent.vue'

const students = useStorage('padel-students', [])
const payments = useStorage('padel-payments', {})

const now = new Date()
const currentMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

function addStudent(name) {
  if (!name.trim()) return
  const id = Date.now().toString(36)
  students.value.push({ id, name: name.trim() })
}

function removeStudent(id) {
  students.value = students.value.filter(s => s.id !== id)
  const cleaned = { ...payments.value }
  for (const month of Object.keys(cleaned)) {
    delete cleaned[month][id]
    if (Object.keys(cleaned[month]).length === 0) {
      delete cleaned[month]
    }
  }
  payments.value = cleaned
}

function togglePayment(studentId) {
  const month = currentMonth.value
  if (!payments.value[month]) {
    payments.value[month] = {}
  }
  payments.value[month][studentId] = !payments.value[month][studentId]
  payments.value = { ...payments.value }
}

function isPaid(studentId) {
  return !!payments.value[currentMonth.value]?.[studentId]
}

const summary = computed(() => {
  const total = students.value.length
  const paid = students.value.filter(s => isPaid(s.id)).length
  return { total, paid, pending: total - paid }
})
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>🎾 Organiza tu Escuela</h1>
      <p class="subtitle">Control de pagos de pádel</p>
    </header>

    <main class="main">
      <MonthSelector v-model="currentMonth" />

      <div class="summary-cards">
        <div class="card card--total">
          <span class="card__number">{{ summary.total }}</span>
          <span class="card__label">Alumnos</span>
        </div>
        <div class="card card--paid">
          <span class="card__number">{{ summary.paid }}</span>
          <span class="card__label">Pagados</span>
        </div>
        <div class="card card--pending">
          <span class="card__number">{{ summary.pending }}</span>
          <span class="card__label">Pendientes</span>
        </div>
      </div>

      <AddStudent @add="addStudent" />

      <StudentList
        :students="students"
        :is-paid="isPaid"
        @toggle="togglePayment"
        @remove="removeStudent"
      />
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  text-align: center;
  padding: 1.5rem 0 1rem;
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
  font-size: 1.8rem;
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
</style>
