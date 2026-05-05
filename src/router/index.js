import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/staff/login'
    },

    // Staff routes
    {
      path: '/staff/login',
      name: 'staff-login',
      component: () => import('../views/staff/LoginView.vue')
    },
    {
      path: '/staff',
      component: () => import('../layouts/StaffLayout.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'staff-dashboard',
          component: () => import('../views/staff/DashboardView.vue')
        },
        {
          path: 'reimbursement',
          name: 'staff-reimbursement',
          component: () => import('../views/staff/ReimbursementView.vue')
        },
        {
          path: 'reimbursement/add',
          name: 'staff-reimbursement-add',
          component: () => import('../views/staff/ReimbursementAddView.vue')
        },
        {
          path: 'reimbursement/:id',
          name: 'staff-reimbursement-detail',
          component: () => import('../views/staff/ReimbursementDetailView.vue')
        },
        {
          path: 'profile',
          name: 'staff-profile',
          component: () => import('../views/staff/ProfileView.vue')
        }
      ]
    },

    // Admin routes
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/admin/LoginView.vue')
    },
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('../views/admin/DashboardView.vue')
        },
        {
          path: 'karyawan',
          name: 'admin-karyawan',
          component: () => import('../views/admin/KaryawanView.vue')
        },
        {
          path: 'kategori',
          name: 'admin-kategori',
          component: () => import('../views/admin/KategoriView.vue')
        },
        {
          path: 'metode-bayar',
          name: 'admin-metode-bayar',
          component: () => import('../views/admin/MetodeBayarView.vue')
        },
        {
          path: 'hak-akses',
          name: 'admin-hak-akses',
          component: () => import('../views/admin/HakAksesView.vue')
        },
        {
          path: 'deposit',
          name: 'admin-deposit',
          component: () => import('../views/admin/DepositView.vue')
        },
        {
          path: 'arsip-deposit',
          name: 'admin-arsip-deposit',
          component: () => import('../views/admin/ArsipDepositView.vue')
        }
      ]
    },

    // Finance routes
    {
      path: '/finance/login',
      name: 'finance-login',
      component: () => import('../views/finance/LoginView.vue')
    },
    {
      path: '/finance',
      component: () => import('../layouts/FinanceLayout.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'finance-dashboard',
          component: () => import('../views/finance/DashboardView.vue')
        },
        {
          path: 'reimbursement',
          name: 'finance-reimbursement',
          component: () => import('../views/finance/ReimbursementView.vue')
        },
        {
          path: 'arsip',
          name: 'finance-arsip',
          component: () => import('../views/finance/ArsipView.vue')
        }
      ]
    }
  ]
})

export default router
