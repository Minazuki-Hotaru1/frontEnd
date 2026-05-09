<template>
  <div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="filter-btns">
        <button
          v-for="type in enterpriseTypeOptions"
          :key="type.value"
          type="button"
          class="type-filter-btn"
          :class="[type.className, { active: selectedType === type.value }]"
          @click="selectedType = type.value"
        >
          <span class="type-dot"></span>
          <span>{{ type.label }}</span>
          <span class="type-count">{{ getTypeCount(type.value) }}</span>
        </button>
      </div>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="filteredList"
      border
      style="width: 100%"
      empty-text="暂无企业数据"
    >
      <el-table-column prop="enterpriseName" label="企业名称" min-width="140" />
      <el-table-column prop="typeName" label="企业类型" min-width="100" align="center">
        <template #default="{ row }">
          <span class="type-label" :class="getTypeClass(row.typeName)">{{ row.typeName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="addressName" label="地址" min-width="150" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.addressName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="距离" min-width="90" align="center">
        <template #default>
          <span class="login-hint">登录后查看</span>
        </template>
      </el-table-column>
      <el-table-column label="在线情况" min-width="150" align="center">
        <template #default="{ row }">
          <div class="status-cell">
            <span class="status-num">{{ row.onlineCount }}/{{ row.onlineCapacity }}</span>
            <div class="status-bar">
              <span
                class="status-fill online-fill"
                :style="{ width: getPercent(row.onlineCount, row.onlineCapacity) + '%' }"
              ></span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="预约情况" min-width="150" align="center">
        <template #default="{ row }">
          <div class="status-cell">
            <span class="status-num">{{ row.reservedCount }}/{{ row.reservationCapacity }}</span>
            <div class="status-bar">
              <span
                class="status-fill reservation-fill"
                :style="{ width: getPercent(row.reservedCount, row.reservationCapacity) + '%' }"
              ></span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="100" align="center">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            :disabled="isReservationFull(row)"
            @click="emit('guest-reserve')"
          >
            {{ isReservationFull(row) ? '已满' : '预约' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import request from "../../utils/request";

interface EnterpriseItem {
  enId: string;
  enterpriseName: string;
  typeName: string;
  addressName: string;
  onlineCount: number;
  onlineCapacity: number;
  reservedCount: number;
  reservationCapacity: number;
}

const TYPE_HOSPITAL = "医院";
const TYPE_PARKING = "停车场";
const TYPE_PARK = "公园景点";
const TYPE_CHARGING = "新能源充电桩停车场";
const TYPE_OTHER = "其他";

const enterpriseTypeOptions = [
  { label: "全部企业", value: "all", className: "type-all" },
  { label: TYPE_HOSPITAL, value: TYPE_HOSPITAL, className: "type-hospital" },
  { label: TYPE_PARKING, value: TYPE_PARKING, className: "type-parking" },
  { label: TYPE_PARK, value: TYPE_PARK, className: "type-park" },
  { label: TYPE_CHARGING, value: TYPE_CHARGING, className: "type-charging" },
  { label: TYPE_OTHER, value: TYPE_OTHER, className: "type-other" },
];

const emit = defineEmits<{
  (e: "guest-reserve"): void;
}>();

const loading = ref(true);
const enList = ref<EnterpriseItem[]>([]);
const selectedType = ref("all");

const getTypeCount = (type: string) => {
  if (type === "all") return enList.value.length;
  return enList.value.filter((e) => e.typeName === type).length;
};

const filteredList = computed(() => {
  if (selectedType.value === "all") return enList.value;
  return enList.value.filter((e) => e.typeName === selectedType.value);
});

const toNum = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const getPercent = (count: unknown, capacity: unknown) => {
  const c = toNum(count);
  const cap = toNum(capacity);
  if (cap <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((c / cap) * 100)));
};

const isReservationFull = (row: EnterpriseItem) =>
  row.reservationCapacity > 0 && row.reservedCount >= row.reservationCapacity;

const getTypeClass = (typeName: string) => {
  const map: Record<string, string> = {
    [TYPE_HOSPITAL]: "type-hospital",
    [TYPE_PARKING]: "type-parking",
    [TYPE_PARK]: "type-park",
    [TYPE_CHARGING]: "type-charging",
    [TYPE_OTHER]: "type-other",
  };
  return map[typeName] || "type-other";
};

const fetchData = async () => {
  try {
    const res = await request.get("/guestGetAllEn");
    const rawList = res.data ?? [];
    enList.value = rawList.map((item: any) => ({
      enId: item.enId || item.enterpriseID || "",
      enterpriseName: item.enterpriseName || "未知企业",
      typeName: item.typeName || TYPE_OTHER,
      addressName: item.addressName || "",
      onlineCount: toNum(item.onlineCount),
      onlineCapacity: toNum(item.onlineCapacity),
      reservedCount: toNum(item.reservedCount),
      reservationCapacity: toNum(item.reservationCapacity),
    }));
  } catch {
    ElMessage.error("加载企业列表失败");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void fetchData();
});
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid #d8dee9;
  border-radius: 7px;
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.type-filter-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.type-filter-btn.active {
  border-color: currentColor;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
}

.type-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: currentColor;
}

.type-count {
  font-size: 11px;
  color: #94a3b8;
}

.type-all { color: #475569; }
.type-hospital { color: #dc2626; }
.type-parking { color: #2563eb; }
.type-park { color: #16a34a; }
.type-charging { color: #0891b2; }
.type-other { color: #7c3aed; }

.type-label {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.type-label.type-hospital { color: #dc2626; background: #fef2f2; }
.type-label.type-parking { color: #2563eb; background: #eff6ff; }
.type-label.type-park { color: #16a34a; background: #f0fdf4; }
.type-label.type-charging { color: #0891b2; background: #ecfeff; }
.type-label.type-other { color: #7c3aed; background: #f5f3ff; }

.login-hint {
  color: #9ca3af;
  font-size: 12px;
  font-style: italic;
}

.status-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.status-num {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.status-bar {
  width: 100%;
  max-width: 100px;
  height: 6px;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
}

.status-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  transition: width 0.3s ease;
}

.online-fill { background: #2563eb; }
.reservation-fill { background: #16a34a; }
</style>
