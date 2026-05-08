<template>
  <div class="appointment-page">
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column
        prop="id"
        label="ID"
        min-width="100"
      />
      <el-table-column
        prop="userId"
        label="用户ID"
        min-width="100"
      />
      <el-table-column
        prop="userName"
        label="用户名称"
        min-width="100"
      />
      <el-table-column
        prop="userAddress"
        label="用户地址"
        min-width="180"
      />
      <el-table-column
        prop="appStartTime"
        label="预约起始时间"
        min-width="160"
      />
      <el-table-column
        prop="appEndTime"
        label="预约结束时间"
        min-width="160"
      />
      <el-table-column
        label="预约状态"
        width="140"
        align="center"
      >
        <template #default="{ row }">
          <span
            class="status-tag"
            :class="statusClass(row.appStatus)"
          >
            <span class="status-dot"></span>
            {{ statusText(row.appStatus) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="备注"
        width="140"
        align="center"
      >
        <template #default="{ row }">
          <el-popover
            :disabled="!row.remarks"
            placement="top"
            :width="280"
            trigger="click"
          >
            <template #reference>
              <span
                class="remark-link"
                @click="handleRemarkClick(row)"
              >
                点击查看备注
              </span>
            </template>
            <div class="remark-popover">
              <div class="remark-popover-label">备注信息</div>
              <div class="remark-popover-text">{{ row.remarks }}</div>
            </div>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useAuthStore } from "../../stores/useAuthStore";
import request from "../../utils/request";

interface AppointmentRecord {
  id: string;
  userId: string;
  userName: string;
  userAddress: string;
  appStartTime: string;
  appEndTime: string;
  appStatus: string | null;
  remarks: string | null;
}

const authStore = useAuthStore();
const tableData = ref<AppointmentRecord[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const statusMap: Record<string, { text: string; class: string }> = {
  "1": { text: "预约未到达", class: "status-pending" },
  "2": { text: "预约已到达", class: "status-arrived" },
  "3": { text: "已超预约时间", class: "status-expired" },
};

const statusText = (status: string | null) => {
  return statusMap[status ?? ""]?.text ?? "未知状态";
};

const statusClass = (status: string | null) => {
  return statusMap[status ?? ""]?.class ?? "status-unknown";
};

const getAppointment = async (page = currentPage.value) => {
  loading.value = true;

  try {
    const res = await request.get("/getAllAppSorted", {
      params: {
        enId: authStore.id,
        page,
        number: pageSize.value,
      },
    });

    tableData.value = res.data.records ?? [];
    total.value = res.data.total ?? 0;
    currentPage.value = res.data.current ?? page;
  } catch {
    ElMessage.error("分页数据获取失败，请检查后端接口");
  } finally {
    loading.value = false;
  }
};

const handleRemarkClick = (row: AppointmentRecord) => {
  if (!row.remarks) {
    ElMessage.info("暂无备注信息");
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  void getAppointment(page);
};

onMounted(() => {
  void getAppointment();
});
</script>

<style scoped>
.appointment-page {
  padding: 4px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  user-select: none;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-arrived {
  background: #d1fae5;
  color: #059669;
}

.status-expired {
  background: #fee2e2;
  color: #dc2626;
}

.status-unknown {
  background: #f3f4f6;
  color: #6b7280;
}

.remark-link {
  color: #2563eb;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  user-select: none;
  transition: color 0.15s ease;
}

.remark-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.remark-popover {
  padding: 4px 0;
}

.remark-popover-label {
  margin-bottom: 8px;
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.remark-popover-text {
  color: #111827;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-all;
}
</style>
