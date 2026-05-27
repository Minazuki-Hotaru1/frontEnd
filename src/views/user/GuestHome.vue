<template>
  <div class="guest-home">
    <aside class="sidebar">
      <div class="sidebar-title">游客浏览</div>
      <el-menu :default-active="activeMenu" class="menu" @select="handleSelect">
        <el-menu-item index="enMap">
          <el-icon><Location /></el-icon>
          <span>企业地图</span>
        </el-menu-item>
        <el-menu-item index="enList">
          <el-icon><Document /></el-icon>
          <span>企业列表</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <main class="content">
      <div class="content-header">
        <div class="header-left">
          <div class="content-avatar">
            <el-icon :size="22"><View /></el-icon>
          </div>
          <span class="header-welcome">欢迎 游客 用户</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" plain size="default" @click="goLogin">返回登录</el-button>
        </div>
      </div>

      <section v-if="activeMenu === 'enMap'" class="panel panel-map">
        <UserMap @guest-reserve="showGuestTip" />
      </section>

      <section v-else-if="activeMenu === 'enList'" class="panel">
        <GuestEnterpriseList @guest-reserve="showGuestTip" />
      </section>
    </main>

    <!-- 游客提示弹窗 -->
    <el-dialog v-model="tipDialogVisible" title="提示" width="420px" :close-on-click-modal="false">
      <div class="tip-content">
        <el-icon class="tip-icon" :size="48" color="#f59e0b"><WarningFilled /></el-icon>
        <p class="tip-text">您当前是游客身份，无法进行预约操作</p>
        <p class="tip-sub">请登录普通用户账号后再进行预约</p>
      </div>
      <template #footer>
        <el-button @click="tipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="openLoginDialog">登录</el-button>
      </template>
    </el-dialog>

    <!-- 游客登录弹窗 -->
    <el-dialog v-model="loginDialogVisible" title="用户登录" width="420px" :close-on-click-modal="false">
      <el-form :model="loginForm" label-width="80px" @submit.prevent="handleGuestLogin">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="loginDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loginLoading" @click="handleGuestLogin">登录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Document, Location, WarningFilled, View } from "@element-plus/icons-vue";
import { useAuthStore } from "../../stores/useAuthStore";
import request from "../../utils/request";
import UserMap from "./UserMap.vue";
import GuestEnterpriseList from "./GuestEnterpriseList.vue";

const router = useRouter();
const authStore = useAuthStore();
const activeMenu = ref("enMap");

const tipDialogVisible = ref(false);
const loginDialogVisible = ref(false);
const loginLoading = ref(false);
const loginForm = reactive({
  username: "",
  password: "",
});

const pageTitle = computed(() => {
  switch (activeMenu.value) {
    case "enMap": return "企业地图";
    case "enList": return "企业列表";
    default: return "游客浏览";
  }
});

const pageSubtitle = computed(() => {
  switch (activeMenu.value) {
    case "enMap": return "在地图上查看企业位置和信息。";
    case "enList": return "浏览和搜索企业信息，按距离排序。";
    default: return "浏览企业信息。";
  }
});

const handleSelect = (key: string) => {
  activeMenu.value = key;
};

const goLogin = () => {
  authStore.clearAuthData();
  router.push("/");
};

const showGuestTip = () => {
  tipDialogVisible.value = true;
};

const openLoginDialog = () => {
  tipDialogVisible.value = false;
  loginForm.username = "";
  loginForm.password = "";
  loginDialogVisible.value = true;
};

const handleGuestLogin = async () => {
  if (!loginForm.username.trim() || !loginForm.password.trim()) {
    ElMessage.warning("请输入用户名和密码");
    return;
  }

  loginLoading.value = true;
  try {
    const res = await request.post("/login", {
      userType: "user3",
      username: loginForm.username,
      password: loginForm.password,
    });

    if (res.data.success) {
      authStore.setAuthData(res.data.token, res.data.username, res.data.ID);
      ElMessage.success("登录成功");
      loginDialogVisible.value = false;
      router.push("/user");
    } else {
      ElMessage.error(res.data.message || "用户名或密码错误");
    }
  } catch {
    ElMessage.error("请求失败，请检查后端服务是否启动");
  } finally {
    loginLoading.value = false;
  }
};
</script>

<style scoped>
.guest-home {
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

.panel-map {
  padding: 0;
  overflow: hidden;
}

.tip-content {
  text-align: center;
  padding: 16px 0;
}

.tip-icon {
  margin-bottom: 16px;
}

.tip-text {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.tip-sub {
  margin: 0;
  font-size: 14px;
  color: #7a8b9a;
}
</style>
