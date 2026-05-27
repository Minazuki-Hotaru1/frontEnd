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

        <el-menu-item index="status">
          <el-icon><DataBoard /></el-icon>
          <span>企业状态</span>
        </el-menu-item>

        <el-menu-item index="profile">
          <el-icon><Setting /></el-icon>
          <span>个人信息</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <main class="content">
      <div class="content-header">
        <div class="header-left">
          <div class="content-avatar">
            <el-icon :size="22"><OfficeBuilding /></el-icon>
          </div>
          <span class="header-welcome">欢迎 {{ authStore.displayName }} 用户</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" plain size="default" @click="handleSelect('profile')">
            <el-icon><User /></el-icon>
            个人信息
          </el-button>
          <el-button type="danger" plain size="default" @click="logout">退出登录</el-button>
        </div>
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

      <section v-else-if="activeMenu === 'status'" class="panel">
        <EnterpriseStatusView />
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
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElNotification } from "element-plus";
import {
  Document,
  Menu as IconMenu,
  DataAnalysis,
  DataBoard,
  Setting,
  OfficeBuilding,
  User,
} from "@element-plus/icons-vue";
import { useAuthStore } from "../../stores/useAuthStore";
import request from "../../utils/request";
import EnterpriseAppointment from "./EnterpriseAppointment.vue";
import EnterpriseAppointmentRecord from "./EnterpriseAppointmentRecord.vue";
import EnterpriseChart from "./EnterpriseChart.vue";
import EnterpriseProfile from "./EnterpriseProfile.vue";
import EnterpriseStatusView from "./EnterpriseStatusView.vue";

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
    case "status":
      return "企业状态";
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
    case "status":
      return "查看当前预约与在线状态，调整容量配置。";
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

const notifyNewAppointments = async () => {
  try {
    const res = await request.get("/getNewAppointmentCount", {
      params: { enId: authStore.id },
    });
    const count = Number(res.data?.count ?? 0);

    if (count > 0) {
      ElNotification({
        title: "新预约提醒",
        message: `有 ${count} 个新用户进行了预约，请及时处理。`,
        type: "info",
        duration: 6000,
      });
    }
  } catch {
    // 静默处理
  } finally {
    activeMenu.value = "appointmentUser";
  }
};

onMounted(() => {
  void notifyNewAppointments();
});
</script>

<style scoped>
.enterprise-home {
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

.menu :deep(.el-menu-item) {
  margin: 4px 12px;
  border-radius: 10px;
  height: 44px;
  line-height: 44px;
  color: #5a6f7e;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.menu :deep(.el-menu-item:hover) {
  background: #E5EDF1;
  color: #2c3e50;
}

.menu :deep(.el-menu-item.is-active) {
  background: #96C2DB;
  color: #FFFFFF;
  font-weight: 700;
}

.menu :deep(.el-menu-item .el-icon) {
  font-size: 18px;
}

.content {
  flex: 1 1 auto;
  min-width: 0;
  width: calc(100% - 260px);
  padding: 28px 32px;
  box-sizing: border-box;
}

.content-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px 24px;
  background: #FFFFFF;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 4px 16px rgba(44, 62, 80, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-welcome {
  font-size: 17px;
  font-weight: 700;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.content-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #96C2DB, #7BAEC8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
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
