<script setup>
import { ref, computed, watch } from 'vue'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const props = defineProps({ cuotas: Array, horarios: Array })
const emit = defineEmits(['add'])

const name = ref('')
const selectedCuotas = ref([])
const selectedHorarios = ref([])
const dropdownOpen = ref(false)

watch(() => props.cuotas, (val) => {
  if (val.length && !selectedCuotas.value.length) {
    selectedCuotas.value = [val[0].id]
  }
}, { immediate: true })

function horarioLabel(h) {
  return `${DAYS[h.day]} ${h.startTime}–${h.endTime}`
}

function toggleHorario(id) {
  const idx = selectedHorarios.value.indexOf(id)
  if (idx === -1) {
    selectedHorarios.value.push(id)
  } else {
    selectedHorarios.value.splice(idx, 1)
  }
}

function toggleCuota(id) {
  const idx = selectedCuotas.value.indexOf(id)
  if (idx === -1) {
    selectedCuotas.value.push(id)
  } else {
    selectedCuotas.value.splice(idx, 1)
  }
}

function removeCuota(id) {
  selectedCuotas.value = selectedCuotas.value.filter(c => c !== id)
}

function getCuotaName(id) {
  return props.cuotas.find(c => c.id === id)?.name || ''
}

function closeDropdown(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    dropdownOpen.value = false
  }
}

function submit() {
  if (!name.value.trim() || !selectedCuotas.value.length) return
  const data = {
    name: name.value.trim(),
    cuotaIds: [...selectedCuotas.value],
    horarioIds: [...selectedHorarios.value]
  }
  emit('add', data)
  name.value = ''
  selectedCuotas.value = props.cuotas.length ? [props.cuotas[0].id] : []
  selectedHorarios.value = []
  dropdownOpen.value = false
}
</script>

<template>
  <form class="add-form" @submit.prevent="submit">
    <div class="form-fields">
      <input
        v-model="name"
        type="text"
        placeholder="Nombre del alumno..."
        class="add-input"
      />

      <div v-if="cuotas.length" class="select-wrapper" @focusout="closeDropdown" tabindex="-1">
        <div class="select-box" @click="dropdownOpen = !dropdownOpen">
          <div class="select-content">
            <span v-if="!selectedCuotas.length" class="select-placeholder">Seleccionar cuotas...</span>
            <div v-else class="chips">
              <span
                v-for="id in selectedCuotas"
                :key="id"
                class="chip"
              >
                {{ getCuotaName(id) }}
                <button type="button" class="chip__remove" @click.stop="removeCuota(id)">&times;</button>
              </span>
            </div>
          </div>
          <span class="select-arrow" :class="{ 'select-arrow--open': dropdownOpen }">▾</span>
        </div>

        <ul v-show="dropdownOpen" class="dropdown">
          <li
            v-for="c in cuotas"
            :key="c.id"
            class="dropdown-item"
            :class="{ 'dropdown-item--selected': selectedCuotas.includes(c.id) }"
            @mousedown.prevent="toggleCuota(c.id)"
          >
            <span class="dropdown-check">{{ selectedCuotas.includes(c.id) ? '✓' : '' }}</span>
            <span class="dropdown-label">{{ c.name }}</span>
            <span class="dropdown-detail">{{ c.price.toFixed(2) }}€</span>
          </li>
        </ul>
      </div>

      <div v-if="horarios.length" class="horario-chips">
        <label
          v-for="h in horarios"
          :key="h.id"
          class="horario-chip"
          :class="{ 'horario-chip--active': selectedHorarios.includes(h.id) }"
          @click="toggleHorario(h.id)"
        >
          {{ horarioLabel(h) }}
        </label>
      </div>
    </div>

    <button type="submit" class="add-btn" :disabled="!cuotas.length || !selectedCuotas.length">Añadir</button>
  </form>
  <p v-if="!cuotas.length" class="hint">Crea una cuota en Ajustes antes de añadir alumnos.</p>
</template>

<style scoped>
.add-form {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.form-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.add-input {
  width: 100%;
}

.select-wrapper {
  position: relative;
  outline: none;
}

.select-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: white;
  cursor: pointer;
  min-height: 2.5rem;
  transition: border-color 0.2s;
}

.select-box:hover {
  border-color: var(--color-primary);
}

.select-content {
  flex: 1;
  min-width: 0;
}

.select-placeholder {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.select-arrow {
  color: var(--color-text-muted);
  font-size: 0.8rem;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.select-arrow--open {
  transform: rotate(180deg);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--color-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
}

.chip__remove {
  background: none;
  color: white;
  font-size: 0.9rem;
  padding: 0;
  line-height: 1;
  opacity: 0.8;
  border-radius: 0;
}

.chip__remove:hover {
  opacity: 1;
}

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  list-style: none;
  padding: 0.3rem 0;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.8rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.15s;
}

.dropdown-item:hover {
  background: var(--color-bg);
}

.dropdown-item--selected {
  color: var(--color-primary);
  font-weight: 600;
}

.dropdown-check {
  width: 1.2rem;
  text-align: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.dropdown-label {
  flex: 1;
}

.dropdown-detail {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.add-btn {
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  align-self: flex-start;
  margin-top: 0;
}

.add-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.horario-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.horario-chip {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  border: 1.5px solid var(--color-border);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.horario-chip--active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.hint {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-align: center;
  margin-top: -0.5rem;
}
</style>
