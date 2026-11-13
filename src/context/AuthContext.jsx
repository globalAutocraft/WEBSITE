import { createContext, useContext, useState } from 'react'

/*
  DEMO SIGN-IN — no SMS is sent and no server checks the code yet.
  Any 10-digit Indian mobile number and any 6-digit code will sign in.
  When the backend exists, replace requestOtp() and verifyOtp() with real API calls.
*/
export const AUTH_IS_DEMO = true

const STORAGE_KEY = 'gtvs-account'
const AuthContext = createContext(null)

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null
  } catch {
    return null
  }
}

function save(value) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* storage blocked: stay signed in for this visit only */
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export function AuthProvider({ children }) {
  const [user, setUser] = useState(load)

  const update = (next) => {
    setUser(next)
    save(next)
  }

  const value = {
    user,
    async requestOtp() {
      await wait(700)
    },
    async verifyOtp(phone) {
      await wait(900)
      update({ phone, vehicles: [] })
    },
    addVehicle(plate) {
      update({ ...user, vehicles: [...user.vehicles, plate] })
    },
    removeVehicle(plate) {
      update({ ...user, vehicles: user.vehicles.filter((v) => v !== plate) })
    },
    signOut() {
      update(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
