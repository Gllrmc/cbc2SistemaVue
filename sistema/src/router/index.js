import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../components/Login.vue'
import Banco from '../components/Banco.vue'
import Conbanco from '../components/Conbanco.vue'
import Rol from '../components/Rol.vue'
import Usuario from '../components/Usuario.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/bancos',
    name: 'bancos',
    component: Banco
  },
  {
    path: '/conbancos',
    name: 'conbancos',
    component: Conbanco
  },
  {
    path: '/roles',
    name: 'roles',
    component: Rol
  },
  {
    path: '/usuarios',
    name: 'usuarios',
    component: Usuario
  },   
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
