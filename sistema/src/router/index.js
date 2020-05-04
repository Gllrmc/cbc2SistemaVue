import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../components/Login.vue'
import Banco from '../components/Banco.vue'
import Conbanco from '../components/Conbanco.vue'
import Conconta from '../components/Conconta.vue'
import Grpconcepto from '../components/Grpconcepto.vue'
import Pais from '../components/Pais.vue'
import Persona from '../components/Persona.vue'
import Provincia from '../components/Provincia.vue'
import Empresa from '../components/Empresa.vue'
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
    path: '/concontas',
    name: 'concontas',
    component: Conconta
  },
  {
    path: '/grpconceptos',
    name: 'grpconceptos',
    component: Grpconcepto
  },
  {
    path: '/paises',
    name: 'paises',
    component: Pais
  },   
  {
    path: '/personas',
    name: 'personas',
    component: Persona
  },   
  {
    path: '/provincias',
    name: 'provincias',
    component: Provincia
  },   
  {
    path: '/empresas',
    name: 'empresas',
    component: Empresa
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
