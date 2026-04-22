<template>
  <div class="page-header">
    <button class="logout-btn" type="button" @click="logout">Logout</button>
  </div>
  <el-tabs
    v-model="activeTab"
    tab-position="left"
    style="height: autos"
    class="demo-tabs"
    @tab-click="handleClick"
  >
    <el-tab-pane label="注册企业用户管理" name="admin">
      <AdminPassEnterprise />
    </el-tab-pane>
    <el-tab-pane label="已注册企业用户管理" name="enterprise">
      <admin-enterprise></admin-enterprise>


    </el-tab-pane>
    <el-tab-pane label="地图" name="map">
      <MapContainer>
        <el-amap-marker
          v-for="item in addressList"
          :key="item.id"
          :position="[Number(item.latitude), Number(item.longitude)]"
          anchor="bottom-center"
          :offset="[0, -10]"
          :top-when-click="true"
          :z-index="activeMarkerId === item.id ? 200 : 12"
          :re-event-when-update="true"
          :content="buildMarkerContent(item)"
          @click="activeMarkerId = item.id"
        />
      </MapContainer>
    </el-tab-pane>
    <el-tab-pane label="Role" name="role">Role</el-tab-pane>
    <el-tab-pane label="Task" name="task">Task</el-tab-pane>
  </el-tabs>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import { ElAmapMarker } from "@vuemap/vue-amap"
import { ElMessage, type TabsPaneContext } from "element-plus"
import { useRouter } from "vue-router"
import AdminPassEnterprise from "./AdminPassEnterprise.vue"
import MapContainer from "../login/MapContainer.vue"
import AdminEnterprise from "./AdminEnterprise.vue"
import request from "../../utils/request"
import type { Address } from "../../types/Address"

const activeTab = ref("admin")
const router = useRouter()
const addressList = ref<Address[]>([])
const activeMarkerId = ref("")

const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("username")
  ElMessage.success("Logged out")
  router.push("/")
}

const buildMarkerContent = (item: Address) => {
  return `
    <div class="custom-marker-card">
      <div class="custom-marker-title">${item.enterpriseName ?? "未知企业"}</div>
      <div class="custom-marker-text">ID: ${item.id}</div>
    </div>
  `
}

const handleClick = (tab: TabsPaneContext) => {
  if (tab.props.name === "map") {
    void getAddress()
  }
}

const getAddress = async () => {
  try {
    const res = await request.get("/getAddress")
    addressList.value = res.data ?? []
    console.log(addressList.value);
    
  } catch {
    ElMessage.error("地图点位数据获取失败")
  }
}
</script>

<style scoped>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.el-tabs--left {
  height: 100%;
}

.page-header {
  margin-bottom: 16px;
}

.logout-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #3653f8;
  color: #fff;
  cursor: pointer;
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
</style>
