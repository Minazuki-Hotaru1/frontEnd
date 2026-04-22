import { createRouter, createWebHistory} from "vue-router";


import LoginPage from '../views/login/LoginPage.vue'
import Home from "../views/home/Home.vue"
import EnterpriseRegistration from "../views/login/EnterpriseRegistration.vue"
import AdminPassEnterprise from "../views/admin/AdminPassEnterprise.vue";
import Test from "@/views/login/Test.vue";
import test2 from "@/views/login/test2.vue";
import AdminHome from "@/views/admin/AdminHome.vue";  
import MapContainer from "@/views/login/MapContainer.vue";
import AdminEnterprise from "@/views/admin/AdminEnterprise.vue";


const routes=[
  {path: "/", component: LoginPage},
  {path: "/home", component: Home},
  {path: "/enRegistration", component: EnterpriseRegistration},
  {path: "/confirmed", component: AdminPassEnterprise},
  {path: "/test", component: Test,
    children:[{
      path: "test2", component: test2
    }]
  },
  {path: "/admin", component: AdminHome},
  {path: "/map", component: MapContainer},
  {path: "/adminManagement", component: AdminEnterprise}

]


const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")

  if (to.path === "/admin" && !token) {
    next("/")
    return
  }

  if (to.path === "/" && token) {    
    next("/admin")
    return
  }

  next()
})

export default router
