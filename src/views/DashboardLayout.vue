<script setup>
import { computed, ref } from 'vue'
import { auth } from '../stores/auth'
import AnalyticsView from './AnalyticsView.vue'
import StudentsView from './StudentsView.vue'
import GradesView from './GradesView.vue'

const emit = defineEmits(['logout'])
const tab = ref('analytics')
const screens = { analytics: AnalyticsView, students: StudentsView, grades: GradesView }
const open = ref(false)
const user = computed(() => auth.user)
const isStudent = computed(() => user.value?.role === 'Student')

const nav = computed(() => {
  const items = [
    { to: 'analytics', label: 'Dashboard', icon: 'M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z' },
  ]
  if (!isStudent.value) {
    items.push({ to: 'students', label: 'Student Information', icon: 'M16 11a3 3 0 100-6 3 3 0 000 6zM8 11a3 3 0 100-6 3 3 0 000 6zm0 2c-2.3 0-7 1.2-7 3.5V19h14v-2.5C15 14.2 10.3 13 8 13zm8 0c-.3 0-.6 0-1 .1 1.2.8 2 1.9 2 3.4V19h6v-2.5c0-2.3-4.7-3.5-7-3.5z' })
  }
  items.push({ to: 'grades', label: isStudent.value ? 'My Grades' : 'Grades', icon: 'M6 3h9l4 4v14H6V3zm8 1.5V8h3.5L14 4.5zM9 12h7v1.6H9V12zm0 3.4h7V17H9v-1.6z' })
  return items
})

const title = computed(() => nav.value.find((n) => n.to === tab.value)?.label ?? 'Dashboard')
const initials = computed(() => user.value.fullName.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase())

function show(key) {
  tab.value = key
  open.value = false
}
</script>

<template>
  <div class="app">
    <div v-if="open" class="scrim" @click="open = false" />
    <aside class="side" :class="{ open }">
      <div class="brand">
        <img src="/cpsu-logo.png" alt="CPSU seal" />
        <div>
          <strong>CPSU</strong>
          <span>San Carlos Campus</span>
        </div>
      </div>
      <p class="sys">Digital Grading Management System</p>

      <nav aria-label="Main">
        <button v-for="n in nav" :key="n.to" class="link" :class="{ active: tab === n.to }" :aria-current="tab === n.to ? 'page' : undefined" @click="show(n.to)">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="n.icon" /></svg>
          {{ n.label }}
        </button>
      </nav>

      <div class="me">
        <span class="avatar">{{ initials }}</span>
        <div class="who">
          <strong>{{ user.fullName }}</strong>
          <span>{{ user.role }}</span>
        </div>
      </div>
      <button class="out" @click="emit('logout')">Log out</button>
    </aside>

    <div class="main">
      <header class="top">
        <button class="burger" aria-label="Open menu" @click="open = true">
          <svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
        <h1>{{ title }}</h1>
        <span class="chip">{{ user.role }}</span>
      </header>
      <main class="content"><component :is="screens[tab]" :key="tab" /></main>
    </div>
  </div>
</template>

<style scoped>
.app { display: grid; grid-template-columns: 272px minmax(0, 1fr); min-height: 100vh; width: 100%; }
.side {
  position: sticky; top: 0; height: 100vh;
  background: linear-gradient(180deg, var(--green-800), var(--green-900));
  color: #e6fbea; padding: 24px 18px; display: flex; flex-direction: column; gap: 6px;
}
.brand { display: flex; gap: 12px; align-items: center; }
.brand img { width: 52px; height: 52px; background: #fff; border-radius: 50%; padding: 2px; }
.brand strong { display: block; font-size: 1.25rem; letter-spacing: 0.02em; }
.brand span { font-size: 0.82rem; color: #a9e3b8; }
.sys { font-size: 0.82rem; color: #a9e3b8; margin: 14px 4px 22px; line-height: 1.4; }
nav { display: grid; gap: 6px; }
.link {
  display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px;
  color: #d6f5dc; text-decoration: none; font-weight: 600; transition: background 0.15s;
  border: 0; background: transparent; width: 100%; text-align: left; font-size: 1rem;
}
.link svg { width: 22px; height: 22px; fill: currentColor; flex: none; }
.link:hover { background: rgba(255, 255, 255, 0.08); }
.link.active { background: var(--mint-100); color: var(--green-800); }
.me { margin-top: auto; display: flex; align-items: center; gap: 12px; padding: 14px 8px 10px; border-top: 1px solid rgba(255, 255, 255, 0.14); }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--seal-yellow); color: var(--green-900); display: grid; place-items: center; font-weight: 800; flex: none; }
.who { min-width: 0; }
.who strong { display: block; font-size: 0.92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.who span { font-size: 0.8rem; color: #a9e3b8; }
.out { border: 1px solid rgba(255, 255, 255, 0.25); background: transparent; color: #fff; border-radius: 12px; padding: 10px; font-weight: 600; }
.out:hover { background: rgba(255, 255, 255, 0.1); }

.main { min-width: 0; display: flex; flex-direction: column; }
.top { display: flex; align-items: center; gap: 14px; padding: 22px clamp(18px, 3vw, 40px) 0; }
.top h1 { font-size: clamp(1.5rem, 2.4vw, 2rem); font-weight: 800; letter-spacing: -0.02em; color: var(--green-800); flex: 1; }
.chip { background: #fff; border: 1px solid var(--line); border-radius: 999px; padding: 6px 14px; font-size: 0.82rem; font-weight: 700; color: var(--green-700); }
.burger { display: none; width: 44px; height: 44px; border-radius: 12px; border: 1px solid var(--line); background: #fff; place-items: center; }
.burger svg { width: 24px; height: 24px; stroke: var(--green-800); stroke-width: 2; fill: none; stroke-linecap: round; }
.content { padding: 22px clamp(18px, 3vw, 40px) 48px; flex: 1; }
.scrim { display: none; }

@media (max-width: 960px) {
  .app { grid-template-columns: 1fr; }
  .side { position: fixed; z-index: 30; inset: 0 auto 0 0; width: min(290px, 84vw); transform: translateX(-100%); transition: transform 0.22s ease; }
  .side.open { transform: none; }
  .scrim { display: block; position: fixed; inset: 0; z-index: 20; background: rgba(6, 78, 46, 0.45); }
  .burger { display: grid; }
  @media (prefers-reduced-motion: reduce) { .side { transition: none; } }
}
</style>
