import { ref } from 'vue'
import { db } from '../firebase.js'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const authenticated = ref(false)
const hasPin = ref(null)
const error = ref('')

async function hashPin(pin) {
  const data = new TextEncoder().encode(pin)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const configRef = doc(db, 'appData', 'config')

export function useAuth() {
  async function checkPin() {
    if (sessionStorage.getItem('ote_auth') === 'true') {
      authenticated.value = true
      hasPin.value = true
      return
    }
    const snap = await getDoc(configRef)
    hasPin.value = snap.exists() && !!snap.data().pinHash
  }

  async function login(pin) {
    error.value = ''
    const snap = await getDoc(configRef)
    if (!snap.exists() || !snap.data().pinHash) {
      error.value = 'No hay PIN configurado'
      return false
    }
    const hash = await hashPin(pin)
    if (hash !== snap.data().pinHash) {
      error.value = 'PIN incorrecto'
      return false
    }
    authenticated.value = true
    sessionStorage.setItem('ote_auth', 'true')
    return true
  }

  async function createPin(pin) {
    error.value = ''
    if (pin.length < 4) {
      error.value = 'El PIN debe tener al menos 4 caracteres'
      return false
    }
    const hash = await hashPin(pin)
    await setDoc(configRef, { pinHash: hash }, { merge: true })
    hasPin.value = true
    authenticated.value = true
    sessionStorage.setItem('ote_auth', 'true')
    return true
  }

  return { authenticated, hasPin, error, checkPin, login, createPin }
}
