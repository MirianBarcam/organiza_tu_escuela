<script setup>
import { ref } from 'vue'

const emit = defineEmits(['add'])
const name = ref('')

function submit() {
  if (!name.value.trim()) return
  emit('add', name.value)
  name.value = ''
}
</script>

<template>
  <form class="add-form" @submit.prevent="submit">
    <input
      v-model="name"
      type="text"
      placeholder="Nombre del alumno..."
      class="add-input"
    />
    <button type="submit" class="add-btn">Añadir</button>
  </form>
</template>

<style scoped>
.add-form {
  display: flex;
  gap: 0.5rem;
}

.add-input {
  flex: 1;
}

.add-btn {
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
}

.add-btn:hover {
  background: var(--color-primary-hover);
}
</style>
