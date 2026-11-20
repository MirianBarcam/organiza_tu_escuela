<script setup>
const props = defineProps({
  students: Array,
  cuotas: Array,
  isPaid: Function,
  getPrice: Function
})
defineEmits(['toggle', 'remove'])

function getCuotaNames(student) {
  return (student.cuotaIds || [])
    .map(id => props.cuotas.find(c => c.id === id))
    .filter(Boolean)
    .map(c => c.name)
    .join(' + ') || '—'
}
</script>

<template>
  <div class="student-list">
    <p v-if="students.length === 0" class="empty">
      No hay alumnos todavía. Añade el primero arriba.
    </p>

    <TransitionGroup name="list" tag="ul" class="list">
      <li
        v-for="student in students"
        :key="student.id"
        class="student"
        :class="{ 'student--paid': isPaid(student.id) }"
      >
        <button
          class="status-btn"
          :class="isPaid(student.id) ? 'status-btn--paid' : 'status-btn--unpaid'"
          @click="$emit('toggle', student.id)"
          :title="isPaid(student.id) ? 'Marcar como no pagado' : 'Marcar como pagado'"
        >
          {{ isPaid(student.id) ? '✓' : '💰' }}
        </button>

        <div class="student__info">
          <span class="student__name">{{ student.name }}</span>
          <span class="student__cuota">{{ getCuotaNames(student) }}</span>
        </div>

        <span class="student__price">{{ getPrice(student).toFixed(2) }}€</span>

        <span class="student__badge" :class="isPaid(student.id) ? 'badge--paid' : 'badge--unpaid'">
          {{ isPaid(student.id) ? 'Pagado' : 'Pendiente' }}
        </span>

        <button
          class="remove-btn"
          @click="$emit('remove', student.id)"
          title="Eliminar alumno"
        >
          &times;
        </button>
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.student-list {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.empty {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-muted);
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
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  padding: 0;
  flex-shrink: 0;
}

.status-btn--paid {
  background: var(--color-paid);
  color: var(--color-paid-text);
}

.status-btn--unpaid {
  background: var(--color-unpaid);
  color: var(--color-unpaid-text);
}

.student__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.student__name {
  font-weight: 500;
}

.student__cuota {
  font-size: 0.75rem;
  color: var(--color-text-muted);
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

.badge--paid {
  background: var(--color-paid);
  color: var(--color-paid-text);
}

.badge--unpaid {
  background: var(--color-unpaid);
  color: var(--color-unpaid-text);
}

.remove-btn {
  background: transparent;
  color: var(--color-text-muted);
  font-size: 1.3rem;
  padding: 0.2rem 0.5rem;
  border-radius: 50%;
  line-height: 1;
}

.remove-btn:hover {
  background: var(--color-danger);
  color: white;
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
</style>
