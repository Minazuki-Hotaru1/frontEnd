<template>
  <div class="user-home">
    <aside class="sidebar">
      <div class="sidebar-title">用户面板</div>
      <el-menu :default-active="activeMenu" class="menu" @select="handleSelect">
        <el-sub-menu index="enterprise" popper-class="sidebar-sub-menu">
          <template #title>
            <el-icon><IconMenu /></el-icon>
            <span>企业管理</span>
          </template>
          <el-menu-item index="enMap">
            <el-icon><Location /></el-icon>
            <span>企业地图</span>
          </el-menu-item>
          <el-menu-item index="enList">
            <el-icon><Document /></el-icon>
            <span>企业列表</span>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="reservation">
          <el-icon><Finished /></el-icon>
          <span>我的预约</span>
        </el-menu-item>

        <el-menu-item index="profile">
          <el-icon><Setting /></el-icon>
          <span>个人信息</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <main class="content">
      <div class="content-header">
        <div>
          <div class="content-avatar">
            <el-icon :size="22"><User /></el-icon>
          </div>
          <div>
            <h1 class="content-title">{{ pageTitle }}</h1>
            <p class="content-subtitle">{{ pageSubtitle }}</p>
          </div>
        </div>
        <button class="logout-btn" type="button" @click="logout">退出登录</button>
      </div>

      <section v-if="activeMenu === 'enMap'" class="panel panel-map">
        <UserMap />
      </section>

      <section v-else-if="activeMenu === 'enList'" class="panel">
        <UserEnterpriseList />
      </section>

      <section v-else-if="activeMenu === 'reservation'" class="panel">
        <UserAppointment />
      </section>

      <section v-else class="panel">
        <UserProfile />
      </section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Document,
  Finished,
  Location,
  Menu as IconMenu,
  Setting,
  User,
} from "@element-plus/icons-vue";
import { useAuthStore } from "../../stores/useAuthStore";
import UserMap from "./UserMap.vue";
import UserAppointment from "./UserAppointment.vue";
import UserEnterpriseList from "./UserEnterpriseList.vue";
import UserProfile from "./UserProfile.vue";

const router = useRouter();
const authStore = useAuthStore();
const activeMenu = ref("enMap");

const pageTitle = computed(() => {
  switch (activeMenu.value) {
    case "enMap":
      return "企业地图";
    case "enList":
      return "企业列表";
    case "reservation":
      return "我的预约";
    case "profile":
      return "个人信息";
    default:
      return "用户中心";
  }
});

const pageSubtitle = computed(() => {
  switch (activeMenu.value) {
    case "enMap":
      return "在地图上查看企业位置。";
    case "enList":
      return "浏览和搜索企业信息。";
    case "reservation":
      return "查看您已提交的预约记录。";
    case "profile":
      return "管理您的个人账户信息。";
    default:
      return "管理您的城市服务记录。";
  }
});

const handleSelect = (key: string) => {
  activeMenu.value = key;
};

const logout = () => {
  authStore.clearAuthData();
  ElMessage.success("已退出登录");
  router.push("/");
};
</script>

<style scoped>
.user-home {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: #E5EDF1;
}

.sidebar {
  flex: 0 0 260px;
  width: 260px;
  min-width: 260px;
  padding: 0;
  background: #FFFFFF;
  border-right: 1px solid #E5EDF1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-title {
  margin: 0;
  padding: 28px 24px 20px;
  font-size: 20px;
  font-weight: 800;
  color: #2c3e50;
  letter-spacing: 1px;
  border-bottom: 1px solid #E5EDF1;
}

.menu {
  width: 100%;
  border-right: none;
  background: transparent;
  padding: 12px 0;
}

.menu :deep(.el-menu-item),
.menu :deep(.el-sub-menu__title) {
  margin: 4px 12px;
  border-radius: 10px;
  height: 44px;
  line-height: 44px;
  color: #5a6f7e;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.menu :deep(.el-menu-item:hover),
.menu :deep(.el-sub-menu__title:hover) {
  background: #E5EDF1;
  color: #2c3e50;
}

.menu :deep(.el-menu-item.is-active) {
  background: #96C2DB;
  color: #FFFFFF;
  font-weight: 700;
}

.menu :deep(.el-sub-menu) {
  background: transparent;
}

.content {
  flex: 1 1 auto;
  min-width: 0;
  width: calc(100% - 260px);
  padding: 28px 32px;
  box-sizing: border-box;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.06);
}

.content-header > div:first-child {
  display: flex;
  align-items: center;
  gap: 14px;
}

.content-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #96C2DB, #7BAEC8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
}

.content-title {
  margin: 0;
  font-size: 22px;
  color: #2c3e50;
  font-weight: 800;
}

.content-subtitle {
  margin: 2px 0 0;
  color: #7a8b9a;
  font-size: 13px;
}

.logout-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: #96C2DB;
  color: #FFFFFF;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 4px 14px rgba(150, 194, 219, 0.3);
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #7BAEC8;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(150, 194, 219, 0.4);
}

.panel {
  min-height: 720px;
  width: 100%;
  padding: 24px;
  border-radius: 16px;
  background: #FFFFFF;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.06);
  box-sizing: border-box;
}

.panel-map {
  padding: 0;
  overflow: hidden;
}

.placeholder-panel {
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-card {
  text-align: center;
  color: #7a8b9a;
}

.placeholder-card h3 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #5a6f7e;
}

.placeholder-card p {
  margin: 0;
}
</style>

<style>
.sidebar-sub-menu,
.sidebar-sub-menu .el-menu--popup {
  background: #FFFFFF !important;
  border: 1px solid #E5EDF1 !important;
  border-radius: 10px !important;
  padding: 4px 0 !important;
  box-shadow: 0 8px 24px rgba(44, 62, 80, 0.12) !important;
}

.sidebar-sub-menu .el-menu--popup .el-menu-item,
.sidebar-sub-menu .el-menu-item {
  margin: 2px 6px;
  border-radius: 8px;
  height: 40px;
  line-height: 40px;
  color: #5a6f7e !important;
  background: transparent !important;
  font-size: 13px;
  font-weight: 500;
}

.sidebar-sub-menu .el-menu--popup .el-menu-item:hover,
.sidebar-sub-menu .el-menu-item:hover {
  background: #E5EDF1 !important;
  color: #2c3e50 !important;
}
</style>
