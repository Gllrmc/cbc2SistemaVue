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
import Appconfig from '../components/Appconfig.vue'
import store from '../store'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      administrador: true,
      jefeadministracion: true,
      conciliador: true,
      asistadministracion: true,
      dataentry: true
    }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta:{
      libre: true
    }
  },
  {
    path: '/bancos',
    name: 'bancos',
    component: Banco,
    meta: {
      administrador: true,
      jefeadministracion: true,
      conciliador: true,
      asistadministracion: true,
      dataentry: true
    }
  },
  {
    path: '/conbancos',
    name: 'conbancos',
    component: Conbanco,
    meta: {
      administrador: true,
      jefeadministracion: true,
      conciliador: true,
      asistadministracion: true,
      dataentry: true
    }
  },
  {
    path: '/concontas',
    name: 'concontas',
    component: Conconta,
    meta: {
      administrador: true,
      jefeadministracion: true,
      conciliador: true,
      asistadministracion: true,
      dataentry: true
    }
  },
  {
    path: '/grpconceptos',
    name: 'grpconceptos',
    component: Grpconcepto,
    meta: {
      administrador: true,
      jefeadministracion: true,
      conciliador: true,
      asistadministracion: true,
      dataentry: true
    }
  },
  {
    path: '/paises',
    name: 'paises',
    component: Pais,
    meta: {
      administrador: true,
      jefeadministracion: true,
      conciliador: true,
      asistadministracion: true,
      dataentry: true
    }
  },   
  {
    path: '/personas',
    name: 'personas',
    component: Persona,
    meta: {
      administrador: true,
      jefeadministracion: true,
      conciliador: true,
      asistadministracion: true,
      dataentry: true
    }
  },   
  {
    path: '/provincias',
    name: 'provincias',
    component: Provincia,
    meta: {
      administrador: true,
      jefeadministracion: true,
      conciliador: true,
      asistadministracion: true,
      dataentry: true
    }
  },   
  {
    path: '/empresas',
    name: 'empresas',
    component: Empresa,
    meta: {
      administrador: true,
      jefeadministracion: true,
      conciliador: true,
      asistadministracion: true,
      dataentry: true
    }
  },   
  {
    path: '/roles',
    name: 'roles',
    component: Rol,
    meta: {
      administrador: true,
      jefeadministracion: true,
      conciliador: true,
      asistadministracion: true,
      dataentry: true
    }
  },
  {
    path: '/usuarios',
    name: 'usuarios',
    component: Usuario,
    meta: {
      administrador: true,
      jefeadministracion: true,
      conciliador: true,
      asistadministracion: true,
      dataentry: true
    }
  },   
  {
    path: '/appconfigs',
    name: 'appconfigs',
    component: Appconfig,
    meta: {
      administrador: true,
      jefeadministracion: true,
      conciliador: true,
      asistadministracion: true,
      dataentry: true
    }
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

var router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.libre)) {
      next();
  } else if (store.state.usuario && store.state.usuario.rol == 'Administrador') {
      if (to.matched.some(record => record.meta.administrador)) {
          next();
      }
  } else if (store.state.usuario && store.state.usuario.rol == 'JefeAdministracion') {
      if (to.matched.some(record => record.meta.jefeadministracion)) {
          next();
      }
  } else if (store.state.usuario && store.state.usuario.rol == 'AsistAdministracion') {
      if (to.matched.some(record => record.meta.asistadministracion)) {
          next();
      }
  } else if (store.state.usuario && store.state.usuario.rol == 'Conciliador') {
      if (to.matched.some(record => record.meta.conciliador)) {
          next();
      }
  } else if (store.state.usuario && store.state.usuario.rol == 'Dataentry') {
      if (to.matched.some(record => record.meta.dataentry)) {
          next();
      }
  } else {
      next({
        name: 'login'
    });
  }
});

export default router
