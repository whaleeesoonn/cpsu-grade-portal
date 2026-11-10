<script setup>
import { reactive, ref } from 'vue'
import AuthShell from '../components/AuthShell.vue'
import { auth } from '../stores/auth'

const props = defineProps({ registered: Boolean })
const emit = defineEmits(['register', 'success'])
const form = reactive({ username: '', password: '' })
const error = ref('')
const loading = ref(false)
const notice = props.registered ? 'Registration successful. Log in to continue.' : ''

async function submit() {
  error.value = ''
  loading.value = true
  const res = await auth.login(form)
  loading.value = false
  if (!res.ok) {
    error.value = res.message
    return
  }
  emit('success') // redirect to the dashboard for the user's role
}

function fill(username, password) {
  form.username = username
  form.password = password
}
</script>

<template>
  <AuthShell>
    <h2 class="title">Welcome Back</h2>
    <p class="lead">Log in to the Digital Grading Management System.</p>

    <form class="form" novalidate @submit.prevent="submit">
      <p v-if="notice && !error" class="alert success" role="status">{{ notice }}</p>
      <p v-if="error" class="alert error" role="alert">{{ error }}</p>

      <div class="field">
        <label for="username">Username</label>
        <input id="username" v-model="form.username" class="input" :class="{ invalid: error }" placeholder="Enter your username" autocomplete="username" />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" class="input" :class="{ invalid: error }" placeholder="Enter your password" autocomplete="current-password" />
      </div>

      <button class="btn" :disabled="loading">{{ loading ? 'Logging in…' : 'Login' }}</button>
    </form>

    <p class="switch">Don't have an account? <a href="#" @click.prevent="emit('register')">Register</a></p>

    <div class="demo">
      <p>Demo accounts</p>
      <div>
        <button type="button" @click="fill('admin', 'admin123')">Administrator</button>
        <button type="button" @click="fill('faculty', 'faculty123')">Faculty</button>
        <button type="button" @click="fill('student', 'student123')">Student</button>
      </div>
    </div>
  </AuthShell>
</template>

<style scoped>
.title { font-size: clamp(1.9rem, 3vw, 2.4rem); font-weight: 800; letter-spacing: -0.02em; color: var(--green-800); }
.lead { color: var(--muted); font-size: 1.1rem; margin: 14px 0 26px; line-height: 1.5; }
.form { display: grid; gap: 20px; }
.btn { margin-top: 4px; }
.switch { text-align: center; color: var(--muted); margin-top: 22px; }
.switch a { color: var(--green-800); font-weight: 700; margin-left: 6px; text-decoration: none; }
.switch a:hover { text-decoration: underline; }
.demo { margin-top: 26px; padding-top: 18px; border-top: 1px dashed var(--line); font-size: 0.85rem; color: var(--muted); }
.demo div { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.demo button { border: 1px solid var(--line); background: var(--field); border-radius: 999px; padding: 6px 14px; color: var(--green-700); font-weight: 600; font-size: 0.82rem; }
.demo button:hover { background: var(--mint-100); }
</style>
