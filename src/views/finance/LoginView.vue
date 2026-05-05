<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, ArrowRight } from 'lucide-vue-next'
import axios from 'axios'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  isLoading.value = true
  try {
    const res = await axios.post('http://127.0.0.1:8000/api/login', {
      email: email.value,
      password: password.value,
    })
    localStorage.setItem('token', res.data.data.token)
    router.push('/finance/dashboard')
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Email atau password salah.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-left">
      <div class="brand">
        <div class="logo-box">RK</div>
        <h1>reimburseKu</h1>
      </div>
      <div class="hero">
        <h2>Panel Finance</h2>
        <p>Kelola data reimbursement karyawan dan proses pencairan dana dengan sistem yang terintegrasi.</p>
      </div>
      <div class="deco-circles">
        <div class="circle c1"></div>
        <div class="circle c2"></div>
      </div>
    </div>

    <div class="login-right">
      <div class="login-card">
        <div class="card-header">
          <h2>Masuk sebagai Finance</h2>
          <p>Masukkan kredensial Anda untuk melanjutkan</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              v-model="email"
              type="email"
              class="form-control"
              placeholder="finance@example.com"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-wrap">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                placeholder="••••••••"
                required
              />
              <button type="button" class="eye-btn" @click="showPassword = !showPassword">
                <EyeOff v-if="showPassword" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </div>
          </div>

          <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

          <button type="submit" class="btn btn-primary login-btn" :disabled="isLoading">
            <span v-if="!isLoading">Masuk <ArrowRight :size="16" /></span>
            <span v-else class="loader"></span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, var(--color-primary) 0%, #10b981 100%);
  color: white;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-box {
  width: 44px;
  height: 44px;
  background: white;
  color: var(--color-primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.brand h1 {
  font-size: 1.4rem;
  font-weight: 700;
}

.hero {
  margin: auto 0;
}

.hero h2 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero p {
  font-size: 1rem;
  opacity: 0.8;
  line-height: 1.7;
}

.deco-circles .circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.07);
}
.c1 { width: 400px; height: 400px; bottom: -150px; right: -100px; }
.c2 { width: 250px; height: 250px; bottom: 100px; right: 150px; }

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f9fafb;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}

.card-header {
  margin-bottom: 2rem;
}

.card-header h2 {
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: 0.375rem;
}

.card-header p {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.input-wrap {
  position: relative;
}

.input-wrap .form-control {
  padding-right: 2.5rem;
}

.eye-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  padding: 0;
  background: none;
  border: none;
}

.error-msg {
  font-size: 0.8125rem;
  color: var(--color-danger);
  margin-bottom: 1rem;
}

.login-btn {
  width: 100%;
  height: 2.75rem;
  font-size: 0.9375rem;
  margin-top: 0.5rem;
  gap: 0.5rem;
}

.loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .login-left { display: none; }
}
</style>
