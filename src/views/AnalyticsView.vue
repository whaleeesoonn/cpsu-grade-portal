<script setup>
import { computed } from 'vue'
import { auth } from '../stores/auth'
import { data, SUBJECTS, COURSES, PASSING, subjectAverage, overallAverage } from '../stores/data'

const isStudent = computed(() => auth.user.role === 'Student')
const fmt = (v) => (v === null || v === undefined ? '—' : v.toFixed(1))
const mean = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : null)

const rows = computed(() =>
  data.students.value.map((s) => ({ ...s, avg: overallAverage(s.id) })),
)
const graded = computed(() => rows.value.filter((r) => r.avg !== null))

const subjectStats = computed(() =>
  SUBJECTS.map((sub) => {
    const avgs = data.students.value.map((s) => subjectAverage(data.gradesOf(s.id)[sub.code])).filter((v) => v !== null)
    const mine = isStudent.value ? subjectAverage(data.gradesOf(auth.user.studentId)[sub.code]) : null
    return { ...sub, avg: mean(avgs), mine }
  }),
)

const me = computed(() => rows.value.find((r) => r.id === auth.user.studentId))
const rank = computed(() => {
  if (!me.value || me.value.avg === null) return null
  return [...graded.value].sort((a, b) => b.avg - a.avg).findIndex((r) => r.id === me.value.id) + 1
})

const cards = computed(() => {
  if (isStudent.value) {
    const mine = subjectStats.value.filter((s) => s.mine !== null)
    const best = [...mine].sort((a, b) => b.mine - a.mine)[0]
    return [
      { label: 'My general average', value: fmt(me.value?.avg ?? null), note: me.value?.avg >= PASSING ? 'Passing' : me.value?.avg == null ? 'No complete grades yet' : 'Below passing' },
      { label: 'Subjects passed', value: `${mine.filter((s) => s.mine >= PASSING).length} / ${SUBJECTS.length}`, note: 'Passing grade is ' + PASSING },
      { label: 'Best subject', value: best ? best.code : '—', note: best ? fmt(best.mine) : 'Waiting for grades' },
      { label: 'Class standing', value: rank.value ? `#${rank.value}` : '—', note: `of ${graded.value.length} graded students` },
    ]
  }
  const passing = graded.value.filter((r) => r.avg >= PASSING).length
  return [
    { label: 'Students enrolled', value: rows.value.length, note: `${COURSES.length} programs` },
    { label: 'Class average', value: fmt(mean(graded.value.map((r) => r.avg))), note: 'All subjects combined' },
    { label: 'Passing rate', value: graded.value.length ? Math.round((passing / graded.value.length) * 100) + '%' : '—', note: `${passing} of ${graded.value.length} students` },
    { label: 'Needs attention', value: rows.value.length - passing, note: 'Below passing or incomplete' },
  ]
})

const buckets = computed(() => {
  const defs = [
    { label: '90–100', test: (v) => v >= 90 },
    { label: '85–89', test: (v) => v >= 85 && v < 90 },
    { label: '80–84', test: (v) => v >= 80 && v < 85 },
    { label: '75–79', test: (v) => v >= 75 && v < 80 },
    { label: 'Below 75', test: (v) => v < 75 },
  ]
  const counts = defs.map((d) => ({ label: d.label, n: graded.value.filter((r) => d.test(r.avg)).length }))
  const max = Math.max(1, ...counts.map((c) => c.n))
  return counts.map((c) => ({ ...c, h: (c.n / max) * 100 }))
})

const terms = computed(() => {
  const id = auth.user.studentId
  const rec = data.gradesOf(id)
  return ['prelim', 'midterm', 'final'].map((t) => ({
    label: t[0].toUpperCase() + t.slice(1),
    avg: mean(SUBJECTS.map((s) => rec[s.code]?.[t]).filter((v) => typeof v === 'number')),
  }))
})

const top = computed(() => [...graded.value].sort((a, b) => b.avg - a.avg).slice(0, 5))
const atRisk = computed(() => rows.value.filter((r) => r.avg === null || r.avg < PASSING).slice(0, 5))
const byCourse = computed(() =>
  COURSES.map((c) => {
    const list = graded.value.filter((r) => r.course === c)
    return { course: c, count: rows.value.filter((r) => r.course === c).length, avg: mean(list.map((r) => r.avg)) }
  }),
)
</script>

<template>
  <div class="page">
    <p class="hello">
      Welcome, <strong>{{ auth.user.fullName }}</strong>.
      {{ isStudent ? 'Here is how your grades are doing this term.' : 'Here is how your students are doing this term.' }}
    </p>

    <section class="cards" aria-label="Summary">
      <article v-for="c in cards" :key="c.label" class="stat">
        <span class="label">{{ c.label }}</span>
        <strong class="value">{{ c.value }}</strong>
        <span class="note">{{ c.note }}</span>
      </article>
    </section>

    <section class="grid">
      <div class="panel">
        <h2>{{ isStudent ? 'My grades vs. class average' : 'Average grade per subject' }}</h2>
        <p class="sub">The line marks the passing grade of {{ PASSING }}.</p>
        <div class="bars">
          <div v-for="s in subjectStats" :key="s.code" class="bar-row">
            <div class="bar-label">
              <strong>{{ s.code }}</strong>
              <span>{{ s.title }}</span>
            </div>
            <div class="track">
              <i class="pass" :style="{ left: PASSING + '%' }" />
              <b v-if="isStudent" class="fill mine" :style="{ width: (s.mine ?? 0) + '%' }" />
              <b class="fill" :class="{ class: isStudent }" :style="{ width: (s.avg ?? 0) + '%' }" />
            </div>
            <span class="bar-val">{{ fmt(isStudent ? s.mine : s.avg) }}</span>
          </div>
        </div>
        <p v-if="isStudent" class="legend"><span class="dot mine" /> You <span class="dot" /> Class average</p>
      </div>

      <div class="panel">
        <h2>{{ isStudent ? 'Average by grading period' : 'Grade distribution' }}</h2>
        <p class="sub">{{ isStudent ? 'Your average across all subjects.' : 'Students by general average.' }}</p>
        <div class="cols">
          <template v-if="isStudent">
            <div v-for="t in terms" :key="t.label" class="col">
              <span class="col-n">{{ fmt(t.avg) }}</span>
              <div class="col-bar"><b :style="{ height: (t.avg ?? 0) + '%' }" /></div>
              <span class="col-l">{{ t.label }}</span>
            </div>
          </template>
          <template v-else>
            <div v-for="b in buckets" :key="b.label" class="col">
              <span class="col-n">{{ b.n }}</span>
              <div class="col-bar"><b :class="{ low: b.label === 'Below 75' }" :style="{ height: b.h + '%' }" /></div>
              <span class="col-l">{{ b.label }}</span>
            </div>
          </template>
        </div>
      </div>
    </section>

    <section v-if="!isStudent" class="grid three">
      <div class="panel">
        <h2>Top performers</h2>
        <ol class="people">
          <li v-for="(r, i) in top" :key="r.id">
            <span class="rank">{{ i + 1 }}</span>
            <div><strong>{{ r.name }}</strong><span>{{ r.course }} · Year {{ r.year }}</span></div>
            <b>{{ fmt(r.avg) }}</b>
          </li>
        </ol>
      </div>
      <div class="panel">
        <h2>Needs attention</h2>
        <p v-if="!atRisk.length" class="sub">Every student is passing. Nice work.</p>
        <ul v-else class="people">
          <li v-for="r in atRisk" :key="r.id">
            <div><strong>{{ r.name }}</strong><span>{{ r.course }} · Year {{ r.year }}</span></div>
            <span class="badge" :class="r.avg === null ? 'pending' : 'bad'">{{ r.avg === null ? 'Incomplete' : fmt(r.avg) }}</span>
          </li>
        </ul>
      </div>
      <div class="panel">
        <h2>Average by program</h2>
        <ul class="people">
          <li v-for="c in byCourse" :key="c.course">
            <div><strong>{{ c.course }}</strong><span>{{ c.count }} students</span></div>
            <b>{{ fmt(c.avg) }}</b>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page { display: grid; gap: 22px; }
.hello { color: var(--muted); font-size: 1.02rem; }
.hello strong { color: var(--green-800); }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 18px; }
.stat { background: #fff; border: 1px solid var(--line); border-radius: var(--radius); padding: 20px 22px; display: grid; gap: 6px; }
.stat:first-child { background: linear-gradient(135deg, var(--green-700), var(--green-500)); color: #fff; border-color: transparent; }
.stat:first-child .label, .stat:first-child .note { color: #d8f7e1; }
.label { font-size: 0.9rem; font-weight: 600; color: var(--muted); }
.value { font-size: clamp(2rem, 3vw, 2.7rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; }
.note { font-size: 0.85rem; color: var(--muted); }

.grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 18px; }
.grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }

.bars { display: grid; gap: 16px; margin-top: 22px; }
.bar-row { display: grid; grid-template-columns: minmax(120px, 190px) 1fr 48px; gap: 14px; align-items: center; }
.bar-label strong { display: block; font-size: 0.92rem; }
.bar-label span { font-size: 0.78rem; color: var(--muted); }
.track { position: relative; height: 22px; background: var(--mint-50); border-radius: 8px; overflow: hidden; border: 1px solid var(--line); }
.track .fill { position: absolute; left: 0; top: 0; bottom: 0; background: var(--green-500); border-radius: 0 6px 6px 0; opacity: 1; }
.track .fill.class { background: #b9e6c8; }
.track .fill.mine { z-index: 1; height: 50%; top: 25%; background: var(--green-800); }
.track .pass { position: absolute; top: 0; bottom: 0; width: 0; border-left: 2px dashed var(--seal-yellow); z-index: 2; filter: drop-shadow(0 0 1px #8a7a00); }
.bar-val { font-weight: 700; text-align: right; font-variant-numeric: tabular-nums; }
.legend { margin-top: 16px; font-size: 0.85rem; color: var(--muted); display: flex; align-items: center; gap: 8px; }
.dot { width: 12px; height: 12px; border-radius: 4px; background: #b9e6c8; display: inline-block; }
.dot.mine { background: var(--green-800); margin-left: 6px; }

.cols { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 14px; align-items: end; height: 250px; margin-top: 22px; }
.col { display: grid; grid-template-rows: auto 1fr auto; gap: 8px; height: 100%; text-align: center; }
.col-n { font-weight: 700; font-size: 0.95rem; }
.col-l { font-size: 0.78rem; color: var(--muted); }
.col-bar { display: flex; align-items: flex-end; background: var(--mint-50); border-radius: 10px; border: 1px solid var(--line); overflow: hidden; }
.col-bar b { width: 100%; background: linear-gradient(180deg, var(--green-500), var(--green-700)); border-radius: 8px 8px 0 0; min-height: 3px; }
.col-bar b.low { background: linear-gradient(180deg, #f08a5d, var(--danger)); }

.people { list-style: none; padding: 0; margin: 14px 0 0; display: grid; gap: 4px; }
.people li { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #edf6f0; }
.people li:last-child { border-bottom: 0; }
.people li > div { flex: 1; min-width: 0; }
.people strong { display: block; font-size: 0.93rem; }
.people div span { font-size: 0.8rem; color: var(--muted); }
.people b { font-variant-numeric: tabular-nums; }
.rank { width: 28px; height: 28px; border-radius: 50%; background: var(--mint-100); color: var(--green-800); display: grid; place-items: center; font-weight: 700; font-size: 0.82rem; }

@media (max-width: 1100px) { .grid.three { grid-template-columns: 1fr 1fr; } }
@media (max-width: 860px) { .grid, .grid.three { grid-template-columns: 1fr; } }
@media (max-width: 560px) {
  .bar-row { grid-template-columns: 1fr 44px; }
  .bar-label { grid-column: 1 / -1; }
  .track { grid-column: 1; }
}
</style>
