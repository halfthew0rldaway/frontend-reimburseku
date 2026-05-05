<script setup>
import { ref } from 'vue'
import { RouterView, RouterLink, useRouter } from 'vue-router'
import {
  LayoutDashboard, FileText, Archive, LogOut, Menu, X
} from 'lucide-vue-next'

const router = useRouter()
const sidebarOpen = ref(true)

const navItems = [
  { to: '/finance/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/finance/reimbursement', label: 'Reimbursement', icon: FileText },
  { to: '/finance/arsip', label: 'Arsip', icon: Archive },
]

function logout() {
  localStorage.removeItem('token')
  router.push('/finance/login')
}
</script>

<template>
  <div class="layout-container">
    <aside class="sidebar" :class="{ collapsed: !sidebarOpen }">
      <div class="sidebar-top">
        <RouterLink to="/finance/dashboard" class="logo">
          <div class="logo-icon">RK</div>
          <span class="logo-text" v-if="sidebarOpen">reimburseKu</span>
        </RouterLink>
        <p class="role-label" v-if="sidebarOpen">Finance</p>
      </div>

      <nav class="nav-menu">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="nav-active"
        >
          <component :is="item.icon" :size="18" />
          <span v-if="sidebarOpen">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item logout-btn" @click="logout">
          <LogOut :size="18" />
          <span v-if="sidebarOpen">Keluar</span>
        </button>
      </div>
    </aside>

    <main class="main-content" :class="{ expanded: !sidebarOpen }">
      <div class="topbar">
        <button class="toggle-btn" @click="sidebarOpen = !sidebarOpen">
          <Menu v-if="!sidebarOpen" :size="20" />
          <X v-else :size="20" />
        </button>
        <div class="topbar-right">
          <div class="admin-badge">Finance</div>
        </div>
      </div>

      <div class="page-wrapper">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
  background-color: #f4f6f9;
}

.sidebar {
  width: 240px;
  background-color: #10b981; /* A nice green for finance maybe, or stick to primary? */
  /* Let's stick to var(--color-primary) to maintain UI consistency */
  background-color: var(--color-primary);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 20;
  transition: width 0.25s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-top {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: white;
  margin-bottom: 0.5rem;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background-color: white;
  color: var(--color-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.logo-text {
  font-size: 1.1rem;
  font-weight: 700;
  white-space: nowrap;
}

.role-label {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-left: 0.25rem;
}

.nav-menu {
  flex: 1;
  padding: 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  border-radius: 8px;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  background-color: rgba(255,255,255,0.15);
  color: white;
}

.nav-active {
  background-color: rgba(255,255,255,0.2);
  color: white;
  font-weight: 600;
}

.sidebar-footer {
  padding: 1rem 0.5rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.logout-btn {
  color: rgba(255,255,255,0.7);
}

.logout-btn:hover {
  background-color: rgba(239,68,68,0.2);
  color: #fca5a5;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.25s ease;
}

.main-content.expanded {
  margin-left: 64px;
}

.topbar {
  background: white;
  border-bottom: 1px solid var(--color-border);
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
}

.toggle-btn {
  padding: 0.375rem;
  border-radius: 6px;
  color: var(--color-text-muted);
  transition: all 0.2s;
}

.toggle-btn:hover {
  background-color: var(--color-background);
  color: var(--color-text-main);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-badge {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
}

.page-wrapper {
  padding: 2rem;
  flex: 1;
}

@media (max-width: 768px) {
  .sidebar {
    width: 64px;
  }
  .main-content {
    margin-left: 64px;
  }
  .page-wrapper {
    padding: 1.25rem;
  }
}
</style>
