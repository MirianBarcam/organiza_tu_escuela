import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBX7MJDOzoAV0QzvtWHoLbi9wjyKoHZIn4",
  authDomain: "organizatuescuela.firebaseapp.com",
  projectId: "organizatuescuela",
  storageBucket: "organizatuescuela.firebasestorage.app",
  messagingSenderId: "79251310471",
  appId: "1:79251310471:web:0edb21d5097ebf14b63522",
  measurementId: "G-JTRT54R810"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
