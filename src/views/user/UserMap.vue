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
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useAuthStore } from "../../stores/useAuthStore";
import request from "../../utils/request";
import MapContainer from "../login/MapContainer.vue";

interface EnterpriseMapItem {
  id: string;
  enterpriseName: string;
  latitude: string | number;
  longitude: string | number;
  onlineCapacity?: string | number;
  onlineCount?: string | number;
  reservationCapacity?: string | number;
  reservedCount?: string | number;
  typeName?: string;
}

const TYPE_HOSPITAL = "\u533b\u9662";
const TYPE_PARKING = "\u505c\u8f66\u573a";
const TYPE_PARK = "\u516c\u56ed\u666f\u70b9";
const TYPE_CHARGING = "\u65b0\u80fd\u6e90\u5145\u7535\u6869\u505c\u8f66\u573a";
const TYPE_OTHER = "\u5176\u4ed6";

const authStore = useAuthStore();
const enList = ref<EnterpriseMapItem[]>([]);
const activeEnterpriseId = ref("");
const selectedEnterpriseType = ref("all");

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

const getAllEnList = async () => {
  try {
    const res = await request.get("/userGetAllEn");
    enList.value = res.data ?? [];
  } catch {
    ElMessage.error("Failed to load enterprise map data");
  }
};

const reserveEnterprise = async (enterpriseId: string, enterpriseTypeCode: string) => {
  const userId = authStore.id;

  if (!userId) {
    ElMessage.warning("Please log in again before making a reservation");
    return;
  }

  try {
    const res = await request.post("/userReserveEnterprise", {
      userId,
      enterpriseId,
      enterpriseType: enterpriseTypeCode,
    });

    if (res.data?.success === false) {
      ElMessage.error(res.data.message || "Reservation failed");
      return;
    }

    ElMessage.success(res.data?.message || "Reservation submitted");
    void getAllEnList();
  } catch {
    ElMessage.error("Reservation request failed");
  }
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
        data-enterprise-id="${escapeHtml(item.id)}"
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
  color: #475569;
}

.type-hospital {
  color: #dc2626;
}

.type-parking {
  color: #2563eb;
}

.type-park {
  color: #16a34a;
}

.type-charging {
  color: #0891b2;
}

.type-other {
  color: #7c3aed;
}

.filter-count {
  margin-left: auto;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
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
</style>
