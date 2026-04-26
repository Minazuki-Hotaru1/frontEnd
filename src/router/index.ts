import { createRouter, createWebHistory } from "vue-router";


import LoginPage from '../views/login/LoginPage.vue'
import Home from "../views/home/Home.vue"
import EnterpriseRegistration from "../views/login/EnterpriseRegistration.vue"
import AdminPassEnterprise from "../views/admin/AdminPassEnterprise.vue";
import Test from "@/views/login/Test.vue";
import test2 from "@/views/login/test2.vue";
import AdminHome from "@/views/admin/AdminHome.vue";
import MapContainer from "@/views/login/MapContainer.vue";
import AdminEnterprise from "@/views/admin/AdminEnterprise.vue";
import User from "@/views/user/User.vue";
import pinia from "@/stores";
import { useAuthStore } from "@/stores/useAuthStore";
import Enterprise from "@/views/enterprise/Enterprise.vue";
import AdminUser from "@/views/admin/AdminUser.vue";

const routes = [
  { path: "/", component: LoginPage },
  { path: "/home", component: Home },
  { path: "/enRegistration", component: EnterpriseRegistration },
  { path: "/confirmed", component: AdminPassEnterprise },
  {
    path: "/test", component: Test,
    children: [{
      path: "test2", component: test2
    }]
  },
  {
    path: "/admin", component: AdminHome, children:
      [
        {
          path: "enRegistration",
          component: EnterpriseRegistration
        },
        {
          path: "confirmed",
          component: AdminPassEnterprise
        }]
  },
  { path: "/map", component: MapContainer },
  { path: "/adminManagement", component: AdminEnterprise },
  { path: "/user", component: User },
  { path: "/enterprise", component: Enterprise},
  { path: "/adminUser", component: AdminUser}

]


const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore(pinia)
  const requiresAuth = ["/admin", "/home", "/user"]
  const isProtectedRoute = requiresAuth.some((path) => to.path.startsWith(path))

  if (isProtectedRoute && !authStore.isAuthenticated) {
    next("/")
    return
  }

  if (to.path === "/" && authStore.isAuthenticated) {
    next("/admin")
    return
  }

  next()
})

export default router
