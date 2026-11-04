<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: String
})
const emit = defineEmits(['update:modelValue'])

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const displayLabel = computed(() => {
  const [year, month] = props.modelValue.split('-')
  return `${MONTHS[parseInt(month) - 1]} ${year}`
})

function shift(delta) {
  const [year, month] = props.modelValue.split('-').map(Number)
  const d = new Date(year, month - 1 + delta, 1)
  const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  emit('update:modelValue', val)
}
</script>

<template>
  <div class="month-selector">
    <button class="month-btn" @click="shift(-1)" aria-label="Mes anterior">&larr;</button>
    <span class="month-label">{{ displayLabel }}</span>
    <button class="month-btn" @click="shift(1)" aria-label="Mes siguiente">&rarr;</button>
  </div>
</template>

<style scoped>
.month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: 0.75rem;
  box-shadow: var(--shadow);
}

.month-label {
  font-size: 1.1rem;
  font-weight: 600;
  min-width: 10rem;
  text-align: center;
}

.month-btn {
  background: var(--color-primary);
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  padding: 0;
}

.month-btn:hover {
  background: var(--color-primary-hover);
}
</style>
