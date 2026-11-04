import { ref, watch } from 'vue'

export function useStorage(key, defaultValue) {
  let initial = defaultValue
  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      initial = JSON.parse(stored)
    }
  } catch {
    // corrupted data — fall back to default
  }

  const data = ref(initial)

  watch(data, (val) => {
    localStorage.setItem(key, JSON.stringify(val))
  }, { deep: true })

  return data
}
