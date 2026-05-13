<template>
  <div class="user-map-page">
    <div class="map-toolbar">
      <button
        v-for="type in enterpriseTypeOptions"
        :key="type.value"
        type="button"
        class="type-filter-btn"
        :class="[type.className, { active: selectedEnterpriseType === type.value }]"
        @click="selectedEnterpriseType = type.value"
      >
        <span class="type-dot"></span>
        <span>{{ type.label }}</span>
      </button>
      <span class="filter-count">{{ filteredEnList.length }} / {{ enList.length }}</span>
    </div>

    <MapContainer>
      <el-amap-marker
        v-if="userLocation"
        :position="[Number(userLocation.longitude), Number(userLocation.latitude)]"
        anchor="bottom-center"
        :offset="[0, -10]"
        :top-when-click="true"
        :z-index="300"
        :content="buildUserLocationCard(userLocation)"
      />

      <el-amap-marker
        v-for="item in filteredEnList"
        :key="item.id"
        :position="[Number(item.longitude), Number(item.latitude)]"
        anchor="bottom-center"
        :offset="[0, -10]"
        :top-when-click="true"
        :z-index="activeEnterpriseId === item.id ? 200 : 12"
        :re-event-when-update="true"
        :content="buildEnterpriseCard(item)"
        @click="activeEnterpriseId = item.id"
      />
    </MapContainer>

    <el-dialog
      v-model="recommendDialogVisible"
      title="预约推荐"
      width="720px"
      class="reservation-dialog"
    >
      <div class="recommend-message">{{ recommendMessage }}</div>

      <div class="recommend-list">
        <div
          v-for="item in recommendList"
          :key="item.enterpriseId"
          class="recommend-card"
          :class="{ active: selectedRecommendEnterpriseId === item.enterpriseId }"
        >
          <div class="recommend-main">
            <div class="recommend-title">{{ item.enterpriseName || "未命名企业" }}</div>
            <div class="recommend-meta">企业ID：{{ item.enterpriseId }}</div>
            <div class="recommend-stats">
              <span>驾车时间：{{ formatDrivingTime(item.enTime) }}</span>
              <span>
                在线情况：{{ item.onlineCount }}/{{ item.onlineCapacity }}
                {{ formatCrowdText(item.onlineCount, item.onlineCapacity) }}
              </span>
            </div>
          </div>
          <el-button
            type="primary"
            plain
            @click="openReservationFormFromRecommend(item)"
          >
            预约
          </el-button>
        </div>
      </div>

      <template #footer>
        <el-button @click="closeRecommendDialog">取消</el-button>
        <el-button type="primary" @click="continueCurrentEnterpriseReservation">
          继续预约当前选择的企业
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="reservationDialogVisible"
      title="填写预约信息"
      width="520px"
      class="reservation-dialog"
    >
      <div v-if="reservationTarget" class="reservation-target">
        <div class="reservation-target-label">当前预约企业</div>
        <div class="reservation-target-name">{{ reservationTarget.enterpriseName }}</div>
        <div class="reservation-target-meta">企业ID：{{ reservationTarget.enterpriseId }}</div>
      </div>

      <el-form :model="reservationForm" label-width="96px" class="reservation-form">
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
        <el-button type="primary" @click="submitReservationForm">确认预约</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useAuthStore } from "../../stores/useAuthStore";
import request from "../../utils/request";
import MapContainer from "../login/MapContainer.vue";

const emit = defineEmits<{
  (e: "guest-reserve"): void;
}>();

interface EnterpriseMapItem {
  id: string;
  enId?: string;
  enterpriseName: string;
  latitude: string | number;
  longitude: string | number;
  onlineCapacity?: string | number;
  onlineCount?: string | number;
  reservationCapacity?: string | number;
  reservedCount?: string | number;
  typeName?: string;
}

interface ReserveCheckResponse {
  success?: boolean;
  message?: string;
  enterpriseMap?: RecommendEnterpriseItem[];
}

interface RecommendEnterpriseItem {
  enterpriseId: string;
  enterpriseName: string;
  enTime?: string | number;
  onlineCount?: string | number;
  onlineCapacity?: string | number;
}

interface ReservationTarget {
  enterpriseId: string;
  enterpriseName: string;
  enterpriseType: string;
}

const TYPE_HOSPITAL = "\u533b\u9662";
const TYPE_PARKING = "\u505c\u8f66\u573a";
const TYPE_PARK = "\u516c\u56ed\u666f\u70b9";
const TYPE_CHARGING = "\u65b0\u80fd\u6e90\u5145\u7535\u6869\u505c\u8f66\u573a";
const TYPE_OTHER = "\u5176\u4ed6";

interface UserLocation {
  latitude: string | number;
  longitude: string | number;
  address: string;
}

const authStore = useAuthStore();
const userLocation = ref<UserLocation | null>(null);
const enList = ref<EnterpriseMapItem[]>([]);
const activeEnterpriseId = ref("");
const selectedEnterpriseType = ref("all");
const recommendDialogVisible = ref(false);
const reservationDialogVisible = ref(false);
const recommendMessage = ref("");
const recommendList = ref<RecommendEnterpriseItem[]>([]);
const selectedRecommendEnterpriseId = ref("");
const currentReserveTarget = ref<ReservationTarget | null>(null);
const reservationTarget = ref<ReservationTarget | null>(null);
const reservationForm = reactive({
  date: "",
  startTime: "",
  endTime: "",
  remark: "",
});

const enterpriseTypeOptions = [
  { label: "\u5168\u90e8\u4f01\u4e1a", value: "all", className: "type-all" },
  { label: TYPE_HOSPITAL, value: TYPE_HOSPITAL, className: "type-hospital" },
  { label: TYPE_PARKING, value: TYPE_PARKING, className: "type-parking" },
  { label: TYPE_PARK, value: TYPE_PARK, className: "type-park" },
  { label: TYPE_CHARGING, value: TYPE_CHARGING, className: "type-charging" },
  { label: TYPE_OTHER, value: TYPE_OTHER, className: "type-other" },
];

const enterpriseTypeClassMap: Record<string, string> = {
  [TYPE_HOSPITAL]: "hospital",
  [TYPE_PARKING]: "parking",
  [TYPE_PARK]: "park",
  [TYPE_CHARGING]: "charging",
  [TYPE_OTHER]: "other",
};

const enterpriseTypeCodeMap: Record<string, string> = {
  [TYPE_HOSPITAL]: "101",
  [TYPE_PARKING]: "102",
  [TYPE_PARK]: "103",
  [TYPE_CHARGING]: "104",
  [TYPE_OTHER]: "105",
};

const filteredEnList = computed(() => {
  const validPoints = enList.value.filter(
    (item) =>
      Number.isFinite(Number(item.longitude)) &&
      Number.isFinite(Number(item.latitude)),
  );

  if (selectedEnterpriseType.value === "all") {
    return validPoints;
  }

  return validPoints.filter((item) => item.typeName === selectedEnterpriseType.value);
});

const getUserLocation = async () => {
  const userId = authStore.id;
  if (!userId) {
    ElMessage.warning("请先登录后再查看位置");
    return;
  }

  try {
    const res = await request.get("/getUserLocation", {
      params: { userId },
    });
    const data = res.data;
    if (data && Number.isFinite(Number(data.latitude)) && Number.isFinite(Number(data.longitude))) {
      userLocation.value = {
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address || "未知地址",
      };
    } else {
      ElMessage.warning("未查询到您的地址信息");
    }
  } catch {
    ElMessage.error("获取用户位置失败，请检查后端接口");
  }
};

const getAllEnList = async () => {
  try {
    const res = await request.get("/userGetAllEn");
    enList.value = res.data ?? [];
  } catch {
    ElMessage.error("企业地图数据加载失败");
  }
};

const reserveEnterprise = async (enterpriseId: string, enterpriseTypeCode: string) => {
  if (authStore.isGuest) {
    emit("guest-reserve");
    return;
  }

  const userId = authStore.id;

  if (!userId) {
    ElMessage.warning("请先重新登录后再进行预约");
    return;
  }

  const enterprise = enList.value.find((item) => (item.enId || item.id) === enterpriseId);
  currentReserveTarget.value = {
    enterpriseId,
    enterpriseName: enterprise?.enterpriseName || "当前选择企业",
    enterpriseType: enterpriseTypeCode,
  };

  try {
    const res = await request.post<ReserveCheckResponse>("/userReserveEnterprise", null, {
      params: {
        userId,
        enterpriseId,
        enterpriseType: enterpriseTypeCode,
      },
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
      openRecommendDialog(data);
      return;
    }

    ElMessage.warning("后端没有返回有效的预约判断结果");
  } catch {
    ElMessage.error("预约判断请求失败");
  }
};

const openRecommendDialog = (data: ReserveCheckResponse) => {
  recommendMessage.value = data.message || "";
  recommendList.value = data.enterpriseMap ?? [];
  selectedRecommendEnterpriseId.value = recommendList.value[0]?.enterpriseId || "";
  recommendDialogVisible.value = true;
};

const closeRecommendDialog = () => {
  recommendDialogVisible.value = false;
  recommendList.value = [];
  selectedRecommendEnterpriseId.value = "";
};

const openReservationFormFromRecommend = (item: RecommendEnterpriseItem) => {
  selectedRecommendEnterpriseId.value = item.enterpriseId;
  openReservationForm({
    enterpriseId: item.enterpriseId,
    enterpriseName: item.enterpriseName || "推荐企业",
    enterpriseType: currentReserveTarget.value?.enterpriseType || enterpriseTypeCodeMap[TYPE_OTHER],
  });
  recommendDialogVisible.value = false;
};

const continueCurrentEnterpriseReservation = () => {
  if (!currentReserveTarget.value) {
    ElMessage.warning("没有找到当前选择的企业信息");
    return;
  }

  openReservationForm(currentReserveTarget.value);
  recommendDialogVisible.value = false;
};

const openReservationForm = (target: ReservationTarget | null) => {
  if (!target) {
    ElMessage.warning("没有找到可预约的企业信息");
    return;
  }

  reservationTarget.value = target;
  resetReservationForm();
  reservationDialogVisible.value = true;
};

const resetReservationForm = () => {
  reservationForm.date = "";
  reservationForm.startTime = "";
  reservationForm.endTime = "";
  reservationForm.remark = "";
};

const submitReservationForm = async () => {
  if (!reservationTarget.value) {
    ElMessage.warning("请先选择预约企业");
    return;
  }

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
      void getAllEnList();
    } else {
      ElMessage.error(res.data?.message || "预约失败");
    }
  } catch {
    ElMessage.error("预约请求失败");
  }
};

const buildUserLocationCard = (loc: UserLocation) => {
  return `
    <div class="user-location-card">
      <div class="user-location-icon">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
      <div class="user-location-label">我的位置</div>
      <div class="user-location-address">${escapeHtml(loc.address)}</div>
    </div>
  `;
};

const buildEnterpriseCard = (item: EnterpriseMapItem) => {
  const typeName = item.typeName || TYPE_OTHER;
  const typeClass = enterpriseTypeClassMap[typeName] || enterpriseTypeClassMap[TYPE_OTHER];
  const typeCode = enterpriseTypeCodeMap[typeName] || enterpriseTypeCodeMap[TYPE_OTHER];
  const onlineCount = toNumber(item.onlineCount);
  const onlineCapacity = toNumber(item.onlineCapacity);
  const reservedCount = toNumber(item.reservedCount);
  const reservationCapacity = toNumber(item.reservationCapacity);
  const onlinePercent = getPercent(onlineCount, onlineCapacity);
  const reservationPercent = getPercent(reservedCount, reservationCapacity);
  const reservationFull = reservationCapacity > 0 && reservedCount >= reservationCapacity;

  return `
    <div class="enterprise-map-card marker-${typeClass}">
      <div class="enterprise-card-kicker">${escapeHtml(typeName)}</div>
      <div class="enterprise-card-title">${escapeHtml(item.enterpriseName || "Unknown Enterprise")}</div>
      <div class="enterprise-card-id">ID: ${escapeHtml(item.id)}</div>

      <div class="capacity-row">
        <div class="capacity-label">
          <span>Online</span>
          <strong>${onlineCount}/${onlineCapacity}</strong>
        </div>
        <div class="capacity-track">
          <span class="capacity-fill online-fill" style="width: ${onlinePercent}%"></span>
        </div>
      </div>

      <div class="capacity-row">
        <div class="capacity-label">
          <span>Reservation</span>
          <strong>${reservedCount}/${reservationCapacity}</strong>
        </div>
        <div class="capacity-track">
          <span class="capacity-fill reservation-fill" style="width: ${reservationPercent}%"></span>
        </div>
      </div>

      <button
        type="button"
        class="reserve-enterprise-btn"
        data-enterprise-id="${escapeHtml(item.enId || item.id)}"
        data-enterprise-type="${typeCode}"
        ${reservationFull ? "disabled" : ""}
      >
        ${reservationFull ? "Full" : "Reserve"}
      </button>
    </div>
  `;
};

const handleReserveClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null;
  const button = target?.closest<HTMLButtonElement>(".reserve-enterprise-btn");

  if (!button || button.disabled) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const enterpriseId = button.dataset.enterpriseId;
  const enterpriseType = button.dataset.enterpriseType || enterpriseTypeCodeMap[TYPE_OTHER];
  if (enterpriseId) {
    void reserveEnterprise(enterpriseId, enterpriseType);
  }
};

const toNumber = (value: string | number | undefined) => {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
};

const getPercent = (count: number, capacity: number) => {
  if (capacity <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((count / capacity) * 100)));
};

const formatDrivingTime = (value: string | number | undefined) => {
  const seconds = toNumber(value);
  if (seconds <= 0) {
    return "暂无数据";
  }

  const minutes = Math.ceil(seconds / 60);
  return `${minutes} 分钟`;
};

const formatCrowdText = (count: string | number | undefined, capacity: string | number | undefined) => {
  const percent = getPercent(toNumber(count), toNumber(capacity));
  if (percent >= 90) {
    return "较拥挤";
  }
  if (percent >= 70) {
    return "偏忙";
  }
  return "较空闲";
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

onMounted(() => {
  document.addEventListener("click", handleReserveClick);
  void getUserLocation();
  void getAllEnList();
});

onUnmounted(() => {
  document.removeEventListener("click", handleReserveClick);
});
</script>

<style scoped>
.user-map-page {
  width: 100%;
  min-height: 100%;
  padding: 18px;
  background: #f5f7fb;
  box-sizing: border-box;
}

.map-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.type-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid #d8dee9;
  border-radius: 7px;
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
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

.type-all {
  color: #5a6f7e;
}

.type-hospital {
  color: #6BA5C7;
}

.type-parking {
  color: #96C2DB;
}

.type-park {
  color: #7BAEC8;
}

.type-charging {
  color: #89B8D4;
}

.type-other {
  color: #8DBCD5;
}

.filter-count {
  margin-left: auto;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

:deep(.user-location-card) {
  position: relative;
  min-width: 180px;
  padding: 13px 14px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 100%);
  border: 2px solid #f97316;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.18), 0 14px 30px rgba(15, 23, 42, 0.22);
  color: #1f2937;
  overflow: hidden;
}

:deep(.user-location-card::before) {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  background: linear-gradient(180deg, #f97316 0%, #ea580c 100%);
}

:deep(.user-location-card::after) {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -12px;
  width: 18px;
  height: 18px;
  background: #ffffff;
  border-right: 2px solid #f97316;
  border-bottom: 2px solid #f97316;
  transform: translateX(-50%) rotate(45deg);
  box-shadow: 6px 6px 14px rgba(15, 23, 42, 0.06);
}

:deep(.user-location-icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-bottom: 7px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #ffffff;
}

:deep(.user-location-label) {
  margin-bottom: 4px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #ea580c;
}

:deep(.user-location-address) {
  max-width: 200px;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
}

:deep(.enterprise-map-card) {
  position: relative;
  min-width: 230px;
  padding: 13px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid rgba(148, 163, 184, 0.26);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
  color: #1f2937;
  backdrop-filter: blur(6px);
  overflow: hidden;
}

:deep(.enterprise-map-card::before) {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  background: #64748b;
}

:deep(.enterprise-map-card::after) {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -12px;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.97);
  border-right: 1px solid rgba(148, 163, 184, 0.22);
  border-bottom: 1px solid rgba(148, 163, 184, 0.22);
  transform: translateX(-50%) rotate(45deg);
  box-shadow: 6px 6px 14px rgba(15, 23, 42, 0.06);
}

:deep(.enterprise-card-kicker) {
  display: inline-flex;
  align-items: center;
  margin-bottom: 7px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(100, 116, 139, 0.12);
  color: #475569;
}

:deep(.enterprise-card-title) {
  max-width: 230px;
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
}

:deep(.enterprise-card-id) {
  margin-bottom: 10px;
  font-size: 12px;
  color: #64748b;
}

:deep(.capacity-row) {
  margin-top: 8px;
}

:deep(.capacity-label) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 5px;
  font-size: 12px;
  color: #475569;
}

:deep(.capacity-label strong) {
  font-size: 12px;
  color: #111827;
}

:deep(.capacity-track) {
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
}

:deep(.capacity-fill) {
  display: block;
  height: 100%;
  border-radius: inherit;
}

:deep(.online-fill) {
  background: #2563eb;
}

:deep(.reservation-fill) {
  background: #16a34a;
}

:deep(.reserve-enterprise-btn) {
  width: 100%;
  min-height: 34px;
  margin-top: 12px;
  border: none;
  border-radius: 7px;
  background: #111827;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

:deep(.reserve-enterprise-btn:disabled) {
  background: #94a3b8;
  cursor: not-allowed;
}

:deep(.marker-hospital) {
  border-color: rgba(220, 38, 38, 0.28);
}

:deep(.marker-hospital::before) {
  background: #dc2626;
}

:deep(.marker-hospital .enterprise-card-kicker) {
  background: rgba(220, 38, 38, 0.12);
  color: #b91c1c;
}

:deep(.marker-parking) {
  border-color: rgba(37, 99, 235, 0.28);
}

:deep(.marker-parking::before) {
  background: #2563eb;
}

:deep(.marker-parking .enterprise-card-kicker) {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}

:deep(.marker-park) {
  border-color: rgba(22, 163, 74, 0.28);
}

:deep(.marker-park::before) {
  background: #16a34a;
}

:deep(.marker-park .enterprise-card-kicker) {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}

:deep(.marker-charging) {
  border-color: rgba(8, 145, 178, 0.3);
}

:deep(.marker-charging::before) {
  background: #0891b2;
}

:deep(.marker-charging .enterprise-card-kicker) {
  background: rgba(8, 145, 178, 0.13);
  color: #0e7490;
}

:deep(.marker-other) {
  border-color: rgba(124, 58, 237, 0.28);
}

:deep(.marker-other::before) {
  background: #7c3aed;
}

:deep(.marker-other .enterprise-card-kicker) {
  background: rgba(124, 58, 237, 0.12);
  color: #6d28d9;
}

:deep(.reservation-dialog .el-dialog) {
  border-radius: 16px;
}

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
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.recommend-card:hover,
.recommend-card.active {
  border-color: #2563eb;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.12);
  transform: translateY(-1px);
}

.recommend-main {
  min-width: 0;
}

.recommend-title {
  margin-bottom: 5px;
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
}

.recommend-meta {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 12px;
}

.recommend-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #475569;
  font-size: 13px;
}

.recommend-stats span {
  padding: 4px 8px;
  border-radius: 999px;
  background: #f1f5f9;
}

.reservation-target {
  margin-bottom: 18px;
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
  border: 1px solid #dbeafe;
}

.reservation-target-label {
  margin-bottom: 5px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
}

.reservation-target-name {
  margin-bottom: 5px;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.reservation-target-meta {
  color: #64748b;
  font-size: 12px;
}

.reservation-form {
  padding-top: 2px;
}

@media (max-width: 720px) {
  .recommend-card {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
