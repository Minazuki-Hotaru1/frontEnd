<template>
  <div class="enterprise-home">
    <aside class="sidebar">
      <div class="sidebar-title">企业管理</div>
      <el-menu :default-active="activeMenu" class="menu" @select="handleSelect">
        <el-menu-item index="appointmentUser">
          <el-icon><IconMenu /></el-icon>
          <span>预约用户管理</span>
        </el-menu-item>

        <el-menu-item index="appointmentRecord">
          <el-icon><Document /></el-icon>
          <span>用户预约记录</span>
        </el-menu-item>

        <el-menu-item index="appointmentChart">
          <el-icon><DataAnalysis /></el-icon>
          <span>预约统计图表</span>
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

      <section v-if="activeMenu === 'appointmentUser'" class="panel">
        <EnterpriseAppointment />
      </section>

      <section v-else-if="activeMenu === 'appointmentRecord'" class="panel">
        <EnterpriseAppointmentRecord />
      </section>

      <section v-else-if="activeMenu === 'appointmentChart'" class="panel">
        <EnterpriseChart />
      </section>

      <section v-else-if="activeMenu === 'profile'" class="panel">
        <EnterpriseProfile />
      </section>

      <section v-else class="panel placeholder-panel">
        <div class="placeholder-card">
          <h3>未知模块</h3>
          <p>该模块尚未配置。</p>
        </div>
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
  Menu as IconMenu,
  DataAnalysis,
  Setting,
} from "@element-plus/icons-vue";
import { useAuthStore } from "../../stores/useAuthStore";
import EnterpriseAppointment from "./EnterpriseAppointment.vue";
import EnterpriseAppointmentRecord from "./EnterpriseAppointmentRecord.vue";
import EnterpriseChart from "./EnterpriseChart.vue";
import EnterpriseProfile from "./EnterpriseProfile.vue";

const router = useRouter();
const authStore = useAuthStore();
const activeMenu = ref("appointmentUser");

const pageTitle = computed(() => {
  switch (activeMenu.value) {
    case "appointmentUser":
      return "预约用户管理";
    case "appointmentRecord":
      return "用户预约记录";
    case "appointmentChart":
      return "预约统计图表";
    case "profile":
      return "个人信息";
    default:
      return "企业管理中心";
  }
});

const pageSubtitle = computed(() => {
  switch (activeMenu.value) {
    case "appointmentUser":
      return "查看和管理用户的预约信息。";
    case "appointmentRecord":
      return "按时间排序查看所有预约记录及其状态。";
    case "appointmentChart":
      return "通过柱状图直观查看每日预约人数及各状态分布。";
    case "profile":
      return "查看和修改企业地址信息。";
    default:
      return "管理企业平台记录。";
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
.enterprise-home {
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
