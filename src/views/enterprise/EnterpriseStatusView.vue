<template>
  <div>
    <!-- 状态卡片 -->
    <el-row
      v-loading="loading"
      :gutter="20"
    >
      <el-col :span="8">
        <el-card
          shadow="hover"
          class="status-card"
        >
          <template #header>
            <div class="card-header">
              <el-icon
                :size="20"
                color="#96C2DB"
                ><Calendar
              /></el-icon>
              <span>预约人数</span>
            </div>
          </template>
          <div class="card-value">
            {{ status.reservedCount }}
            <span class="card-unit">/ {{ status.reservationCapacity }}</span>
          </div>
          <el-progress
            :percentage="
              getPercent(status.reservedCount, status.reservationCapacity)
            "
            :stroke-width="10"
            :color="'#96C2DB'"
          />
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card
          shadow="hover"
          class="status-card"
        >
          <template #header>
            <div class="card-header">
              <el-icon
                :size="20"
                color="#67c23a"
                ><User
              /></el-icon>
              <span>在线人数</span>
            </div>
          </template>
          <div class="card-value">
            {{ status.onlineCount }}
            <span class="card-unit">/ {{ status.onlineCapacity }}</span>
          </div>
          <el-progress
            :percentage="getPercent(status.onlineCount, status.onlineCapacity)"
            :stroke-width="10"
            :color="'#67c23a'"
          />
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card
          shadow="hover"
          class="status-card"
        >
          <template #header>
            <div class="card-header">
              <el-icon
                :size="20"
                color="#e6a23c"
                ><Document
              /></el-icon>
              <span>预约总数</span>
            </div>
          </template>
          <div class="card-value">{{ appCount }}</div>
          <div class="card-sub">历史累计预约</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作按钮 -->
    <div class="action-btns">
      <el-button
        type="primary"
        @click="openCapacityDialog"
      >
        <el-icon><Edit /></el-icon>
        修改可容纳人数
      </el-button>
      <el-button
        type="success"
        @click="openOnlineDialog"
      >
        <el-icon><Edit /></el-icon>
        修改在线人数
      </el-button>
    </div>

    <!-- 修改可容纳人数弹窗 -->
    <el-dialog
      v-model="capacityDialogVisible"
      title="修改可容纳人数"
      width="480px"
    >
      <el-form label-width="140px">
        <el-form-item label="可容纳在线总人数">
          <el-input
            v-model="capacityForm.onlineCapacityStr"
            :placeholder="'当前: ' + status.onlineCapacity"
          />
        </el-form-item>
        <el-form-item label="可预约总人数">
          <el-input
            v-model="capacityForm.reservationCapacityStr"
            :placeholder="'当前: ' + status.reservationCapacity"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="capacityDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="capacitySaving"
          @click="saveCapacity"
          >保存</el-button
        >
      </template>
    </el-dialog>

    <!-- 修改在线人数弹窗 -->
    <el-dialog
      v-model="onlineDialogVisible"
      title="修改在线人数"
      width="420px"
    >
      <el-form label-width="100px">
        <el-form-item label="设置在线人数">
          <el-input
            v-model="onlineForm.countStr"
            :placeholder="'当前在线: ' + status.onlineCount"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="onlineDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="onlineSaving"
          @click="saveOnlineCount"
          >保存</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { Calendar, Document, Edit, User } from "@element-plus/icons-vue";
import { useAuthStore } from "../../stores/useAuthStore";
import request from "../../utils/request";

const authStore = useAuthStore();
const loading = ref(true);
const onlineSaving = ref(false);
const capacitySaving = ref(false);
const appCount = ref(0);
const capacityDialogVisible = ref(false);
const onlineDialogVisible = ref(false);

const status = reactive({
  reservedCount: "0",
  reservationCapacity: "0",
  onlineCount: "0",
  onlineCapacity: "0",
});

const onlineForm = reactive({ countStr: "" });
const capacityForm = reactive({
  onlineCapacityStr: "",
  reservationCapacityStr: "",
});

const toNum = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const getPercent = (count: unknown, capacity: unknown) => {
  const c = toNum(count);
  const cap = toNum(capacity);
  if (cap <= 0) return 0;
  return Math.min(100, Math.round((c / cap) * 100));
};

const fetchStatus = async () => {
  loading.value = true;
  try {
    const [statusRes, countRes] = await Promise.all([
      request.get("/getEnStatus", { params: { id: authStore.id } }),
      request.get("/getAppCount", { params: { enId: authStore.id } }),
    ]);

    const s = statusRes.data;
    if (s?.success !== false) {
      status.reservedCount = s.reservedCount ?? "0";
      status.reservationCapacity = s.reservationCapacity ?? "0";
      status.onlineCount = s.onlineCount ?? "0";
      status.onlineCapacity = s.onlineCapacity ?? "0";
    }

    appCount.value = toNum(countRes.data?.count ?? 0);
  } catch {
    ElMessage.error("获取企业状态失败");
  } finally {
    loading.value = false;
  }
};

const openCapacityDialog = () => {
  capacityForm.onlineCapacityStr = "";
  capacityForm.reservationCapacityStr = "";
  capacityDialogVisible.value = true;
};

const openOnlineDialog = () => {
  onlineForm.countStr = "";
  onlineDialogVisible.value = true;
};

const saveOnlineCount = async () => {
  const val = onlineForm.countStr.trim();
  if (!val || isNaN(Number(val))) {
    ElMessage.warning("请输入有效的在线人数");
    return;
  }

  onlineSaving.value = true;
  try {
    const res = await request.put("/putOnlineCount", null, {
      params: { enId: authStore.id, count: Number(val) },
    });
    if (res.data?.success) {
      ElMessage.success("在线人数更新成功");
      status.onlineCount = val;
      onlineDialogVisible.value = false;
    } else {
      ElMessage.error(res.data?.message || "更新失败");
    }
  } catch {
    ElMessage.error("请求失败");
  } finally {
    onlineSaving.value = false;
  }
};

const saveCapacity = async () => {
  const onlineVal = capacityForm.onlineCapacityStr.trim();
  const resvVal = capacityForm.reservationCapacityStr.trim();

  if (!onlineVal && !resvVal) {
    ElMessage.warning("至少填写一项");
    return;
  }

  capacitySaving.value = true;
  try {
    const res = await request.put("/putOnlineAndReservationCapacity", {
      enId: authStore.id,
      onlineCapacity: onlineVal
        ? Number(onlineVal)
        : Number(status.onlineCapacity),
      reservationCapacity: resvVal
        ? Number(resvVal)
        : Number(status.reservationCapacity),
    });
    if (res.data?.success) {
      ElMessage.success("容量更新成功");
      if (onlineVal) status.onlineCapacity = onlineVal;
      if (resvVal) status.reservationCapacity = resvVal;
      capacityDialogVisible.value = false;
    } else {
      ElMessage.error(res.data?.message || "更新失败");
    }
  } catch {
    ElMessage.error("请求失败");
  } finally {
    capacitySaving.value = false;
  }
};

onMounted(() => {
  void fetchStatus();
});
</script>

<style scoped>
.status-card {
  text-align: center;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #2c3e50;
}

.card-value {
  font-size: 36px;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 12px;
}

.card-unit {
  font-size: 18px;
  font-weight: 500;
  color: #7a8b9a;
}

.card-sub {
  font-size: 13px;
  color: #7a8b9a;
  margin-top: 4px;
}

.action-btns {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 28px;
}
</style>
