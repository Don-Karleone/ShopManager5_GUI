import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/signin',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    name: 'Products',
    component: () => import('../views/Products.vue')
  },
  {
    path: '/Employees',
    name: 'Employees',
    component: () => import('../views/Employees.vue')
  },
  {
    path: '/Invoices',
    name: 'Invoices',
    component: () => import('../views/Invoices.vue')
  },
  {
    path: '/Clients',
    name: 'Clients',
    component: () => import('../views/Clients.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
