<template>
  <div class="user-home">
    <aside class="sidebar">
      <div class="sidebar-title">用户面板</div>
      <el-menu :default-active="activeMenu" class="menu" @select="handleSelect">
        <el-sub-menu index="enterprise">
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
          <h1 class="content-title">{{ pageTitle }}</h1>
          <p class="content-subtitle">{{ pageSubtitle }}</p>
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
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
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
</style>
