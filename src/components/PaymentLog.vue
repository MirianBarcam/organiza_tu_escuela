<script setup>
import { computed } from 'vue'

const props = defineProps({ logs: Array })

const MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
]

function formatMonth(ym) {
  const [y, m] = ym.split('-')
  return `${MONTHS[parseInt(m) - 1]} ${y}`
}

function formatTime(ts) {
  const d = new Date(ts)
  const day = d.getDate()
  const mon = MONTHS[d.getMonth()]
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${day} ${mon} · ${h}:${min}`
}

function methodLabel(method) {
  if (method === 'bizum') return 'Bizum'
  if (method === 'efectivo') return 'Efectivo'
  return ''
}

const sortedLogs = computed(() => {
  return [...(props.logs || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})
</script>

<template>
  <div class="log-panel">
    <h2 class="section-title">Historial de pagos</h2>

    <p v-if="sortedLogs.length === 0" class="empty">No hay registros todavía.</p>

    <ul v-else class="log-list">
      <li v-for="(entry, i) in sortedLogs" :key="i" class="log-entry" :class="'log-entry--' + entry.action">
        <div class="log-left">
          <span class="log-action" :class="'action--' + entry.action">
            {{ entry.action === 'paid' ? '✓' : '✗' }}
          </span>
        </div>
        <div class="log-info">
          <span class="log-name">{{ entry.studentName }}</span>
          <span class="log-detail">
            {{ formatMonth(entry.month) }}
            <template v-if="entry.action === 'paid'">
              · {{ entry.amount?.toFixed(2) }}€
              · <span class="log-method" :class="'method--' + entry.method">{{ methodLabel(entry.method) }}</span>
            </template>
          </span>
        </div>
        <span class="log-time">{{ formatTime(entry.timestamp) }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.log-panel {
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

.empty {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  text-align: center;
  padding: 1rem 0;
}

.log-list {
  list-style: none;
  padding: 0;
  max-height: 60vh;
  overflow-y: auto;
}

.log-entry {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-border);
}

.log-entry:last-child {
  border-bottom: none;
}

.log-action {
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.action--paid {
  background: var(--color-paid);
  color: var(--color-paid-text);
}

.action--unpaid {
  background: var(--color-unpaid);
  color: var(--color-unpaid-text);
}

.log-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.log-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.log-detail {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.log-method {
  font-weight: 600;
}

.method--bizum {
  color: #6b21a8;
}

.method--efectivo {
  color: var(--color-paid-text);
}

.log-time {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  text-align: right;
}
</style>
