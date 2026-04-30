<template>
  <div class="admin-home">
    <aside class="sidebar">
      <div class="sidebar-title">Admin Panel</div>
      <el-menu :default-active="activeMenu" class="menu" @select="handleSelect">
        <el-sub-menu index="enterprise">
          <template #title>
            <el-icon><IconMenu /></el-icon>
            <span>Enterprise</span>
          </template>
          <el-menu-item index="adminPassEnterprise">
            <el-icon><Document /></el-icon>
            <span>Pending Review</span>
          </el-menu-item>
          <el-menu-item index="adminEnterprise">
            <el-icon><Finished /></el-icon>
            <span>Enterprise List</span>
          </el-menu-item>
          <el-menu-item index="map1">
            <el-icon><Location /></el-icon>
            <span>Enterprise Map</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="user">
          <template #title>
            <el-icon><Location /></el-icon>
            <span>User</span>
          </template>
          <el-menu-item index="userInformation">
            <el-icon><IconMenu /></el-icon>
            <span>User List</span>
          </el-menu-item>
          <el-menu-item index="map2">
            <el-icon><Location /></el-icon>
            <span>User Cluster Map</span>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="task">
          <el-icon><Setting /></el-icon>
          <span>Task</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <main class="content">
      <div class="content-header">
        <div>
          <h1 class="content-title">{{ pageTitle }}</h1>
          <p class="content-subtitle">{{ pageSubtitle }}</p>
        </div>
        <button class="logout-btn" type="button" @click="logout">Logout</button>
      </div>

      <section v-if="activeMenu === 'adminPassEnterprise'" class="panel">
        <AdminPassEnterprise />
      </section>

      <section v-else-if="activeMenu === 'adminEnterprise'" class="panel">
        <AdminEnterprise />
      </section>

      <section v-else-if="activeMenu === 'userInformation'" class="panel">
        <AdminUser />
      </section>

      <section v-else-if="activeMenu === 'map1'" class="panel panel-map">
        <div class="map-filter-bar">
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
          <span class="filter-count">{{ filteredAddressList.length }} / {{ addressList.length }}</span>
        </div>

        <MapContainer>
          <el-amap-marker
            v-for="item in filteredAddressList"
            :key="item.id"
            :position="[Number(item.longitude), Number(item.latitude)]"
            anchor="bottom-center"
            :offset="[0, -10]"
            :top-when-click="true"
            :z-index="activeMarkerId === item.id ? 200 : 12"
            :re-event-when-update="true"
            :content="buildMarkerContent(item)"
            @click="activeMarkerId = item.id"
          />
        </MapContainer>
      </section>

      <section v-else-if="activeMenu === 'map2'" class="panel panel-map">
        <MapContainer>
          <ElAmapMarkerCluster
            v-if="clusterPoints.length"
            :points="clusterPoints"
            :grid-size="60"
            :max-zoom="17"
            :average-center="true"
            :cluster-by-zoom-change="true"
            :render-cluster-marker="renderClusterMarker"
            :render-marker="renderMarker"
          />
          <div v-else class="map-empty">No clustered points available.</div>
        </MapContainer>
      </section>

      <section v-else class="panel placeholder-panel">
        <div class="placeholder-card">
          <h3>Task</h3>
          <p>This module is not configured yet.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { ElAmapMarkerCluster } from "@vuemap/vue-amap";
import { ElMessage } from "element-plus";
import {
  Document,
  Finished,
  Location,
  Menu as IconMenu,
  Setting,
} from "@element-plus/icons-vue";
import { useAuthStore } from "../../stores/useAuthStore";
import AdminPassEnterprise from "./AdminPassEnterprise.vue";
import AdminEnterprise from "./AdminEnterprise.vue";
import AdminUser from "./AdminUser.vue";
import MapContainer from "../login/MapContainer.vue";
import request from "../../utils/request";
import type { Address } from "../../types/Address";
import type { User } from "../../types/User";

const router = useRouter();
const authStore = useAuthStore();
const activeMenu = ref("adminPassEnterprise");
const addressList = ref<Address[]>([]);
const activeMarkerId = ref("");
const userTableData = ref<User[]>([]);
const selectedEnterpriseType = ref("all");
const markerIconUrl = new URL(
  "../../../material/\u6807\u70b9\u3001\u5730\u70b9_2.png",
  import.meta.url,
).href;

const TYPE_HOSPITAL = "\u533b\u9662";
const TYPE_PARKING = "\u505c\u8f66\u573a";
const TYPE_PARK = "\u516c\u56ed\u666f\u70b9";
const TYPE_CHARGING = "\u65b0\u80fd\u6e90\u5145\u7535\u6869\u505c\u8f66\u573a";
const TYPE_OTHER = "\u5176\u4ed6";

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

const filteredAddressList = computed(() => {
  if (selectedEnterpriseType.value === "all") {
    return addressList.value;
  }

  return addressList.value.filter((item) => item.typeName === selectedEnterpriseType.value);
});

const clusterPoints = computed(() =>
  userTableData.value
    .filter(
      (item) =>
        Number.isFinite(Number(item.longitude)) &&
        Number.isFinite(Number(item.latitude)),
    )
    .map((item) => ({
      lnglat: [Number(item.longitude), Number(item.latitude)],
      id: item.id,
      username: item.username,
    })),
);

const pageTitle = computed(() => {
  switch (activeMenu.value) {
    case "adminPassEnterprise":
      return "Pending Enterprises";
    case "adminEnterprise":
      return "Approved Enterprises";
    case "userInformation":
      return "User List";
    case "map1":
      return "Enterprise Map";
    case "map2":
      return "User Cluster Map";
    default:
      return "Task";
  }
});

const pageSubtitle = computed(() => {
  switch (activeMenu.value) {
    case "map1":
      return "Filter enterprise cards by type and view their locations.";
    case "map2":
      return "Render around 1000 user points efficiently with clustering.";
    default:
      return "Manage city platform records.";
  }
});

const logout = () => {
  authStore.clearAuthData();
  ElMessage.success("Logged out");
  router.push("/");
};

const buildMarkerContent = (item: Address) => {
  const typeName = item.typeName || TYPE_OTHER;
  const typeClass = enterpriseTypeClassMap[typeName] || enterpriseTypeClassMap[TYPE_OTHER];
  const enterpriseName = escapeHtml(item.enterpriseName || "Unknown Enterprise");
  const safeId = escapeHtml(item.id);
  const safeTypeName = escapeHtml(typeName);

  return `
    <div class="custom-marker-card marker-${typeClass}">
      <div class="custom-marker-kicker">${safeTypeName}</div>
      <div class="custom-marker-title">${enterpriseName}</div>
      <div class="custom-marker-text">ID: ${safeId}</div>
    </div>
  `;
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

const renderClusterMarker = (context: any) => {
  const wrapper = document.createElement("div");
  wrapper.className = "cluster-marker";

  const pin = document.createElement("div");
  pin.className = "cluster-pin";
  pin.style.backgroundImage = `url("${markerIconUrl}")`;

  const badge = document.createElement("span");
  badge.className = "cluster-badge";
  badge.textContent = String(context.count);

  wrapper.append(pin, badge);
  context.marker.setContent(wrapper);
  context.marker.setOffset(new AMap.Pixel(-23, -52));
};

const renderMarker = (context: any) => {
  const pointDiv = document.createElement("div");
  pointDiv.className = "point-marker";
  pointDiv.style.backgroundImage = `url("${markerIconUrl}")`;

  context.marker.setContent(pointDiv);
  context.marker.setOffset(new AMap.Pixel(-11, -34));
};

const handleSelect = (key: string) => {
  activeMenu.value = key;

  if (key === "map1") {
    void getAddress();
  }

  if (key === "map2") {
    void getAllUser();
  }
};

const getAddress = async () => {
  try {
    const res = await request.get("/getAddress");
    addressList.value = res.data ?? [];
  } catch {
    ElMessage.error("Failed to load map marker data");
  }
};

const getAllUser = async () => {
  try {
    const res = await request.get("/getAllUser");
    userTableData.value = res.data ?? [];
  } catch {
    ElMessage.error("Failed to load clustered user points");
  }
};
</script>

<style scoped>
.admin-home {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: #f5f7fb;
}

.sidebar {
  flex: 0 0 260px;
  width: 260px;
  min-width: 260px;
  padding: 24px 18px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 8px 0 24px rgba(15, 23, 42, 0.04);
  box-sizing: border-box;
}

.sidebar-title {
  margin-bottom: 20px;
  padding: 0 12px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.menu {
  width: 100%;
  border-right: none;
}

.content {
  flex: 1 1 auto;
  min-width: 0;
  width: calc(100% - 260px);
  padding: 28px;
  box-sizing: border-box;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.content-title {
  margin: 0;
  font-size: 30px;
  color: #111827;
}

.content-subtitle {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.logout-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  background: #3653f8;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}

.panel {
  min-height: 720px;
  width: 100%;
  padding: 20px;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  box-sizing: border-box;
}

.panel-map {
  position: relative;
  overflow: hidden;
}

.map-filter-bar {
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

.map-empty {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #4b5563;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  z-index: 10;
}

.placeholder-panel {
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-card {
  text-align: center;
  color: #4b5563;
}

.placeholder-card h3 {
  margin: 0 0 8px;
  font-size: 22px;
  color: #111827;
}

.placeholder-card p {
  margin: 0;
}

:deep(.custom-marker-card) {
  position: relative;
  min-width: 180px;
  padding: 12px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.26);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
  color: #1f2937;
  backdrop-filter: blur(6px);
  overflow: hidden;
}

:deep(.custom-marker-card::before) {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  background: #64748b;
}

:deep(.custom-marker-card::after) {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -12px;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.96);
  border-right: 1px solid rgba(54, 83, 248, 0.18);
  border-bottom: 1px solid rgba(54, 83, 248, 0.18);
  transform: translateX(-50%) rotate(45deg);
  box-shadow: 6px 6px 14px rgba(15, 23, 42, 0.06);
}

:deep(.custom-marker-kicker) {
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

:deep(.custom-marker-title) {
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 700;
}

:deep(.custom-marker-text) {
  font-size: 12px;
  color: #4b5563;
}

:deep(.marker-hospital) {
  border-color: rgba(220, 38, 38, 0.28);
}

:deep(.marker-hospital::before) {
  background: #dc2626;
}

:deep(.marker-hospital .custom-marker-kicker) {
  background: rgba(220, 38, 38, 0.12);
  color: #b91c1c;
}

:deep(.marker-parking) {
  border-color: rgba(37, 99, 235, 0.28);
}

:deep(.marker-parking::before) {
  background: #2563eb;
}

:deep(.marker-parking .custom-marker-kicker) {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}

:deep(.marker-park) {
  border-color: rgba(22, 163, 74, 0.28);
}

:deep(.marker-park::before) {
  background: #16a34a;
}

:deep(.marker-park .custom-marker-kicker) {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}

:deep(.marker-charging) {
  border-color: rgba(8, 145, 178, 0.3);
}

:deep(.marker-charging::before) {
  background: #0891b2;
}

:deep(.marker-charging .custom-marker-kicker) {
  background: rgba(8, 145, 178, 0.13);
  color: #0e7490;
}

:deep(.marker-other) {
  border-color: rgba(124, 58, 237, 0.28);
}

:deep(.marker-other::before) {
  background: #7c3aed;
}

:deep(.marker-other .custom-marker-kicker) {
  background: rgba(124, 58, 237, 0.12);
  color: #6d28d9;
}

:deep(.cluster-marker) {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 52px;
}

:deep(.cluster-pin) {
  width: 46px;
  height: 52px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  filter: drop-shadow(0 10px 18px rgba(29, 78, 216, 0.24));
}

:deep(.cluster-badge) {
  position: absolute;
  top: -4px;
  right: -10px;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1d4ed8;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border: 2px solid #ffffff;
  box-shadow: 0 6px 18px rgba(29, 78, 216, 0.28);
}

:deep(.point-marker) {
  width: 22px;
  height: 34px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  filter: drop-shadow(0 6px 14px rgba(37, 99, 235, 0.24));
}
</style>
