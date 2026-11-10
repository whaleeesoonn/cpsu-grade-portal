<script setup>
const features = [
  { title: 'Authorized Accounts', text: 'Create an account for system access', icon: 'check' },
  { title: 'Role-Based Access', text: 'Access depends on your system role', icon: 'role' },
  { title: 'Academic Records', text: 'Manage academic information securely', icon: 'records' },
]
</script>

<template>
  <main class="shell">
    <section class="brand">
      <header class="school">
        <img src="/cpsu-logo.png" alt="CPSU seal" class="seal" />
        <div>
          <p class="school-name">CENTRAL PHILIPPINES<br />STATE UNIVERSITY</p>
          <p class="campus">San Carlos Campus</p>
        </div>
      </header>

      <p class="platform">ACADEMIC RECORDS PLATFORM</p>
      <h1>Digital Grading Management System</h1>
      <p class="tagline">Quality Education • Global Competitiveness</p>

      <ul class="features">
        <li v-for="f in features" :key="f.title">
          <span class="icon" aria-hidden="true">
            <svg v-if="f.icon === 'check'" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            <svg v-else-if="f.icon === 'role'" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2" /><path d="M9 12h6" /></svg>
            <svg v-else viewBox="0 0 24 24"><rect x="6" y="5" width="12" height="14" rx="1.5" /><path d="M9 9h6M9 13h6" /></svg>
          </span>
          <div>
            <strong>{{ f.title }}</strong>
            <span>{{ f.text }}</span>
          </div>
        </li>
      </ul>

      <p class="foot">SAN CARLOS CAMPUS • NEGROS OCCIDENTAL</p>
    </section>

    <section class="form-side">
      <div class="card"><slot /></div>
    </section>
  </main>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(24px, 5vw, 96px);
  padding: clamp(24px, 5vw, 88px);
}
.brand { display: flex; flex-direction: column; gap: 6px; color: var(--green-800); }
.school { display: flex; align-items: center; gap: 18px; margin-bottom: 22px; }
.seal { width: clamp(72px, 8vw, 104px); height: auto; }
.school-name { font-weight: 700; font-size: clamp(1rem, 1.5vw, 1.35rem); line-height: 1.2; color: var(--green-800); }
.campus { color: var(--green-600); margin-top: 6px; font-size: 1.05rem; }
.platform { font-weight: 700; letter-spacing: 0.1em; font-size: 0.85rem; color: var(--green-700); margin-top: 6px; }
h1 {
  font-size: clamp(2.6rem, 5.4vw, 5rem);
  line-height: 0.98;
  letter-spacing: -0.035em;
  font-weight: 800;
  color: var(--green-800);
  max-width: 11ch;
  margin-top: 4px;
}
.tagline { color: var(--green-600); font-weight: 600; font-size: clamp(1.05rem, 1.6vw, 1.5rem); margin: 14px 0 26px; }
.features { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
.features li { display: flex; gap: 18px; align-items: center; }
.features strong { display: block; font-size: 1.08rem; color: var(--green-800); }
.features span:not(.icon) { color: var(--green-600); font-size: 0.95rem; }
.icon { flex: none; width: 52px; height: 52px; border-radius: 50%; background: var(--green-400); display: grid; place-items: center; }
.icon svg { width: 26px; height: 26px; fill: none; stroke: #fff; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
.foot { margin-top: 36px; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.1em; color: var(--green-700); }

.form-side { display: flex; justify-content: center; }
.card {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 24px;
  padding: clamp(24px, 3.2vw, 48px);
  box-shadow: var(--shadow);
}

@media (max-width: 960px) {
  .shell { grid-template-columns: 1fr; align-items: start; padding: 28px 20px 40px; gap: 32px; }
  h1 { max-width: none; font-size: clamp(2.2rem, 9vw, 3.4rem); }
  .features, .foot { display: none; }
  .school { margin-bottom: 8px; }
  .tagline { margin-bottom: 0; }
}
</style>
