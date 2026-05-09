<template>
  <div>
    <el-table
      v-loading="loading"
      :data="appointmentList"
      border
      style="width: 100%"
      empty-text="暂无预约记录"
    >
      <el-table-column prop="id" label="预约ID" min-width="80" />
      <el-table-column prop="enterpriseName" label="企业名称" min-width="120" />
      <el-table-column prop="startTime" label="开始时间" min-width="140" />
      <el-table-column prop="endTime" label="结束时间" min-width="140" />
      <el-table-column prop="appStatus" label="状态" min-width="120" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.appStatus === '1'" type="warning">已预约未到场</el-tag>
          <el-tag v-else-if="row.appStatus === '2'" type="success">已到场</el-tag>
          <el-tag v-else-if="row.appStatus === '3'" type="danger">预约未到场</el-tag>
          <el-tag v-else type="info">{{ row.appStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remarks" label="备注" min-width="140">
        <template #default="{ row }">
          <span>{{ row.remarks || '-' }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import request from "../../utils/request";
import { useAuthStore } from "../../stores/useAuthStore";

const authStore = useAuthStore();
const appointmentList = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await request.get("/getMyAppointments", {
      params: { userId: authStore.id }
    });
    appointmentList.value = res.data ?? [];
  } catch {
    ElMessage.error("获取预约记录失败");
  } finally {
    loading.value = false;
  }
});
</script>
