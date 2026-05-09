<template>
  <div>
    <el-descriptions v-loading="loading" :column="1" border title="个人信息">
      <el-descriptions-item label="用户名">{{ profile.username || '-' }}</el-descriptions-item>
      <el-descriptions-item label="当前地址">{{ profile.address || '-' }}</el-descriptions-item>
      <el-descriptions-item label="纬度">{{ profile.latitude || '-' }}</el-descriptions-item>
      <el-descriptions-item label="经度">{{ profile.longitude || '-' }}</el-descriptions-item>
    </el-descriptions>

    <div class="edit-section">
      <el-button type="primary" @click="dialogVisible = true">修改地址</el-button>
      <el-button type="warning" @click="pwdDialogVisible = true">修改密码</el-button>
    </div>

    <el-dialog v-model="dialogVisible" title="修改地址" width="480px" :close-on-click-modal="false">
      <el-form :model="form" label-width="80px">
        <el-form-item label="新地址">
          <el-input
            v-model="form.address"
            type="textarea"
            :rows="3"
            placeholder="请输入新的具体地址"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="pwdDialogVisible" title="修改密码" width="420px" :close-on-click-modal="false">
      <el-form :model="pwdForm" label-width="100px">
        <el-form-item label="原密码">
          <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input v-model="pwdForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="pwdSaving" @click="handlePwdSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useAuthStore } from "../../stores/useAuthStore";
import request from "../../utils/request";

const authStore = useAuthStore();
const loading = ref(true);
const saving = ref(false);
const dialogVisible = ref(false);

const profile = reactive({
  username: "",
  address: "",
  latitude: "",
  longitude: "",
});

const form = reactive({
  address: "",
});

const pwdDialogVisible = ref(false);
const pwdSaving = ref(false);
const pwdForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const fetchProfile = async () => {
  try {
    const res = await request.get("/getUserProfile", {
      params: { userId: authStore.id },
    });
    if (res.data?.success !== false) {
      profile.username = res.data.username || "";
      profile.address = res.data.address || "";
      profile.latitude = res.data.latitude || "";
      profile.longitude = res.data.longitude || "";
    }
  } catch {
    ElMessage.error("获取个人信息失败");
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  if (!form.address.trim()) {
    ElMessage.warning("请输入新地址");
    return;
  }

  saving.value = true;
  try {
    const res = await request.put("/updateUserAddress", {
      userId: authStore.id,
      address: form.address.trim(),
    });

    if (res.data?.success) {
      profile.address = form.address.trim();
      profile.latitude = res.data.latitude || "";
      profile.longitude = res.data.longitude || "";
      ElMessage.success("地址更新成功");
      dialogVisible.value = false;
    } else {
      ElMessage.error(res.data?.message || "更新失败");
    }
  } catch {
    ElMessage.error("地址更新请求失败");
  } finally {
    saving.value = false;
  }
};

const handlePwdSave = async () => {
  if (!pwdForm.oldPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
    ElMessage.warning("请填写完整密码信息");
    return;
  }
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    ElMessage.warning("两次输入的新密码不一致");
    return;
  }

  pwdSaving.value = true;
  try {
    const res = await request.put("/updateUserPassword", {
      userId: authStore.id,
      oldPassword: pwdForm.oldPassword,
      newPassword: pwdForm.newPassword,
    });

    if (res.data?.success) {
      ElMessage.success("密码修改成功");
      pwdDialogVisible.value = false;
      pwdForm.oldPassword = "";
      pwdForm.newPassword = "";
      pwdForm.confirmPassword = "";
    } else {
      ElMessage.error(res.data?.message || "修改失败");
    }
  } catch {
    ElMessage.error("密码修改请求失败");
  } finally {
    pwdSaving.value = false;
  }
};

onMounted(() => {
  void fetchProfile();
});
</script>

<style scoped>
.edit-section {
  margin-top: 20px;
}
</style>
