import { reactive, computed } from 'vue'

const KEY = 'dgms.data.v1'

export const SUBJECTS = [
  { code: 'CS 101', title: 'Introduction to Computing', units: 3 },
  { code: 'CS 102', title: 'Computer Programming 1', units: 3 },
  { code: 'MATH 101', title: 'Discrete Mathematics', units: 3 },
  { code: 'GE 101', title: 'Understanding the Self', units: 3 },
  { code: 'NSTP 1', title: 'National Service Training', units: 3 },
]
export const COURSES = ['BSIT', 'BSCS', 'BSED', 'BSA']
export const PASSING = 75

const NAMES = [
  'Angela Mae Villanueva', 'Joshua Rey Lacson', 'Kristine Joy Alvarez', 'Mark Anthony Gonzales',
  'Jessa Mae Torres', 'John Paul Dizon', 'Princess Anne Cabrera', 'Carlo Miguel Estrada',
  'Rhea Mae Bautista', 'Kevin James Ocampo', 'Hazel Ann Mendoza', 'Ryan Christian Pascual',
  'Samantha Rose Aquino', 'Dave Lorenz Navarro', 'Lovely Grace Ramos', 'Neil Patrick Soriano',
  'Camille Joy Flores', 'Jericho Paul Castillo', 'Trisha Mae Domingo', 'Adrian Lee Salvador',
  'Bianca Mae Romero', 'Francis Gabriel Lopez', 'Michelle Ann Tan', 'Jomar Ray Valdez',
]

// Small seeded generator so demo data is stable between runs.
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function seedData() {
  const rand = seeded(2026)
  const students = []
  const grades = {}
  NAMES.forEach((name, i) => {
    const id = `S-${String(i + 1).padStart(3, '0')}`
    const first = name.split(' ')[0].toLowerCase()
    students.push({
      id,
      name,
      course: COURSES[i % COURSES.length],
      year: (i % 4) + 1,
      email: `${first}.${id.toLowerCase().replace('-', '')}@cpsu.edu.ph`,
    })
    const ability = 68 + rand() * 28
    grades[id] = {}
    SUBJECTS.forEach((s) => {
      const g = () => Math.round(Math.min(99, Math.max(60, ability + (rand() - 0.5) * 16)))
      grades[id][s.code] = { prelim: g(), midterm: g(), final: g() }
    })
  })
  return { students, grades }
}

const saved = (() => {
  try {
    return JSON.parse(localStorage.getItem(KEY))
  } catch {
    return null
  }
})()

const state = reactive(saved ?? seedData())
const save = () => localStorage.setItem(KEY, JSON.stringify(state))

const num = (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v))

export function subjectAverage(rec) {
  if (!rec) return null
  const vals = [rec.prelim, rec.midterm, rec.final].map(num)
  if (vals.some((v) => v === null)) return null
  return Math.round((vals.reduce((a, b) => a + b, 0) / 3) * 100) / 100
}

export function overallAverage(studentId) {
  const rec = state.grades[studentId] ?? {}
  const avgs = SUBJECTS.map((s) => subjectAverage(rec[s.code])).filter((v) => v !== null)
  if (!avgs.length) return null
  return Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 100) / 100
}

export const remark = (avg) => (avg === null ? 'Incomplete' : avg >= PASSING ? 'Passed' : 'Failed')

export const data = {
  students: computed(() => state.students),
  gradesOf: (id) => state.grades[id] ?? {},

  addStudent({ name, course = 'BSIT', year = 1, email = '' }) {
    const next = state.students.reduce((m, s) => Math.max(m, parseInt(s.id.slice(2), 10)), 0) + 1
    const id = `S-${String(next).padStart(3, '0')}`
    const student = { id, name, course, year, email }
    state.students.push(student)
    state.grades[id] = {}
    save()
    return student
  },
  updateStudent(id, patch) {
    Object.assign(state.students.find((s) => s.id === id), patch)
    save()
  },
  removeStudent(id) {
    state.students = state.students.filter((s) => s.id !== id)
    delete state.grades[id]
    save()
  },
  setGrade(id, code, term, value) {
    const v = num(value)
    if (v !== null && (v < 0 || v > 100)) return
    state.grades[id] ??= {}
    state.grades[id][code] ??= { prelim: null, midterm: null, final: null }
    state.grades[id][code][term] = v
    save()
  },
  resetDemoData() {
    Object.assign(state, seedData())
    save()
  },
}
