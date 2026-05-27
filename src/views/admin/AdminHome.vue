<template>
  <div class="admin-home">
    <aside class="sidebar">
      <div class="sidebar-title">管理面板</div>
      <el-menu
        :default-active="activeMenu"
        class="menu"
        @select="handleSelect"
      >
        <el-sub-menu index="enterprise" popper-class="sidebar-sub-menu">
          <template #title>
            <el-icon><IconMenu /></el-icon>
            <span>企业管理</span>
          </template>
          <el-sub-menu index="enterpriseReview">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>企业审核</span>
            </template>
            <el-menu-item index="pendingEnterpriseReview">
              <el-icon><Document /></el-icon>
              <span>待审核企业</span>
            </el-menu-item>
            <el-menu-item index="reviewedEnterpriseReview">
              <el-icon><Finished /></el-icon>
              <span>已审核企业</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item index="adminEnterprise">
            <el-icon><Finished /></el-icon>
            <span>企业列表</span>
          </el-menu-item>
          <el-menu-item index="map1">
            <el-icon><Location /></el-icon>
            <span>企业地图</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="user">
          <template #title>
            <el-icon><Location /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="userInformation">
            <el-icon><IconMenu /></el-icon>
            <span>用户列表</span>
          </el-menu-item>
          <el-menu-item index="map2">
            <el-icon><Location /></el-icon>
            <span>用户聚类地图</span>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="profile">
          <el-icon><User /></el-icon>
          <span>个人信息</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <main class="content">
      <div class="content-header">
        <div class="header-left">
          <div class="content-avatar">
            <el-icon :size="22"><UserFilled /></el-icon>
          </div>
          <span class="header-welcome">欢迎 {{ authStore.displayName }} 用户</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" plain size="default" @click="handleSelect('profile')">
            <el-icon><User /></el-icon>
            个人信息
          </el-button>
          <el-button type="danger" plain size="default" @click="logout">退出登录</el-button>
        </div>
      </div>

      <section
        v-if="activeMenu === 'pendingEnterpriseReview'"
        class="panel"
      >
        <AdminPassEnterprise
          key="pendingEnterpriseReview"
          review-status="pending"
        />
      </section>

      <section
        v-else-if="activeMenu === 'reviewedEnterpriseReview'"
        class="panel"
      >
        <AdminPassEnterprise
          key="reviewedEnterpriseReview"
          review-status="reviewed"
        />
      </section>

      <section
        v-else-if="activeMenu === 'adminEnterprise'"
        class="panel"
      >
        <AdminEnterprise />
      </section>

      <section
        v-else-if="activeMenu === 'userInformation'"
        class="panel"
      >
        <AdminUser />
      </section>

      <section
        v-else-if="activeMenu === 'map1'"
        class="panel panel-map"
      >
        <div class="map-filter-bar">
          <button
            v-for="type in enterpriseTypeOptions"
            :key="type.value"
            type="button"
            class="type-filter-btn"
            :class="[
              type.className,
              { active: selectedEnterpriseType === type.value },
            ]"
            @click="selectedEnterpriseType = type.value"
          >
            <span class="type-dot"></span>
            <span>{{ type.label }}</span>
          </button>
          <span class="filter-count"
            >{{ filteredAddressList.length }} / {{ addressList.length }}</span
          >
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

      <section
        v-else-if="activeMenu === 'map2'"
        class="panel panel-map"
      >
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
          <div
            v-else
            class="map-empty"
          >
            暂无聚类数据
          </div>
        </MapContainer>
      </section>

      <section
        v-else-if="activeMenu === 'profile'"
        class="panel"
      >
        <el-descriptions
          v-loading="profileLoading"
          :column="1"
          border
          title="管理员信息"
        >
          <el-descriptions-item label="用户名">{{
            adminProfile.username || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="上次登录时间">{{
            adminProfile.loginTime || "-"
          }}</el-descriptions-item>
        </el-descriptions>

        <div class="edit-section">
          <el-button
            type="warning"
            @click="adminPwdDialogVisible = true"
            >修改密码</el-button
          >
        </div>

        <el-dialog
          v-model="adminPwdDialogVisible"
          title="修改密码"
          width="420px"
          :close-on-click-modal="false"
        >
          <el-form
            :model="adminPwdForm"
            label-width="100px"
          >
            <el-form-item label="原密码">
              <el-input
                v-model="adminPwdForm.oldPassword"
                type="password"
                show-password
                placeholder="请输入原密码"
              />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input
                v-model="adminPwdForm.newPassword"
                type="password"
                show-password
                placeholder="请输入新密码"
              />
            </el-form-item>
            <el-form-item label="确认新密码">
              <el-input
                v-model="adminPwdForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入新密码"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="adminPwdDialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              :loading="adminPwdSaving"
              @click="handleAdminPwdSave"
              >保存</el-button
            >
          </template>
        </el-dialog>
      </section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElAmapMarkerCluster } from "@vuemap/vue-amap";
import { ElMessage, ElNotification } from "element-plus";
import {
  Document,
  Finished,
  Location,
  Menu as IconMenu,
  Setting,
  User,
  UserFilled,
} from "@element-plus/icons-vue";
import { useAuthStore } from "../../stores/useAuthStore";
import AdminPassEnterprise from "./AdminPassEnterprise.vue";
import AdminEnterprise from "./AdminEnterprise.vue";
import AdminUser from "./AdminUser.vue";
import MapContainer from "../login/MapContainer.vue";
import request from "../../utils/request";
import type { Address } from "../../types/Address";
import type { User as UserType } from "../../types/User";

const router = useRouter();
const authStore = useAuthStore();
const activeMenu = ref("");
const addressList = ref<Address[]>([]);
const activeMarkerId = ref("");
const userTableData = ref<UserType[]>([]);
const selectedEnterpriseType = ref("all");
const profileLoading = ref(false);
const adminProfile = ref({ username: "", loginTime: "" });
const adminPwdDialogVisible = ref(false);
const adminPwdSaving = ref(false);
const adminPwdForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});
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

  return addressList.value.filter(
    (item) => item.typeName === selectedEnterpriseType.value,
  );
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
    case "pendingEnterpriseReview":
      return "待审核企业";
    case "reviewedEnterpriseReview":
      return "已审核企业";
    case "adminEnterprise":
      return "已批准企业";
    case "userInformation":
      return "用户列表";
    case "map1":
      return "企业地图";
    case "map2":
      return "用户聚类地图";
    case "profile":
      return "个人信息";
    default:
      return "任务管理";
  }
});

const pageSubtitle = computed(() => {
  switch (activeMenu.value) {
    case "pendingEnterpriseReview":
      return "审核新注册的企业账号。";
    case "reviewedEnterpriseReview":
      return "查看已完成审核的企业账号。";
    case "map1":
      return "按类型筛选企业卡片并查看其位置。";
    case "map2":
      return "使用聚类高效渲染用户坐标点。";
    default:
      return "管理城市平台记录。";
  }
});

const logout = () => {
  authStore.clearAuthData();
  ElMessage.success("已退出登录");
  router.push("/");
};

const buildMarkerContent = (item: Address) => {
  const typeName = item.typeName || TYPE_OTHER;
  const typeClass =
    enterpriseTypeClassMap[typeName] || enterpriseTypeClassMap[TYPE_OTHER];
  const enterpriseName = escapeHtml(item.enterpriseName || "未知企业");
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

  if (key === "profile") {
    void fetchAdminProfile();
  }
};

const fetchAdminProfile = async () => {
  profileLoading.value = true;
  try {
    const res = await request.get("/getAdminProfile", {
      params: { adminId: authStore.id },
    });
    if (res.data?.success !== false) {
      adminProfile.value.username = res.data.username || "";
      adminProfile.value.loginTime = res.data.loginTime || "";
    }
  } catch {
    ElMessage.error("获取管理员信息失败");
  } finally {
    profileLoading.value = false;
  }
};

const handleAdminPwdSave = async () => {
  if (
    !adminPwdForm.oldPassword ||
    !adminPwdForm.newPassword ||
    !adminPwdForm.confirmPassword
  ) {
    ElMessage.warning("请填写完整密码信息");
    return;
  }
  if (adminPwdForm.newPassword !== adminPwdForm.confirmPassword) {
    ElMessage.warning("两次输入的新密码不一致");
    return;
  }

  adminPwdSaving.value = true;
  try {
    const res = await request.put("/updateAdminPassword", {
      adminId: authStore.id,
      oldPassword: adminPwdForm.oldPassword,
      newPassword: adminPwdForm.newPassword,
    });

    if (res.data?.success) {
      ElMessage.success("密码修改成功");
      adminPwdDialogVisible.value = false;
      adminPwdForm.oldPassword = "";
      adminPwdForm.newPassword = "";
      adminPwdForm.confirmPassword = "";
    } else {
      ElMessage.error(res.data?.message || "修改失败");
    }
  } catch {
    ElMessage.error("密码修改请求失败");
  } finally {
    adminPwdSaving.value = false;
  }
};

const getAddress = async () => {
  try {
    const res = await request.get("/getAddress");
    addressList.value = res.data ?? [];
  } catch {
    ElMessage.error("地图标记数据加载失败");
  }
};

const getAllUser = async () => {
  try {
    const res = await request.get("/getAllUser");
    userTableData.value = res.data ?? [];
  } catch {
    ElMessage.error("用户聚类数据加载失败");
  }
};

const notifyNewEnterpriseRegistrations = async () => {
  try {
    const res = await request.get("/getNewConfirmCount");
    const count = Number(res.data?.count ?? 0);

    if (count > 0) {
      ElNotification({
        title: "新企业注册",
        message: `${count} 个新企业用户等待审核。`,
        type: "info",
        duration: 6000,
      });
    }
  } catch {
    ElMessage.warning("检查新企业注册失败");
  } finally {
    activeMenu.value = "pendingEnterpriseReview";
  }
};

onMounted(() => {
  void notifyNewEnterpriseRegistrations();
});
</script>

<style scoped>
.admin-home {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: #E5EDF1;
}

.sidebar {
  flex: 0 0 260px;
  width: 260px;
  min-width: 260px;
  padding: 0;
  background: #FFFFFF;
  border-right: 1px solid #E5EDF1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-title {
  margin: 0;
  padding: 28px 24px 20px;
  font-size: 20px;
  font-weight: 800;
  color: #2c3e50;
  letter-spacing: 1px;
  border-bottom: 1px solid #E5EDF1;
}

.menu {
  width: 100%;
  border-right: none;
  background: transparent;
  padding: 12px 0;
}

.menu :deep(.el-menu-item),
.menu :deep(.el-sub-menu__title) {
  margin: 4px 12px;
  border-radius: 10px;
  height: 44px;
  line-height: 44px;
  color: #5a6f7e;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.menu :deep(.el-menu-item:hover),
.menu :deep(.el-sub-menu__title:hover) {
  background: #E5EDF1;
  color: #2c3e50;
}

.menu :deep(.el-menu-item.is-active) {
  background: #96C2DB;
  color: #FFFFFF;
  font-weight: 700;
}

.menu :deep(.el-sub-menu) {
  background: transparent;
}

.content {
  flex: 1 1 auto;
  min-width: 0;
  width: calc(100% - 260px);
  padding: 28px 32px;
  box-sizing: border-box;
}

.content-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px 24px;
  background: #FFFFFF;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 4px 16px rgba(44, 62, 80, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-welcome {
  font-size: 17px;
  font-weight: 700;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.content-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #96C2DB, #7BAEC8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
}

.panel {
  min-height: 720px;
  width: 100%;
  padding: 24px;
  border-radius: 16px;
  background: #FFFFFF;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.06);
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

.edit-section {
  margin-top: 20px;
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

<style>
.sidebar-sub-menu,
.sidebar-sub-menu .el-menu--popup {
  background: #FFFFFF !important;
  border: 1px solid #E5EDF1 !important;
  border-radius: 10px !important;
  padding: 4px 0 !important;
  box-shadow: 0 8px 24px rgba(44, 62, 80, 0.12) !important;
}

.sidebar-sub-menu .el-menu--popup .el-menu-item,
.sidebar-sub-menu .el-menu-item {
  margin: 2px 6px;
  border-radius: 8px;
  height: 40px;
  line-height: 40px;
  color: #5a6f7e !important;
  background: transparent !important;
  font-size: 13px;
  font-weight: 500;
}

.sidebar-sub-menu .el-menu--popup .el-menu-item:hover,
.sidebar-sub-menu .el-menu-item:hover {
  background: #E5EDF1 !important;
  color: #2c3e50 !important;
}

.sidebar-sub-menu .el-menu--popup .el-menu-item.is-active,
.sidebar-sub-menu .el-menu-item.is-active {
  background: #96C2DB !important;
  color: #FFFFFF !important;
  font-weight: 700;
}
</style>
