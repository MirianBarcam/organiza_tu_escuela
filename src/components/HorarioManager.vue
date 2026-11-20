<script setup>
import { ref } from 'vue'

const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
]

defineProps({ horarios: Array })
const emit = defineEmits(['add', 'remove'])

const day = ref(1)
const startTime = ref('18:00')
const endTime = ref('19:30')

function dayLabel(val) {
  return DAYS.find(d => d.value === val)?.label || ''
}

function submit() {
  if (!startTime.value || !endTime.value) return
  emit('add', {
    day: parseInt(day.value),
    startTime: startTime.value,
    endTime: endTime.value
  })
  startTime.value = '18:00'
  endTime.value = '19:30'
}
</script>

<template>
  <div class="horario-manager">
    <h2 class="section-title">Horarios</h2>

    <form class="form" @submit.prevent="submit">
      <div class="form-row">
        <div class="field">
          <label class="field-label">Día</label>
          <select v-model="day" class="input">
            <option v-for="d in DAYS" :key="d.value" :value="d.value">{{ d.label }}</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">Inicio</label>
          <input v-model="startTime" type="time" class="input" />
        </div>
        <div class="field">
          <label class="field-label">Fin</label>
          <input v-model="endTime" type="time" class="input" />
        </div>
      </div>
      <button type="submit" class="add-btn">Añadir horario</button>
    </form>

    <ul class="list" v-if="horarios.length">
      <li v-for="h in horarios" :key="h.id" class="item">
        <div class="item-info">
          <strong>{{ dayLabel(h.day) }}</strong>
          <span class="item-detail">{{ h.startTime }} – {{ h.endTime }}</span>
        </div>
        <button class="remove-btn" @click="emit('remove', h.id)" title="Eliminar horario">&times;</button>
      </li>
    </ul>
    <p v-else class="empty">No hay horarios. Crea uno para agrupar alumnos.</p>
  </div>
</template>

<style scoped>
.horario-manager {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.25rem;
}

.section-title {
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  color: var(--color-primary);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.input {
  width: 100%;
}

.add-btn {
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  padding: 0.6rem;
}

.add-btn:hover {
  background: var(--color-primary-hover);
}

.list {
  list-style: none;
  padding: 0;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-border);
}

.item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.item-detail {
  font-size: 0.8rem;
  color: var(--color-text-muted);
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

.empty {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  text-align: center;
  padding: 0.5rem;
}
</style>
