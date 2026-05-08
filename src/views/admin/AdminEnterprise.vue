<template>
  <div class="admin-page">
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column
        prop="id"
        label="ID"
        min-width="80"
      />
      <el-table-column
        prop="username"
        label="账号"
        min-width="80"
      />
      <el-table-column
        prop="roles"
        label="企业名称"
        min-width="120"
      />
      <el-table-column
        prop="typeName"
        label="企业类型"
        min-width="120"
      />
      <el-table-column
        prop="enStatus"
        label="企业状态"
        min-width="60"
      >
        <template #default="scope">
          <el-button @click="getEnStatus(scope.row.id)"
            >点击查看企业状态</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="enStatusTable"
      title="企业状态"
      width="480"
      align-center
    >
      <div class="status-dashboard">
        <div class="status-card">
          <div class="status-card-icon reservation-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="status-card-body">
            <div class="status-card-label">预约状态</div>
            <div class="status-card-count">
              <strong>{{ enStatusMessage?.reservedCount ?? 0 }}</strong>
              <span class="status-card-sep">/</span>
              <span>{{ enStatusMessage?.reservationCapacity ?? 0 }}</span>
            </div>
            <div class="status-card-track">
              <span
                class="status-card-fill reservation-fill"
                :style="{ width: reservationPercent + '%' }"
              ></span>
            </div>
          </div>
        </div>

        <div class="status-card">
          <div class="status-card-icon online-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="status-card-body">
            <div class="status-card-label">在线人数</div>
            <div class="status-card-count">
              <strong>{{ enStatusMessage?.onlineCount ?? 0 }}</strong>
              <span class="status-card-sep">/</span>
              <span>{{ enStatusMessage?.onlineCapacity ?? 0 }}</span>
            </div>
            <div class="status-card-track">
              <span
                class="status-card-fill online-fill"
                :style="{ width: onlinePercent + '%' }"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

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
import { onMounted, ref, computed } from "vue";
import { ElMessage } from "element-plus";
import request from "../../utils/request";
import type { EnterpriseStatus } from "../../types/EnterpriseStatus";

interface Enterprise {
  id: number;
  username: string;
  typeName: string;
  roles: string;
}

const loading = ref(false);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const tableData = ref<Enterprise[]>([]);
const enStatusTable = ref(false);
const enStatusMessage = ref<EnterpriseStatus>();

const toNum = (value: string | number | undefined) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const reservationPercent = computed(() => {
  const count = toNum(enStatusMessage.value?.reservedCount);
  const cap = toNum(enStatusMessage.value?.reservationCapacity);
  return cap > 0 ? Math.min(100, Math.round((count / cap) * 100)) : 0;
});

const onlinePercent = computed(() => {
  const count = toNum(enStatusMessage.value?.onlineCount);
  const cap = toNum(enStatusMessage.value?.onlineCapacity);
  return cap > 0 ? Math.min(100, Math.round((count / cap) * 100)) : 0;
});

const getTableData = async (page = currentPage.value) => {
  loading.value = true;

  try {
    const res = await request.get("/getEnterprise", {
      params: {
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

const getEnStatus = async (id: string) => {
  const res = await request.get("/getEnStatus", {
    params: {
      id: id,
    },
  });
  enStatusMessage.value = res.data;
  try {
    if (enStatusMessage.value?.success === false) {
      ElMessage.warning(enStatusMessage.value?.message);
      return;
    }
    enStatusTable.value = true;
  } catch {}
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  void getTableData(page);
};

onMounted(() => {
  void getTableData();
});
</script>

<style scoped>
.admin-page {
  padding: 24px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.status-dashboard {
  display: grid;
  gap: 16px;
  padding: 4px 0;
}

.status-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.status-card:hover {
  border-color: #c7d2fe;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.07);
}

.status-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  flex-shrink: 0;
}

.reservation-icon {
  background: #ecfdf5;
  color: #059669;
}

.online-icon {
  background: #eff6ff;
  color: #2563eb;
}

.status-card-body {
  flex: 1;
  min-width: 0;
}

.status-card-label {
  margin-bottom: 6px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}

.status-card-count {
  margin-bottom: 10px;
  color: #374151;
  font-size: 14px;
}

.status-card-count strong {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
}

.status-card-sep {
  margin: 0 4px;
  color: #9ca3af;
}

.status-card-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #f3f4f6;
  overflow: hidden;
}

.status-card-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  transition: width 0.5s ease;
}

.reservation-fill {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.online-fill {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}
</style>
