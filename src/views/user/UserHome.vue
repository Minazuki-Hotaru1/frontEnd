<template>
  <div class="user-home-page">
    <header class="user-home-header">
      <div>
        <p class="header-kicker">City Service</p>
        <h1 class="header-title">用户服务中心</h1>
        <p class="header-desc">查看企业地图、筛选附近服务，并完成预约前的信息确认。</p>
      </div>

      <div class="header-card">
        <span class="header-card-label">当前模块</span>
        <strong>{{ activeMenuTitle }}</strong>
      </div>
    </header>

    <el-menu
      :default-active="activeMenu"
      :ellipsis="false"
      class="user-home-menu"
      mode="horizontal"
      @select="handleMenuSelect"
    >
      <el-sub-menu index="enterprise">
        <template #title>
          <span>企业信息查看</span>
        </template>
        <el-menu-item index="enMap">企业地图查看</el-menu-item>
        <el-menu-item index="enList">企业列表查看</el-menu-item>
      </el-sub-menu>
      <el-menu-item index="reservation">我的预约</el-menu-item>
      <el-menu-item index="profile">个人信息</el-menu-item>
    </el-menu>

    <main class="user-home-content">
      <section
        v-if="activeMenu === 'enMap'"
        class="panel map-panel"
      >
        <UserMap />
      </section>

      <section
        v-else-if="activeMenu === 'enList'"
        class="panel empty-panel"
      >
        <h2>企业列表查看</h2>
        <p>这里可以后续接入企业列表、搜索和分页功能。</p>
      </section>

      <section
        v-else-if="activeMenu === 'reservation'"
        class="panel empty-panel"
      >
        <h2>我的预约</h2>
        <p>这里可以后续展示用户已提交的预约记录。</p>
      </section>

      <section
        v-else
        class="panel empty-panel"
      >
        <h2>个人信息</h2>
        <p>这里可以后续展示和维护用户资料。</p>
      </section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import UserMap from "./UserMap.vue";

const activeMenu = ref("enMap");

const menuTitleMap: Record<string, string> = {
  enMap: "企业地图查看",
  enList: "企业列表查看",
  reservation: "我的预约",
  profile: "个人信息",
};

const activeMenuTitle = computed(() => menuTitleMap[activeMenu.value] || "用户服务中心");

const handleMenuSelect = (index: string) => {
  activeMenu.value = index;
};
</script>

<style scoped>
.user-home-page {
  min-height: 100vh;
  padding: 24px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.16), transparent 30%),
    linear-gradient(135deg, #f8fafc 0%, #eef4ff 45%, #f8fafc 100%);
}

.user-home-header {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
  padding: 24px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(12px);
}

.header-kicker {
  margin: 0 0 8px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.header-title {
  margin: 0;
  color: #0f172a;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.15;
}

.header-desc {
  max-width: 560px;
  margin: 10px 0 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

.header-card {
  display: grid;
  min-width: 180px;
  padding: 16px 18px;
  border-radius: 18px;
  background: #0f172a;
  color: #ffffff;
  align-content: center;
  box-shadow: 0 18px 35px rgba(15, 23, 42, 0.18);
}

.header-card-label {
  margin-bottom: 6px;
  color: #93c5fd;
  font-size: 12px;
  font-weight: 700;
}

.header-card strong {
  font-size: 18px;
}

.user-home-menu {
  margin-bottom: 18px;
  padding: 0 14px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07);
}

.user-home-content {
  min-height: 620px;
}

.panel {
  min-height: 620px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.map-panel {
  padding: 0;
}

.empty-panel {
  display: grid;
  place-content: center;
  padding: 48px;
  text-align: center;
}

.empty-panel h2 {
  margin: 0 0 10px;
  color: #0f172a;
  font-size: 24px;
}

.empty-panel p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

@media (max-width: 768px) {
  .user-home-page {
    padding: 14px;
  }

  .user-home-header {
    flex-direction: column;
    padding: 18px;
  }

  .header-title {
    font-size: 24px;
  }

  .header-card {
    min-width: 0;
  }
}
</style>
