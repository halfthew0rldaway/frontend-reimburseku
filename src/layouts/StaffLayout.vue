<script setup>
import { RouterView } from 'vue-router'
import { Edit2 } from 'lucide-vue-next'
</script>

<template>
  <div class="layout-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-top">
        <router-link to="/staf/dasbor" class="logo">
          <div class="logo-icon"></div>
          <span class="logo-text">reimburseKu</span>
        </router-link>
        
        <div class="user-profile">
          <div class="avatar-container">
            <img src="https://i.pravatar.cc/150?img=32" alt="Avatar" class="avatar-img" />
            <div class="status-indicator"></div>
          </div>
          <h3 class="user-name">Silviana Rodrigo</h3>
          <p class="user-role">SOFTWARE ENGINEER</p>
          
          <router-link to="/staf/profil" class="edit-profile-btn">
            <Edit2 :size="14" />
            <span>Edit Profile</span>
          </router-link>
        </div>
      </div>
      
      <!-- Decorative bottom bars -->
      <div class="sidebar-bg-decor">
        <div class="bar bar-1"></div>
        <div class="bar bar-2"></div>
        <div class="bar bar-3"></div>
        <div class="bar bar-4"></div>
        <div class="bar bar-5"></div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <div class="page-container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background-color: #f4f6f9;
}

.sidebar {
  width: 250px;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 10;
}

.sidebar-top {
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 3rem;
  text-decoration: none;
  color: white;
}

.logo-icon {
  width: 24px;
  height: 24px;
  background-color: white;
  border-radius: 4px;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-container {
  position: relative;
  margin-bottom: 1rem;
}

.avatar-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.status-indicator {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 14px;
  height: 14px;
  background-color: #22c55e;
  border: 2px solid var(--color-primary);
  border-radius: 50%;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.user-role {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
}

.edit-profile-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: white;
  color: var(--color-primary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.edit-profile-btn:hover {
  background-color: #f8fafc;
  transform: translateY(-1px);
}

.sidebar-bg-decor {
  display: flex;
  align-items: flex-end;
  height: 100px;
  opacity: 0.2;
  padding: 0 1rem;
  gap: 4px;
}

.bar {
  flex: 1;
  background-color: white;
  border-radius: 4px 4px 0 0;
}

.bar-1 { height: 40%; }
.bar-2 { height: 70%; }
.bar-3 { height: 100%; }
.bar-4 { height: 60%; }
.bar-5 { height: 80%; }

.main-content {
  flex: 1;
  margin-left: 250px; /* offset for fixed sidebar */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-container {
  padding: 2rem 3rem;
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  .main-content {
    margin-left: 200px;
  }
  .page-container {
    padding: 1.5rem;
  }
}
</style>
