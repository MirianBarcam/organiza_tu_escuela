<script setup>
import { ref } from 'vue'
import { weekdayName } from '../composables/usePricing.js'

defineProps({ cuotas: Array })
const emit = defineEmits(['add', 'remove'])

const name = ref('')
const price = ref('')
const weekday = ref(1)

const DAYS = [1, 2, 3, 4, 5, 6, 0]

function submit() {
  if (!name.value.trim() || !price.value) return
  emit('add', {
    name: name.value.trim(),
    price: parseFloat(price.value),
    weekday: parseInt(weekday.value)
  })
  name.value = ''
  price.value = ''
  weekday.value = 1
}
</script>

<template>
  <div class="cuota-manager">
    <h2 class="section-title">Cuotas</h2>

    <form class="form" @submit.prevent="submit">
      <input v-model="name" type="text" placeholder="Nombre (ej: 1.5h/semana)" class="input" />
      <div class="form-row">
        <div class="field">
          <label class="field-label">Precio base</label>
          <div class="price-input">
            <input v-model="price" type="number" step="0.01" min="0" placeholder="62" class="input" />
            <span class="price-suffix">€/mes</span>
          </div>
        </div>
        <div class="field">
          <label class="field-label">Día</label>
          <select v-model="weekday" class="input">
            <option v-for="d in DAYS" :key="d" :value="d">{{ weekdayName(d) }}</option>
          </select>
        </div>
      </div>
      <button type="submit" class="add-btn">Añadir cuota</button>
    </form>

    <ul class="list" v-if="cuotas.length">
      <li v-for="cuota in cuotas" :key="cuota.id" class="item">
        <div class="item-info">
          <strong>{{ cuota.name }}</strong>
          <span class="item-detail">{{ weekdayName(cuota.weekday) }} · {{ cuota.price.toFixed(2) }}€/mes</span>
        </div>
        <button class="remove-btn" @click="emit('remove', cuota.id)" title="Eliminar cuota">&times;</button>
      </li>
    </ul>
    <p v-else class="empty">No hay cuotas. Crea una para asignarla a tus alumnos.</p>
  </div>
</template>

<style scoped>
.cuota-manager {
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
  grid-template-columns: 1fr 1fr;
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

.price-input {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.price-input .input {
  flex: 1;
  min-width: 0;
}

.price-suffix {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  white-space: nowrap;
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
