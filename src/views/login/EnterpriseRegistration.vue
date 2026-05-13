<template>
  <div class="reg-page">
    <div class="reg-bg"></div>

    <div class="reg-card">
      <div class="card-header">
        <div class="logo-icon">
          <el-icon :size="28"><OfficeBuilding /></el-icon>
        </div>
        <h2>注册企业账号</h2>
        <p>提交申请后需等待管理员审核</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        label-width="100px"
        class="reg-form"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="企业类型">
          <el-select v-model="form.region" placeholder="请选择企业类型" style="width: 100%">
            <el-option label="医院" value="101" />
            <el-option label="停车场" value="102" />
            <el-option label="公园景点" value="103" />
            <el-option label="充电桩停车场" value="104" />
            <el-option label="其他" value="105" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="企业名称">
          <el-input v-model="form.roles" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="企业地址">
          <el-input v-model="form.address" type="textarea" :rows="3" placeholder="请输入企业具体地址" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit-btn" native-type="submit" :loading="loading" round>
            提交注册
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { OfficeBuilding } from "@element-plus/icons-vue";
import request from "../../utils/request";

const loading = ref(false);

const form = reactive({
  region: "",
  username: "",
  password: "",
  roles: "",
  address: "",
});

const handleSubmit = async () => {
  if (!form.region) { ElMessage.error("请选择企业类型"); return; }
  if (!form.username.trim()) { ElMessage.error("请输入用户名"); return; }
  if (!form.password.trim()) { ElMessage.error("请输入密码"); return; }
  if (!form.roles.trim()) { ElMessage.error("请输入企业名称"); return; }
  if (!form.address.trim()) { ElMessage.error("请输入企业地址"); return; }

  loading.value = true;
  try {
    const res = await request.post("/EnRegistration", {
      typeID: form.region,
      username: form.username,
      password: form.password,
      roles: form.roles,
      address: form.address,
    });
    if (res.data.success) {
      ElMessage.success(res.data.message);
    } else {
      ElMessage.error(res.data.message);
    }
  } catch {
    ElMessage.error("请求失败，请检查后端服务");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.reg-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.reg-bg {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #96C2DB 0%, #7BAEC8 40%, #E5EDF1 100%);
}

.reg-card {
  position: relative;
  z-index: 1;
  width: 480px;
  padding: 40px 36px 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 25px 60px rgba(44, 62, 80, 0.15);
}

.card-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, #96C2DB, #7BAEC8);
  color: #FFFFFF;
  box-shadow: 0 10px 24px rgba(150, 194, 219, 0.35);
}

.card-header h2 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 800;
  color: #2c3e50;
}

.card-header p {
  margin: 0;
  font-size: 13px;
  color: #7a8b9a;
}

.reg-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #96C2DB, #7BAEC8);
  border: none;
  box-shadow: 0 8px 20px rgba(150, 194, 219, 0.35);
}

.submit-btn:hover {
  background: linear-gradient(135deg, #7BAEC8, #6BA5C7);
  box-shadow: 0 12px 28px rgba(150, 194, 219, 0.45);
  transform: translateY(-1px);
}
</style>
