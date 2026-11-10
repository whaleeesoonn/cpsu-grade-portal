<script setup>
import { computed, ref, watch } from 'vue'
import { auth } from '../stores/auth'
import { data, SUBJECTS, PASSING, subjectAverage, overallAverage, remark } from '../stores/data'

const isStudent = computed(() => auth.user.role === 'Student')
const selected = ref(isStudent.value ? auth.user.studentId : data.students.value[0]?.id)
const search = ref('')

const options = computed(() =>
  data.students.value.filter((s) => `${s.name} ${s.id}`.toLowerCase().includes(search.value.toLowerCase())),
)
watch(options, (o) => {
  if (o.length && !o.some((s) => s.id === selected.value)) selected.value = o[0].id
})

const student = computed(() => data.students.value.find((s) => s.id === selected.value))
const record = computed(() => data.gradesOf(selected.value))
const general = computed(() => overallAverage(selected.value))
const units = SUBJECTS.reduce((a, s) => a + s.units, 0)

const fmt = (v) => (v === null || v === undefined ? '—' : v.toFixed(2))
const onInput = (code, term, e) => data.setGrade(selected.value, code, term, e.target.value)
const clamp = (e) => {
  if (e.target.value !== '' && (+e.target.value < 0 || +e.target.value > 100)) e.target.value = ''
}
</script>

<template>
  <div class="layout">
    <aside v-if="!isStudent" class="panel picker">
      <h2>Students</h2>
      <input v-model="search" class="input" type="search" placeholder="Search students" aria-label="Search students" />
      <ul>
        <li v-for="s in options" :key="s.id">
          <button :class="{ on: s.id === selected }" @click="selected = s.id">
            <strong>{{ s.name }}</strong>
            <span>{{ s.id }} · {{ s.course }} {{ s.year }}</span>
          </button>
        </li>
        <li v-if="!options.length" class="none">No students found.</li>
      </ul>
    </aside>

    <section class="panel sheet">
      <template v-if="student">
        <div class="head">
          <div>
            <h2>{{ student.name }}</h2>
            <p class="sub">{{ student.id }} · {{ student.course }} · Year {{ student.year }} · {{ units }} units</p>
          </div>
          <div class="gen">
            <span>General average</span>
            <strong>{{ fmt(general) }}</strong>
            <span class="badge" :class="{ ok: remark(general) === 'Passed', bad: remark(general) === 'Failed', pending: remark(general) === 'Incomplete' }">{{ remark(general) }}</span>
          </div>
        </div>

        <p class="sub hint">
          {{ isStudent ? 'Grades are posted by your faculty and cannot be edited here.' : `Enter grades from 0 to 100. A subject is passed at ${PASSING} or higher. Changes save automatically.` }}
        </p>

        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Subject</th><th class="num">Units</th><th class="num">Prelim</th><th class="num">Midterm</th><th class="num">Final</th><th class="num">Average</th><th>Remarks</th></tr>
            </thead>
            <tbody>
              <tr v-for="s in SUBJECTS" :key="s.code">
                <td><strong>{{ s.code }}</strong><br /><span class="muted">{{ s.title }}</span></td>
                <td class="num">{{ s.units }}</td>
                <td v-for="t in ['prelim', 'midterm', 'final']" :key="t" class="num">
                  <span v-if="isStudent">{{ record[s.code]?.[t] ?? '—' }}</span>
                  <input v-else class="cell" type="number" min="0" max="100" inputmode="numeric" :aria-label="`${s.code} ${t}`" :value="record[s.code]?.[t] ?? ''" @input="clamp($event); onInput(s.code, t, $event)" />
                </td>
                <td class="num"><strong>{{ fmt(subjectAverage(record[s.code])) }}</strong></td>
                <td>
                  <span class="badge" :class="{ ok: remark(subjectAverage(record[s.code])) === 'Passed', bad: remark(subjectAverage(record[s.code])) === 'Failed', pending: remark(subjectAverage(record[s.code])) === 'Incomplete' }">{{ remark(subjectAverage(record[s.code])) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <p v-else class="sub">No student record is linked to this account yet. Ask an administrator to check your enrollment.</p>
    </section>
  </div>
</template>

<style scoped>
.layout { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 18px; align-items: start; }
.layout:has(.sheet:only-child) { grid-template-columns: 1fr; }
.picker { display: grid; gap: 14px; position: sticky; top: 16px; }
.picker ul { list-style: none; margin: 0; padding: 0; max-height: 60vh; overflow: auto; display: grid; gap: 4px; }
.picker button { width: 100%; text-align: left; border: 0; background: transparent; padding: 10px 12px; border-radius: 10px; display: grid; gap: 2px; }
.picker button:hover { background: var(--mint-50); }
.picker button.on { background: var(--mint-100); }
.picker strong { font-size: 0.92rem; }
.picker span { font-size: 0.78rem; color: var(--muted); }
.none { color: var(--muted); padding: 10px; font-size: 0.9rem; }
.head { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; align-items: flex-start; }
.gen { display: grid; justify-items: end; gap: 4px; }
.gen span:first-child { font-size: 0.82rem; color: var(--muted); font-weight: 600; }
.gen strong { font-size: 2.2rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1; }
.hint { margin-top: 14px; }
.muted { color: var(--muted); font-size: 0.8rem; }
.cell { width: 76px; padding: 8px 10px; border: 1px solid var(--line); background: var(--field); border-radius: 10px; text-align: right; font-variant-numeric: tabular-nums; }
.cell:focus { outline: none; border-color: var(--green-500); box-shadow: 0 0 0 3px rgba(31, 167, 91, 0.16); }
table { min-width: 700px; }
@media (max-width: 960px) {
  .layout { grid-template-columns: 1fr; }
  .picker { position: static; }
  .picker ul { max-height: 220px; }
}
</style>
