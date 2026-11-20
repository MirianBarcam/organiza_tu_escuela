<script setup>
import { ref, computed } from 'vue'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const props = defineProps({
  students: Array,
  cuotas: Array,
  horarios: Array,
  paymentStatus: Function,
  getPrice: Function
})
const emit = defineEmits(['pay', 'unpay', 'remove', 'edit'])

const editingId = ref(null)
const editName = ref('')
const editCuotas = ref([])
const editHorarios = ref([])
const activeFilter = ref('all')
const confirmUnpayId = ref(null)

function getStudentHorarioIds(student) {
  if (student.horarioIds) return student.horarioIds
  if (student.horarioId) return [student.horarioId]
  return []
}

function getCuotaNames(student) {
  return (student.cuotaIds || [])
    .map(id => props.cuotas.find(c => c.id === id))
    .filter(Boolean)
    .map(c => c.name)
    .join(' + ') || '—'
}

function getHorarioNames(student) {
  return getStudentHorarioIds(student)
    .map(id => props.horarios.find(h => h.id === id))
    .filter(Boolean)
    .map(h => `${DAYS[h.day]} ${h.startTime}`)
    .join(' · ')
}

function horarioLabel(h) {
  return `${DAYS[h.day]} ${h.startTime} – ${h.endTime}`
}

function horarioShort(h) {
  return `${DAYS[h.day].slice(0, 3)} ${h.startTime}`
}

const sortedHorarios = computed(() => {
  return [...props.horarios].sort((a, b) => {
    const dayA = a.day === 0 ? 7 : a.day
    const dayB = b.day === 0 ? 7 : b.day
    return dayA - dayB || a.startTime.localeCompare(b.startTime)
  })
})

const filteredStudents = computed(() => {
  if (activeFilter.value === 'all') return props.students
  return props.students.filter(s => getStudentHorarioIds(s).includes(activeFilter.value))
})

function startEdit(student) {
  editingId.value = student.id
  editName.value = student.name
  editCuotas.value = [...(student.cuotaIds || [])]
  editHorarios.value = [...getStudentHorarioIds(student)]
}

function cancelEdit() {
  editingId.value = null
}

function saveEdit() {
  if (!editName.value.trim()) return
  emit('edit', {
    id: editingId.value,
    name: editName.value.trim(),
    cuotaIds: [...editCuotas.value],
    horarioIds: [...editHorarios.value]
  })
  editingId.value = null
}

function toggleEditCuota(id) {
  const idx = editCuotas.value.indexOf(id)
  if (idx === -1) editCuotas.value.push(id)
  else editCuotas.value.splice(idx, 1)
}

function toggleEditHorario(id) {
  const idx = editHorarios.value.indexOf(id)
  if (idx === -1) editHorarios.value.push(id)
  else editHorarios.value.splice(idx, 1)
}

function statusIcon(method) {
  if (method === 'bizum') return 'B'
  if (method === 'efectivo') return '€'
  return '💸'
}

function statusClass(method) {
  if (method === 'bizum') return 'status-btn--bizum'
  if (method === 'efectivo') return 'status-btn--efectivo'
  return 'status-btn--unpaid'
}

function badgeClass(method) {
  if (method === 'bizum') return 'badge--bizum'
  if (method === 'efectivo') return 'badge--efectivo'
  return 'badge--unpaid'
}

function badgeText(method) {
  if (method === 'bizum') return 'Bizum'
  if (method === 'efectivo') return 'Efectivo'
  return 'Pendiente'
}
</script>

<template>
  <div class="student-list">
    <!-- Horario filter -->
    <div v-if="horarios.length" class="filter-bar">
      <button
        class="filter-chip"
        :class="{ 'filter-chip--active': activeFilter === 'all' }"
        @click="activeFilter = 'all'"
      >Todos</button>
      <button
        v-for="h in sortedHorarios"
        :key="h.id"
        class="filter-chip"
        :class="{ 'filter-chip--active': activeFilter === h.id }"
        @click="activeFilter = h.id"
      >{{ horarioShort(h) }}</button>
    </div>

    <p v-if="students.length === 0" class="empty">
      No hay alumnos todavía. Añade el primero arriba.
    </p>
    <p v-else-if="filteredStudents.length === 0" class="empty">
      Ningún alumno en este horario.
    </p>

    <div v-if="filteredStudents.length" class="card">
      <TransitionGroup name="list" tag="ul" class="list">
        <li
          v-for="student in filteredStudents"
          :key="student.id"
          class="student"
          :class="{ 'student--paid': paymentStatus(student.id) }"
        >
          <!-- Edit mode -->
          <div v-if="editingId === student.id" class="edit-form">
            <input v-model="editName" type="text" class="edit-input" placeholder="Nombre" />

            <div class="edit-section-label">Cuotas</div>
            <div class="edit-chips">
              <label
                v-for="c in cuotas"
                :key="c.id"
                class="edit-chip"
                :class="{ 'edit-chip--active': editCuotas.includes(c.id) }"
              >
                <input type="checkbox" :checked="editCuotas.includes(c.id)" @change="toggleEditCuota(c.id)" class="sr-only" />
                {{ c.name }}
              </label>
            </div>

            <div class="edit-section-label">Horarios</div>
            <div class="edit-chips">
              <label
                v-for="h in horarios"
                :key="h.id"
                class="edit-chip"
                :class="{ 'edit-chip--active': editHorarios.includes(h.id) }"
              >
                <input type="checkbox" :checked="editHorarios.includes(h.id)" @change="toggleEditHorario(h.id)" class="sr-only" />
                {{ horarioLabel(h) }}
              </label>
            </div>

            <div class="edit-actions">
              <button class="edit-save" @click="saveEdit">Guardar</button>
              <button class="edit-cancel" @click="cancelEdit">Cancelar</button>
              <button class="edit-delete" @click="$emit('remove', student.id); editingId = null">Eliminar</button>
            </div>
          </div>

          <!-- Normal mode -->
          <template v-else>
            <div class="student__info" @click="startEdit(student)" title="Editar alumno">
              <span class="student__name">{{ student.name }}</span>
              <span class="student__meta">
                {{ getCuotaNames(student) }}
                <template v-if="getHorarioNames(student)"> · {{ getHorarioNames(student) }}</template>
              </span>
            </div>

            <span class="student__price">{{ getPrice(student).toFixed(2) }}€</span>

            <div class="pay-area">
              <template v-if="paymentStatus(student.id)">
                <button
                  class="status-btn"
                  :class="statusClass(paymentStatus(student.id))"
                  @click="confirmUnpayId = student.id"
                >
                  {{ statusIcon(paymentStatus(student.id)) }}
                </button>
              </template>
              <template v-else>
                <button class="pick-btn pick-btn--efectivo" @click="$emit('pay', { id: student.id, method: 'efectivo' })">€</button>
                <button class="pick-btn pick-btn--bizum" @click="$emit('pay', { id: student.id, method: 'bizum' })">B</button>
              </template>
            </div>
          </template>
        </li>
      </TransitionGroup>
    </div>

    <!-- Confirm unpay modal -->
    <Teleport to="body">
      <div v-if="confirmUnpayId" class="modal-overlay" @click.self="confirmUnpayId = null">
        <div class="modal">
          <p class="modal__text">¿Quitar el pago de este alumno?</p>
          <div class="modal__actions">
            <button class="modal__btn modal__btn--cancel" @click="confirmUnpayId = null">Cancelar</button>
            <button class="modal__btn modal__btn--confirm" @click="emit('unpay', confirmUnpayId); confirmUnpayId = null">Confirmar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.student-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-bar {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.filter-chip {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text-muted);
  border: 1.5px solid var(--color-border);
  transition: all 0.15s;
}

.filter-chip--active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.empty {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.list {
  list-style: none;
  padding: 0;
}

.student {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--color-border);
  transition: background 0.2s;
}

.student:last-child {
  border-bottom: none;
}

.student--paid {
  background: rgba(212, 237, 218, 0.25);
}

.status-btn {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  padding: 0;
  flex-shrink: 0;
}

.pay-area {
  flex-shrink: 0;
  display: flex;
  gap: 0.3rem;
}

.status-btn--bizum { background: #ede9fe; color: #6b21a8; }
.status-btn--efectivo { background: var(--color-paid); color: var(--color-paid-text); }
.status-btn--unpaid { background: var(--color-unpaid); color: var(--color-unpaid-text); }

.pick-btn {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0;
}

.pick-btn--efectivo { background: var(--color-paid); color: var(--color-paid-text); }
.pick-btn--bizum { background: #ede9fe; color: #6b21a8; }

.student__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
  cursor: pointer;
  border-radius: calc(var(--radius) / 2);
  padding: 0.2rem 0.4rem;
  margin: -0.2rem -0.4rem;
  transition: background 0.15s;
}

.student__info:hover { background: var(--color-bg); }

.student__name { font-weight: 500; }

.student__meta {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student__price {
  font-weight: 700;
  font-size: 1rem;
  white-space: nowrap;
}

.student__badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.badge--bizum { background: #ede9fe; color: #6b21a8; }
.badge--efectivo { background: var(--color-paid); color: var(--color-paid-text); }
.badge--unpaid { background: var(--color-unpaid); color: var(--color-unpaid-text); }

/* Edit form */
.edit-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-input {
  font-size: 0.95rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: calc(var(--radius) / 2);
  outline: none;
  font-family: inherit;
}

.edit-input:focus { border-color: var(--color-primary); }

.edit-section-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  margin-top: 0.1rem;
}

.edit-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.edit-chip {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  border: 1.5px solid var(--color-border);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.edit-chip--active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.edit-actions {
  display: flex;
  gap: 0.4rem;
}

.edit-save {
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
}

.edit-save:hover { background: var(--color-primary-hover); }

.edit-cancel {
  background: var(--color-bg);
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
}

.edit-delete {
  margin-left: auto;
  background: transparent;
  color: var(--color-danger);
  font-weight: 600;
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
}

.edit-delete:hover {
  background: var(--color-danger);
  color: white;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  max-width: 320px;
  width: 100%;
  text-align: center;
}

.modal__text {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1.25rem;
}

.modal__actions {
  display: flex;
  gap: 0.5rem;
}

.modal__btn {
  flex: 1;
  padding: 0.65rem;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: calc(var(--radius) / 2);
}

.modal__btn--cancel {
  background: var(--color-bg);
  color: var(--color-text-muted);
}

.modal__btn--confirm {
  background: var(--color-danger);
  color: white;
}
</style>
