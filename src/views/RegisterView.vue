<script setup>
import { reactive, ref } from 'vue'
import AuthShell from '../components/AuthShell.vue'
import { auth, ROLES } from '../stores/auth'

const emit = defineEmits(['login', 'success'])
const form = reactive({ fullName: '', username: '', role: 'Student', password: '' })
const error = ref({ field: '', message: '' })
const loading = ref(false)

async function submit() {
  error.value = { field: '', message: '' }
  loading.value = true
  const res = await auth.register(form)
  loading.value = false
  if (!res.ok) {
    error.value = res
    return
  }
  emit('success')
}

const invalid = (f) => error.value.field === f || (error.value.field === 'form' && !form[f])
</script>

<template>
  <AuthShell>
    <h2 class="title">Create an Account</h2>
    <p class="lead">Register for the Digital Grading Management System.</p>

    <form class="form" novalidate @submit.prevent="submit">
      <p v-if="error.message && error.field === 'form'" class="alert error" role="alert">{{ error.message }}</p>

      <div class="field">
        <label for="fullName">Full Name</label>
        <input id="fullName" v-model="form.fullName" class="input" :class="{ invalid: invalid('fullName') }" placeholder="Enter your full name" autocomplete="name" />
      </div>
      <div class="field">
        <label for="username">Username</label>
        <input id="username" v-model="form.username" class="input" :class="{ invalid: invalid('username') }" placeholder="Choose a username" autocomplete="username" />
        <span v-if="error.field === 'username'" class="field-error" role="alert">{{ error.message }}</span>
      </div>
      <div class="field">
        <label for="role">Role</label>
        <select id="role" v-model="form.role" class="input">
          <option v-for="r in ROLES" :key="r">{{ r }}</option>
        </select>
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" class="input" :class="{ invalid: invalid('password') }" placeholder="Create a password" autocomplete="new-password" />
        <span v-if="error.field === 'password'" class="field-error" role="alert">{{ error.message }}</span>
      </div>

      <button class="btn" :disabled="loading">{{ loading ? 'Creating account…' : 'Register' }}</button>
    </form>

    <p class="switch">Already have an account? <a href="#" @click.prevent="emit('login')">Login</a></p>
  </AuthShell>
</template>

<style scoped>
.title { font-size: clamp(1.9rem, 3vw, 2.4rem); font-weight: 800; letter-spacing: -0.02em; color: var(--green-800); }
.lead { color: var(--muted); font-size: 1.1rem; margin: 14px 0 22px; line-height: 1.5; }
.form { display: grid; gap: 18px; }
select.input { appearance: auto; }
.btn { margin-top: 4px; }
.switch { text-align: center; color: var(--muted); margin-top: 20px; }
.switch a { color: var(--green-800); font-weight: 700; margin-left: 6px; text-decoration: none; }
.switch a:hover { text-decoration: underline; }
</style>
