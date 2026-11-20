<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const { authenticated, hasPin, error, checkPin, login, createPin } = useAuth()

const pin = ref('')
const confirmPin = ref('')
const step = ref('loading')

onMounted(async () => {
  await checkPin()
  if (authenticated.value) {
    step.value = 'done'
  } else if (hasPin.value) {
    step.value = 'login'
  } else {
    step.value = 'create'
  }
})

async function handleLogin() {
  const ok = await login(pin.value)
  if (ok) step.value = 'done'
}

async function handleCreate() {
  if (pin.value !== confirmPin.value) {
    error.value = 'Los PINs no coinciden'
    return
  }
  const ok = await createPin(pin.value)
  if (ok) step.value = 'done'
}
</script>

<template>
  <div v-if="step === 'done'">
    <slot />
  </div>

  <div v-else class="lock-screen">
    <div class="lock-card">
      <div class="lock-icon">🔒</div>
      <h1 class="lock-title">Organiza tu Escuela</h1>

      <div v-if="step === 'loading'" class="lock-loading">
        <span class="spinner"></span>
      </div>

      <form v-else-if="step === 'login'" class="lock-form" @submit.prevent="handleLogin">
        <p class="lock-subtitle">Introduce tu PIN para acceder</p>
        <input
          v-model="pin"
          type="password"
          inputmode="numeric"
          placeholder="PIN"
          class="lock-input"
          autofocus
          autocomplete="off"
        />
        <p v-if="error" class="lock-error">{{ error }}</p>
        <button type="submit" class="lock-btn" :disabled="!pin">Entrar</button>
      </form>

      <form v-else-if="step === 'create'" class="lock-form" @submit.prevent="handleCreate">
        <p class="lock-subtitle">Primera vez: crea un PIN de acceso</p>
        <input
          v-model="pin"
          type="password"
          inputmode="numeric"
          placeholder="Nuevo PIN (mín. 4 caracteres)"
          class="lock-input"
          autofocus
          autocomplete="off"
        />
        <input
          v-model="confirmPin"
          type="password"
          inputmode="numeric"
          placeholder="Repetir PIN"
          class="lock-input"
          autocomplete="off"
        />
        <p v-if="error" class="lock-error">{{ error }}</p>
        <button type="submit" class="lock-btn" :disabled="pin.length < 4">Crear PIN</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.lock-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--color-bg);
}

.lock-card {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 340px;
  text-align: center;
}

.lock-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.lock-title {
  font-size: 1.3rem;
  color: var(--color-primary);
  margin-bottom: 1.25rem;
}

.lock-subtitle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.lock-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.lock-input {
  text-align: center;
  font-size: 1.2rem;
  letter-spacing: 0.3em;
  padding: 0.75rem;
}

.lock-error {
  color: var(--color-danger);
  font-size: 0.8rem;
  font-weight: 600;
}

.lock-btn {
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  padding: 0.75rem;
  font-size: 1rem;
  margin-top: 0.25rem;
}

.lock-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.lock-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.lock-loading {
  padding: 2rem 0;
  display: flex;
  justify-content: center;
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
