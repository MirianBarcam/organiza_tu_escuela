import { ref, watch } from 'vue'
import { db } from '../firebase.js'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'

export function useFirestore(docName, defaultValue) {
  const data = ref(defaultValue)
  const loaded = ref(false)
  let fromServer = false

  const docRef = doc(db, 'appData', docName)

  onSnapshot(docRef, (snap) => {
    fromServer = true
    if (snap.exists()) {
      data.value = snap.data().value
    }
    loaded.value = true
    fromServer = false
  })

  watch(data, (val) => {
    if (fromServer || !loaded.value) return
    setDoc(docRef, { value: val })
  }, { deep: true })

  return { data, loaded }
}
