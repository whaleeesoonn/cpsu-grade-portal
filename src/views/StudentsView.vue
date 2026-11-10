<script setup>
import { computed, reactive, ref } from 'vue'
import { auth } from '../stores/auth'
import { data, COURSES, overallAverage, remark } from '../stores/data'

const isAdmin = computed(() => auth.user.role === 'Administrator')
const query = ref('')
const course = ref('All')
const editing = ref(null)
const form = reactive({ name: '', course: 'BSIT', year: 1, email: '' })
const error = ref('')

const list = computed(() =>
  data.students.value
    .filter((s) => (course.value === 'All' || s.course === course.value))
    .filter((s) => `${s.name} ${s.id} ${s.email}`.toLowerCase().includes(query.value.toLowerCase()))
    .map((s) => ({ ...s, avg: overallAverage(s.id) })),
)

function openForm(student) {
  error.value = ''
  if (student) Object.assign(form, student)
  else Object.assign(form, { name: '', course: 'BSIT', year: 1, email: '' })
  editing.value = student ? student.id : 'new'
}

function save() {
  if (!form.name.trim()) {
    error.value = 'Enter the student’s full name.'
    return
  }
  const payload = { name: form.name.trim(), course: form.course, year: Number(form.year), email: form.email.trim() }
  if (editing.value === 'new') data.addStudent(payload)
  else data.updateStudent(editing.value, payload)
  editing.value = null
}

function remove(s) {
  if (confirm(`Remove ${s.name} and all of their grades?`)) data.removeStudent(s.id)
}
</script>

<template>
  <div class="panel">
    <div class="bar">
      <div>
        <h2>Student information</h2>
        <p class="sub">{{ list.length }} of {{ data.students.value.length }} students shown</p>
      </div>
      <button v-if="isAdmin" class="btn small" @click="openForm()">Add student</button>
    </div>

    <div class="filters">
      <input v-model="query" class="input" type="search" placeholder="Search by name, ID, or email" aria-label="Search students" />
      <select v-model="course" class="input" aria-label="Filter by program">
        <option>All</option>
        <option v-for="c in COURSES" :key="c">{{ c }}</option>
      </select>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Program</th><th>Year</th><th>Email</th><th class="num">Average</th><th>Status</th><th v-if="isAdmin" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in list" :key="s.id">
            <td>{{ s.id }}</td>
            <td><strong>{{ s.name }}</strong></td>
            <td>{{ s.course }}</td>
            <td>{{ s.year }}</td>
            <td>{{ s.email || '—' }}</td>
            <td class="num">{{ s.avg === null ? '—' : s.avg.toFixed(1) }}</td>
            <td><span class="badge" :class="{ ok: remark(s.avg) === 'Passed', bad: remark(s.avg) === 'Failed', pending: remark(s.avg) === 'Incomplete' }">{{ remark(s.avg) }}</span></td>
            <td v-if="isAdmin" class="actions">
              <button class="btn ghost small" @click="openForm(s)">Edit</button>
              <button class="btn danger small" @click="remove(s)">Remove</button>
            </td>
          </tr>
          <tr v-if="!list.length"><td colspan="8" class="empty">No students match your search. Clear the filters to see everyone.</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-if="editing" class="modal" @click.self="editing = null">
    <form class="dialog" novalidate @submit.prevent="save" role="dialog" aria-modal="true">
      <h2>{{ editing === 'new' ? 'Add student' : 'Edit student' }}</h2>
      <p v-if="error" class="alert error" role="alert">{{ error }}</p>
      <div class="field"><label for="n">Full name</label><input id="n" v-model="form.name" class="input" placeholder="Enter full name" /></div>
      <div class="two">
        <div class="field"><label for="c">Program</label><select id="c" v-model="form.course" class="input"><option v-for="c in COURSES" :key="c">{{ c }}</option></select></div>
        <div class="field"><label for="y">Year level</label><select id="y" v-model="form.year" class="input"><option v-for="y in 4" :key="y" :value="y">Year {{ y }}</option></select></div>
      </div>
      <div class="field"><label for="e">Email</label><input id="e" v-model="form.email" type="email" class="input" placeholder="name@cpsu.edu.ph" /></div>
      <div class="row">
        <button type="button" class="btn ghost" @click="editing = null">Cancel</button>
        <button class="btn">Save student</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.bar { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.filters { display: grid; grid-template-columns: 1fr 160px; gap: 12px; margin-top: 18px; }
.actions { white-space: nowrap; display: flex; gap: 8px; }
.empty { text-align: center; color: var(--muted); padding: 28px; }
.modal { position: fixed; inset: 0; z-index: 50; background: rgba(6, 78, 46, 0.5); display: grid; place-items: center; padding: 16px; }
.dialog { background: #fff; border-radius: 20px; padding: 28px; width: min(480px, 100%); display: grid; gap: 16px; box-shadow: var(--shadow); max-height: 92vh; overflow: auto; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.row { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
@media (max-width: 560px) { .filters, .two { grid-template-columns: 1fr; } }
</style>
