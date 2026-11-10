import { reactive } from 'vue'
import { data } from './data'

const USERS_KEY = 'dgms.users'
const SESSION_KEY = 'dgms.session'

export const ROLES = ['Student', 'Faculty', 'Administrator']

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

async function hash(text) {
  if (!globalThis.crypto?.subtle) return text
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

const state = reactive({
  users: load(USERS_KEY, []),
  user: load(SESSION_KEY, null),
})

const persistUsers = () => localStorage.setItem(USERS_KEY, JSON.stringify(state.users))

// Demo accounts, created once on first run.
const ready = (async () => {
  if (state.users.length) return
  state.users = [
    { fullName: 'Maria Santos', username: 'admin', role: 'Administrator', password: await hash('admin123') },
    { fullName: 'Prof. Ramon Dela Cruz', username: 'faculty', role: 'Faculty', password: await hash('faculty123') },
    { fullName: 'Angela Mae Villanueva', username: 'student', role: 'Student', password: await hash('student123'), studentId: 'S-001' },
  ]
  persistUsers()
})()

export const auth = {
  get user() {
    return state.user
  },

  /** Registration flowchart: validate -> check username -> create -> save. */
  async register({ fullName, username, role, password }) {
    await ready
    fullName = fullName.trim()
    username = username.trim()
    if (!fullName || !username || !password || !role) {
      return { ok: false, field: 'form', message: 'Complete all fields before registering.' }
    }
    if (username.length < 3) return { ok: false, field: 'username', message: 'Username must be at least 3 characters.' }
    if (password.length < 6) return { ok: false, field: 'password', message: 'Password must be at least 6 characters.' }
    if (state.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, field: 'username', message: 'That username is already registered. Choose another one.' }
    }
    const account = { fullName, username, role, password: await hash(password) }
    if (role === 'Student') account.studentId = data.addStudent({ name: fullName }).id
    state.users.push(account)
    persistUsers()
    return { ok: true }
  },

  /** Login flowchart: validate -> verify credentials -> identify role. */
  async login({ username, password }) {
    await ready
    if (!username.trim() || !password) {
      return { ok: false, message: 'Enter your username and password.' }
    }
    const found = state.users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase())
    if (!found || found.password !== (await hash(password))) {
      return { ok: false, message: 'Invalid username or password.' }
    }
    const { password: _omit, ...session } = found
    state.user = session
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return { ok: true, role: session.role }
  },

  logout() {
    state.user = null
    localStorage.removeItem(SESSION_KEY)
  },
}
