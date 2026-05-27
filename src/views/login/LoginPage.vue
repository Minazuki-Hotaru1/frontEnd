<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>

    <div class="login-card">
      <div class="card-header">
        <div class="logo-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            width="36"
            height="36"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h2 class="card-title">城市服务预约平台</h2>
        <p class="card-subtitle">City Service Reservation Platform</p>
      </div>

      <el-form
        class="login-form"
        @submit.prevent="handleSubmit"
      >
        <el-form-item>
          <el-select
            v-model="form.region"
            placeholder="请选择登录角色"
            size="large"
            style="width: 100%"
          >
            <el-option
              label="管理员"
              value="user1"
            >
              <span class="role-option">管理员</span>
              <span class="role-desc">系统管理</span>
            </el-option>
            <el-option
              label="企业用户"
              value="user2"
            >
              <span class="role-option">企业用户</span>
              <span class="role-desc">服务提供方</span>
            </el-option>
            <el-option
              label="普通用户"
              value="user3"
            >
              <span class="role-option">普通用户</span>
              <span class="role-desc">服务使用者</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            native-type="submit"
            :loading="loginLoading"
            round
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-links">
        <el-button
          link
          type="primary"
          @click="dialogFormVisible = true"
        >
          注册普通用户
        </el-button>
        <el-divider direction="vertical" />
        <el-button
          link
          type="primary"
          @click="goToEnRegistration"
        >
          注册企业用户
        </el-button>
        <el-divider direction="vertical" />
        <el-button
          link
          type="primary"
          @click="gotoGuest"
        >
          游客登录
        </el-button>
      </div>
    </div>

    <!-- 普通用户注册弹窗 -->
    <el-dialog
      v-model="dialogFormVisible"
      title="注册普通用户"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="form"
        label-width="80px"
      >
        <el-form-item label="用户名">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input
            v-model="form.address"
            placeholder="请输入真实的具体住址"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogFormVisible = false">关闭</el-button>
        <el-button
          type="primary"
          @click="userRegister"
          :loading="regLoading"
          >确认注册</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/useAuthStore";
import request from "../../utils/request";

const username = ref("");
const password = ref("");
const loginLoading = ref(false);
const regLoading = ref(false);
const router = useRouter();
const authStore = useAuthStore();
const dialogFormVisible = ref(false);

const form = reactive({
  region: "",
  username: "",
  password: "",
  address: "",
});

const goToEnRegistration = () => {
  window.open("/EnRegistration");
};

const gotoGuest = () => {
  authStore.setGuest();
  router.push("/guest");
};

const handleSubmit = async () => {
  if (username.value.trim() === "" || password.value.trim() === "") {
    ElMessage.error("请输入账号和密码");
    return;
  }
  if (form.region === "") {
    ElMessage.error("请选择登录角色");
    return;
  }

  loginLoading.value = true;
  try {
    const res = await request.post("/login", {
      userType: form.region,
      username: username.value,
      password: password.value,
    });

    if (res.data.success) {
      authStore.setAuthData(
        res.data.token,
        res.data.username,
        res.data.ID,
        res.data.displayName,
      );
      console.log(res.data.displayName + "------" + res.data.username);

      ElMessage.success("登录成功");
      switch (form.region) {
        case "user1":
          router.push("/admin");
          return;
        case "user2":
          router.push("/enterprise");
          return;
        case "user3":
          router.push("/user");
          return;
      }
    }

    ElMessage.error(res.data.message || "用户名或密码错误");
  } catch {
    ElMessage.error("请求失败，请检查后端服务是否启动");
  } finally {
    loginLoading.value = false;
  }
};

const userRegister = async () => {
  if (!form.username.trim()) {
    ElMessage.error("请输入用户名");
    return;
  }
  if (!form.password.trim()) {
    ElMessage.error("请输入密码");
    return;
  }
  if (!form.address.trim()) {
    ElMessage.error("请输入地址信息");
    return;
  }

  regLoading.value = true;
  try {
    const res = await request.post("/userRegister", {
      username: form.username,
      password: form.password,
      address: form.address,
    });

    if (res.data.success) {
      ElMessage.success(res.data.message);
      dialogFormVisible.value = false;
    } else {
      ElMessage.error(res.data.message);
    }
  } catch {
    ElMessage.error("注册失败，请检查后端接口");
  } finally {
    regLoading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.login-bg {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #96c2db 0%, #7baec8 40%, #e5edf1 100%);
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
  background: #ffffff;
}

.bg-circle-1 {
  width: 600px;
  height: 600px;
  top: -200px;
  right: -150px;
}

.bg-circle-2 {
  width: 400px;
  height: 400px;
  bottom: -100px;
  left: -100px;
}

.bg-circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 60%;
}

.login-card {
  position: relative;
  z-index: 1;
  width: 420px;
  padding: 48px 40px 36px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.15) inset;
}

.card-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  border-radius: 20px;
  background: linear-gradient(135deg, #96c2db, #7baec8);
  color: #ffffff;
  box-shadow: 0 12px 30px rgba(150, 194, 219, 0.35);
}

.card-title {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 800;
  color: #2c3e50;
  letter-spacing: -0.5px;
}

.card-subtitle {
  margin: 0;
  font-size: 13px;
  color: #7a8b9a;
  letter-spacing: 0.5px;
}

.login-form {
  margin-bottom: 8px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.login-btn {
  width: 100%;
  height: 46px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 4px;
  background: linear-gradient(135deg, #96c2db, #7baec8);
  border: none;
  box-shadow: 0 8px 24px rgba(150, 194, 219, 0.4);
}

.login-btn:hover {
  background: linear-gradient(135deg, #7baec8, #6ba5c7);
  box-shadow: 0 12px 30px rgba(150, 194, 219, 0.5);
  transform: translateY(-1px);
}

.login-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding-top: 8px;
}

.role-option {
  font-weight: 600;
}

.role-desc {
  margin-left: 8px;
  font-size: 12px;
  color: #94a3b8;
}
</style>
