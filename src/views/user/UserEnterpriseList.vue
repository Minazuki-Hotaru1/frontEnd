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

      <div class="sort-wrap">
        <el-select v-model="sortBy" style="width: 140px" size="default">
          <el-option label="默认排序" value="default" />
          <el-option label="距离最近" value="distance" />
        </el-select>
      </div>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="displayList"
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
      <el-table-column prop="addressName" label="地址" min-width="150" show-overflow-tooltip />
      <el-table-column prop="distance" label="距离" min-width="90" align="center" sortable>
        <template #default="{ row }">
          <span v-if="row.distance >= 0">{{ row.distance.toFixed(1) }} km</span>
          <span v-else class="text-muted">--</span>
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
            @click="handleReserve(row)"
          >
            {{ isReservationFull(row) ? '已满' : '预约' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 推荐弹窗 -->
    <el-dialog
      v-model="recommendDialogVisible"
      title="预约推荐"
      width="720px"
    >
      <div class="recommend-message">{{ recommendMessage }}</div>

      <div class="recommend-list">
        <div
          v-for="item in recommendList"
          :key="item.enterpriseId"
          class="recommend-card"
          :class="{ active: selectedRecommendId === item.enterpriseId }"
          @click="selectedRecommendId = item.enterpriseId"
        >
          <div class="recommend-main">
            <div class="recommend-title">{{ item.enterpriseName || '未命名企业' }}</div>
            <div class="recommend-meta">企业ID：{{ item.enterpriseId }}</div>
            <div class="recommend-stats">
              <span>驾车时间：{{ formatDrivingTime(item.enTime) }}</span>
              <span>在线：{{ item.onlineCount }}/{{ item.onlineCapacity }}</span>
            </div>
          </div>
          <el-button type="primary" plain @click.stop="reserveRecommend(item)">
            预约
          </el-button>
        </div>
      </div>

      <template #footer>
        <el-button @click="recommendDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="continueCurrentReservation">
          继续预约当前企业
        </el-button>
      </template>
    </el-dialog>

    <!-- 预约表单弹窗 -->
    <el-dialog
      v-model="reservationDialogVisible"
      title="填写预约信息"
      width="520px"
    >
      <div v-if="reservationTarget" class="reservation-target">
        <div class="reservation-target-label">当前预约企业</div>
        <div class="reservation-target-name">{{ reservationTarget.enterpriseName }}</div>
        <div class="reservation-target-meta">企业ID：{{ reservationTarget.enterpriseId }}</div>
      </div>

      <el-form :model="reservationForm" label-width="96px">
        <el-form-item label="预约日期">
          <el-date-picker
            v-model="reservationForm.date"
            type="date"
            placeholder="请选择预约日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-time-picker
            v-model="reservationForm.startTime"
            placeholder="请选择开始时间"
            value-format="HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker
            v-model="reservationForm.endTime"
            placeholder="请选择结束时间"
            value-format="HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="reservationForm.remark"
            type="textarea"
            :rows="3"
            placeholder="可以填写预约说明，非必填"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="reservationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReservation">确认预约</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useAuthStore } from "../../stores/useAuthStore";
import request from "../../utils/request";

const emit = defineEmits<{
  (e: "guest-reserve"): void;
}>();

interface EnterpriseItem {
  enId: string;
  enterpriseName: string;
  typeName: string;
  latitude: number;
  longitude: number;
  addressName: string;
  onlineCount: number;
  onlineCapacity: number;
  reservedCount: number;
  reservationCapacity: number;
  distance: number;
}

interface RecommendItem {
  enterpriseId: string;
  enterpriseName: string;
  enTime?: string | number;
  onlineCount?: string | number;
  onlineCapacity?: string | number;
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

const enterpriseTypeCodeMap: Record<string, string> = {
  [TYPE_HOSPITAL]: "101",
  [TYPE_PARKING]: "102",
  [TYPE_PARK]: "103",
  [TYPE_CHARGING]: "104",
  [TYPE_OTHER]: "105",
};

const authStore = useAuthStore();
const loading = ref(true);
const enList = ref<EnterpriseItem[]>([]);
const selectedType = ref("all");
const sortBy = ref("default");

const recommendDialogVisible = ref(false);
const reservationDialogVisible = ref(false);
const recommendMessage = ref("");
const recommendList = ref<RecommendItem[]>([]);
const selectedRecommendId = ref("");
const currentReserveTarget = ref<{ enterpriseId: string; enterpriseName: string; enterpriseType: string } | null>(null);
const reservationTarget = ref<{ enterpriseId: string; enterpriseName: string } | null>(null);
const reservationForm = reactive({
  date: "",
  startTime: "",
  endTime: "",
  remark: "",
});

const getTypeCount = (type: string) => {
  if (type === "all") return enList.value.length;
  return enList.value.filter((e) => e.typeName === type).length;
};

const filteredList = computed(() => {
  if (selectedType.value === "all") return enList.value;
  return enList.value.filter((e) => e.typeName === selectedType.value);
});

const displayList = computed(() => {
  const list = [...filteredList.value];
  if (sortBy.value === "distance") {
    list.sort((a, b) => a.distance - b.distance);
  }
  return list;
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

// 哈弗辛公式计算距离
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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

const getTypeColor = (typeName: string) => {
  const map: Record<string, string> = {
    [TYPE_HOSPITAL]: "#dc2626",
    [TYPE_PARKING]: "#2563eb",
    [TYPE_PARK]: "#16a34a",
    [TYPE_CHARGING]: "#0891b2",
    [TYPE_OTHER]: "#7c3aed",
  };
  return map[typeName] || "#64748b";
};

const formatDrivingTime = (value: string | number | undefined) => {
  const seconds = toNum(value);
  if (seconds <= 0) return "暂无数据";
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} 分钟`;
};

// 加载数据
const fetchData = async () => {
  try {
    const [enRes, locRes] = await Promise.all([
      request.get("/userGetAllEn"),
      request.get("/getUserLocation", { params: { userId: authStore.id } }),
    ]);

    const rawList = enRes.data ?? [];
    const loc = locRes.data;
    const userLat = toNum(loc?.latitude);
    const userLon = toNum(loc?.longitude);

    enList.value = rawList.map((item: any) => ({
      enId: item.enId || item.enterpriseID || "",
      enterpriseName: item.enterpriseName || "未知企业",
      typeName: item.typeName || TYPE_OTHER,
      latitude: toNum(item.latitude),
      longitude: toNum(item.longitude),
      addressName: item.addressName || "",
      onlineCount: toNum(item.onlineCount),
      onlineCapacity: toNum(item.onlineCapacity),
      reservedCount: toNum(item.reservedCount),
      reservationCapacity: toNum(item.reservationCapacity),
      distance:
        userLat && userLon && toNum(item.latitude) && toNum(item.longitude)
          ? haversineDistance(userLat, userLon, toNum(item.latitude), toNum(item.longitude))
          : -1,
    }));
  } catch {
    ElMessage.error("加载企业列表失败");
  } finally {
    loading.value = false;
  }
};

// 预约流程
const handleReserve = (row: EnterpriseItem) => {
  if (authStore.isGuest) {
    emit("guest-reserve");
    return;
  }

  const typeCode = enterpriseTypeCodeMap[row.typeName] || enterpriseTypeCodeMap[TYPE_OTHER];
  currentReserveTarget.value = {
    enterpriseId: row.enId,
    enterpriseName: row.enterpriseName,
    enterpriseType: typeCode,
  };
  void checkReservation(row.enId, typeCode);
};

const checkReservation = async (enterpriseId: string, enterpriseType: string) => {
  try {
    const res = await request.post("/userReserveEnterprise", null, {
      params: { userId: authStore.id, enterpriseId, enterpriseType },
    });
    const data = res.data;

    if (data?.success === false) {
      ElMessage.error(data.message || "当前企业暂时不能预约");
      return;
    }

    if (data?.success === true && !data.message) {
      openReservationForm(currentReserveTarget.value);
      return;
    }

    if (data?.success === true && data.message) {
      recommendMessage.value = data.message;
      recommendList.value = data.enterpriseMap ?? [];
      selectedRecommendId.value = recommendList.value[0]?.enterpriseId || "";
      recommendDialogVisible.value = true;
      return;
    }

    ElMessage.warning("后端没有返回有效的预约判断结果");
  } catch {
    ElMessage.error("预约判断请求失败");
  }
};

const reserveRecommend = (item: RecommendItem) => {
  selectedRecommendId.value = item.enterpriseId;
  openReservationForm({
    enterpriseId: item.enterpriseId,
    enterpriseName: item.enterpriseName || "推荐企业",
    enterpriseType: currentReserveTarget.value?.enterpriseType || "105",
  });
  recommendDialogVisible.value = false;
};

const continueCurrentReservation = () => {
  if (!currentReserveTarget.value) return;
  openReservationForm(currentReserveTarget.value);
  recommendDialogVisible.value = false;
};

const openReservationForm = (target: { enterpriseId: string; enterpriseName: string } | null) => {
  if (!target) return;
  reservationTarget.value = target;
  reservationForm.date = "";
  reservationForm.startTime = "";
  reservationForm.endTime = "";
  reservationForm.remark = "";
  reservationDialogVisible.value = true;
};

const submitReservation = async () => {
  if (!reservationTarget.value) return;
  if (!reservationForm.date || !reservationForm.startTime || !reservationForm.endTime) {
    ElMessage.warning("请填写完整的预约日期和时间");
    return;
  }

  try {
    const res = await request.put("/userReserveEnterpriseSuccess", {
      userId: authStore.id,
      enterpriseId: reservationTarget.value.enterpriseId,
      date: reservationForm.date,
      startTime: reservationForm.startTime,
      endTime: reservationForm.endTime,
      remarks: reservationForm.remark || "",
    });

    if (res.data?.success) {
      ElMessage.success(res.data.message || "预约成功");
      reservationDialogVisible.value = false;
      await fetchData();
    } else {
      ElMessage.error(res.data?.message || "预约失败");
    }
  } catch {
    ElMessage.error("预约请求失败");
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

.text-muted { color: #94a3b8; }

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

.recommend-message {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
  color: #334155;
  font-size: 14px;
  line-height: 1.7;
}

.recommend-list {
  display: grid;
  gap: 12px;
}

.recommend-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.recommend-card:hover,
.recommend-card.active {
  border-color: #2563eb;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.12);
  transform: translateY(-1px);
}

.recommend-main { min-width: 0; }
.recommend-title { margin-bottom: 5px; color: #0f172a; font-size: 15px; font-weight: 800; }
.recommend-meta { margin-bottom: 8px; color: #64748b; font-size: 12px; }
.recommend-stats { display: flex; flex-wrap: wrap; gap: 8px; color: #475569; font-size: 13px; }
.recommend-stats span { padding: 4px 8px; border-radius: 999px; background: #f1f5f9; }

.reservation-target {
  margin-bottom: 18px;
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
  border: 1px solid #dbeafe;
}

.reservation-target-label { margin-bottom: 5px; color: #2563eb; font-size: 12px; font-weight: 800; }
.reservation-target-name { margin-bottom: 5px; color: #0f172a; font-size: 16px; font-weight: 800; }
.reservation-target-meta { color: #64748b; font-size: 12px; }
</style>
