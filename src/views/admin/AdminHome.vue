<template>
  <div class="admin-home">
    <aside class="sidebar">
      <div class="sidebar-title">Admin Panel</div>
      <el-menu :default-active="activeMenu" class="menu" @select="handleSelect">
        <!-- 企业 -->
         <el-sub-menu index="1">
          <template #title>
            <el-icon>
            <IconMenu />
          </el-icon>
            <span>企业用户操作</span>
          </template>
        <el-menu-item index="adminPassEnterprise">
          <el-icon>
            <Document />
          </el-icon>
          <span>企业用户审核</span>
        </el-menu-item>
        <el-menu-item index="adminEnterprise">
          <el-icon><Finished /></el-icon>
          
          <span>已注册企业信息查看</span>
        </el-menu-item>
        <el-menu-item index="map1">
          <el-icon>
            <Location />
          </el-icon>
          <span>已注册企业地图分布点位</span>
        </el-menu-item>
        </el-sub-menu>

        <!-- 普通用户 -->
         <el-sub-menu index="2">
          <template #title>
            <el-icon><location /></el-icon>
            <span>普通用户操作</span>
          </template>
          <el-menu-item index="userInformation">
          <el-icon>
            <IconMenu />
          </el-icon>
          <span>普通用户信息查看</span>
        </el-menu-item>
        <el-menu-item index="map2">
          <el-icon>
            <Location />
          </el-icon>
          <span>已注册用户地图分布点位</span>
        </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="task">
          <el-icon>
            <Setting />
          </el-icon>
          <span>Task</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <main class="content">
      <div class="content-header">
        <div>
          <h1 class="content-title">{{ pageTitle }}</h1>
          <p class="content-subtitle">{{ pageSubtitle }}</p>
        </div>
        <button class="logout-btn" type="button" @click="logout">Logout</button>
      </div>

      <section v-if="activeMenu === 'adminPassEnterprise'" class="panel">
        <AdminPassEnterprise />
      </section>

      <section v-else-if="activeMenu === 'adminEnterprise'" class="panel">
        <AdminEnterprise />
      </section>

      <section v-else-if="activeMenu === 'userInformation'" class="panel">
        <AdminUser></AdminUser>
      </section>

      <section v-else-if="activeMenu === 'map1'" class="panel panel-map">
        <MapContainer>
          <el-amap-marker
            v-for="item in addressList"
            :key="item.id"
            :position="[Number(item.longitude), Number(item.latitude)]"
            anchor="bottom-center"
            :offset="[0, -10]"
            :top-when-click="true"
            :z-index="activeMarkerId === item.id ? 200 : 12"
            :re-event-when-update="true"
            :content="buildMarkerContent(item)"
            @click="activeMarkerId = item.id"
          />
        </MapContainer>
      </section>

      <section v-else-if="activeMenu === 'map2'" class="panel panel-map">
        <MapContainer>
          <ElAmapMarkerCluster
            v-if="clusterPoints.length"
            :points="clusterPoints"
            :grid-size="60"
            :max-zoom="17"
            :average-center="true"
            :cluster-by-zoom-change="true"
            :render-cluster-marker="renderClusterMarker"
            :render-marker="renderMarker"
          />
          <div v-else class="map-empty">No clustered points available.</div>
        </MapContainer>
      </section>

      <section v-else-if="activeMenu === 'role'" class="panel placeholder-panel">
        <div class="placeholder-card">
          <h3>Role</h3>
          <p>This module is not configured yet.</p>
        </div>
      </section>

      <section v-else class="panel placeholder-panel">
        <div class="placeholder-card">
          <h3>Task</h3>
          <p>This module is not configured yet.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { ElAmapMarkerCluster } from "@vuemap/vue-amap"
import { ElMessage } from "element-plus"
import { Document, Location, Menu as IconMenu, Setting } from "@element-plus/icons-vue"
import { useAuthStore } from "../../stores/useAuthStore"
import AdminPassEnterprise from "./AdminPassEnterprise.vue"
import AdminEnterprise from "./AdminEnterprise.vue"
import MapContainer from "../login/MapContainer.vue"
import AdminUser from "./AdminUser.vue"
import markerIconUrl from "../../../material/标点、地点_2.png"
import request from "../../utils/request"
import type { Address } from "../../types/Address"
import type { User } from "../../types/User"

const router = useRouter()
const authStore = useAuthStore()
const activeMenu = ref("adminPassEnterprise")
const addressList = ref<Address[]>([])
const activeMarkerId = ref("")
const userTableData = ref<User[]>([])

const clusterPoints = computed(() =>
  userTableData.value
    .filter((item) => Number.isFinite(Number(item.longitude)) && Number.isFinite(Number(item.latitude)))
    .map((item) => ({
      lnglat: [Number(item.longitude), Number(item.latitude)],
      id: item.id,
      username: item.username,
    }))
)

const pageTitle = computed(() => {
  switch (activeMenu.value) {
    case "adminPassEnterprise":
      return "Pending Enterprises"
    case "adminEnterprise":
      return "Approved Enterprises"
    case "map1":
      return "Enterprise Markers"
    case "map2":
      return "Clustered User Map"
    case "role":
      return "Role"
    default:
      return "Task"
  }
})

const pageSubtitle = computed(() => {
  switch (activeMenu.value) {
    case "adminPassEnterprise":
      return "Review enterprise applications and approve records."
    case "adminEnterprise":
      return "Browse enterprises that have already been approved."
    case "map1":
      return "View enterprise coordinates with rich info cards."
    case "map2":
      return "Render around 1000 points efficiently with clustering."
    case "role":
      return "Role settings will appear here."
    default:
      return "Task settings will appear here."
  }
})

const logout = () => {
  authStore.clearAuthData()
  ElMessage.success("Logged out")
  router.push("/")
}

const buildMarkerContent = (item: Address) => {
  return `
    <div class="custom-marker-card">
      <div class="custom-marker-title">${item.enterpriseName ?? "Unknown Enterprise"}</div>
      <div class="custom-marker-text">ID: ${item.id}</div>
    </div>
  `
}

const renderClusterMarker = (context: any) => {
  const wrapper = document.createElement("div")
  wrapper.className = "cluster-marker"

  const pin = document.createElement("div")
  pin.className = "cluster-pin"
  pin.style.backgroundImage = `url("${markerIconUrl}")`

  const badge = document.createElement("span")
  badge.className = "cluster-badge"
  badge.textContent = String(context.count)

  wrapper.append(pin, badge)
  context.marker.setContent(wrapper)
  context.marker.setOffset(new AMap.Pixel(-23, -52))
}

const renderMarker = (context: any) => {
  const pointDiv = document.createElement("div")
  pointDiv.className = "point-marker"
  pointDiv.style.backgroundImage = `url("${markerIconUrl}")`

  context.marker.setContent(pointDiv)
  context.marker.setOffset(new AMap.Pixel(-11, -34))
}

const handleSelect = (key: string) => {
  activeMenu.value = key

  if (key === "map1") {
    void getAddress()
  }

  if (key === "map2") {
    void getAllUser()
  }
}

const getAddress = async () => {
  try {
    const res = await request.get("/getAddress")
    addressList.value = res.data ?? []
  } catch {
    ElMessage.error("Failed to load map marker data")
  }
}

const getAllUser = async () => {
  try {
    const res = await request.get("/getAllUser")
    userTableData.value = res.data ?? []
  } catch {
    ElMessage.error("Failed to load clustered user points")
  }
}
</script>

<style scoped>
.admin-home {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: #f5f7fb;
}

.sidebar {
  flex: 0 0 260px;
  width: 260px;
  min-width: 260px;
  padding: 24px 18px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 8px 0 24px rgba(15, 23, 42, 0.04);
  box-sizing: border-box;
}

.sidebar-title {
  margin-bottom: 20px;
  padding: 0 12px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.menu {
  width: 100%;
  border-right: none;
}

.content {
  flex: 1 1 auto;
  min-width: 0;
  width: calc(100% - 260px);
  padding: 28px;
  box-sizing: border-box;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.content-title {
  margin: 0;
  font-size: 30px;
  color: #111827;
}

.content-subtitle {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.logout-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  background: #3653f8;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}

.panel {
  min-height: 720px;
  width: 100%;
  padding: 20px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  box-sizing: border-box;
}

.panel-map {
  position: relative;
  overflow: hidden;
}

.map-empty {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  color: #4b5563;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  z-index: 10;
}

.placeholder-panel {
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-card {
  text-align: center;
  color: #4b5563;
}

.placeholder-card h3 {
  margin: 0 0 8px;
  font-size: 22px;
  color: #111827;
}

.placeholder-card p {
  margin: 0;
}

:deep(.custom-marker-card) {
  position: relative;
  min-width: 180px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(54, 83, 248, 0.18);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
  color: #1f2937;
  backdrop-filter: blur(6px);
}

:deep(.custom-marker-card::after) {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -12px;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.96);
  border-right: 1px solid rgba(54, 83, 248, 0.18);
  border-bottom: 1px solid rgba(54, 83, 248, 0.18);
  transform: translateX(-50%) rotate(45deg);
  box-shadow: 6px 6px 14px rgba(15, 23, 42, 0.06);
}

:deep(.custom-marker-title) {
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 700;
}

:deep(.custom-marker-text) {
  font-size: 12px;
  color: #4b5563;
}

:deep(.cluster-marker) {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 52px;
}

:deep(.cluster-pin) {
  width: 46px;
  height: 52px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  filter: drop-shadow(0 10px 18px rgba(29, 78, 216, 0.24));
}

:deep(.cluster-badge) {
  position: absolute;
  top: -4px;
  right: -10px;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1d4ed8;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border: 2px solid #ffffff;
  box-shadow: 0 6px 18px rgba(29, 78, 216, 0.28);
}

:deep(.point-marker) {
  width: 22px;
  height: 34px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  filter: drop-shadow(0 6px 14px rgba(37, 99, 235, 0.24));
}
</style>
