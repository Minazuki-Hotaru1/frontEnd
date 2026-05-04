<template>
  <el-table
    :data="tableData"
    style="width: 100%"
  >
    <el-table-column
      prop="id"
      label="ID"
      width="180"
    />
    <el-table-column
      prop="userId"
      label="用户Id"
      width="180"
    />
    <el-table-column
      prop="userName"
      label="用户名称"
      width="180"
    />
    <el-table-column
      prop="userAddress"
      label="用户地址"
      width="180"
    />
    <el-table-column
      prop="appStartTime"
      label="用户预约起始时间"
      width="180"
    />
    <el-table-column
      prop="appEndTime"
      label="用户预约结束时间"
      width="180"
    />
    <el-table-column
      prop="appStatus"
      label="用户预约状态"
      width="180"
    />
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
  <el-button @click="getAppoinrment">111</el-button>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { useAuthStore } from "../../stores/useAuthStore";
import { useRouter } from "vue-router";
import request from "../../utils/request";

const loading = ref(false);

const router = useRouter();
const handleSelect = null;
const activeMenu = ref("appointmentUser");
const authStore = useAuthStore();
const tableData = ref([]);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const logout = () => {
  console.log(authStore.id);

  // authStore.clearAuthData()
  // ElMessage.success("登出成功")
  // router.push("/")
};

const getAppoinrment = async (page = currentPage.value) => {
  loading.value = true;

  try {
    const res = await request.get("/getAllApp", {
      params: {
        EnId: authStore.id,
        page,
        number: pageSize.value,
      },
    });
    if (res == null) {
      ElMessage.warning("未查询到当前企业的预约用户信息");
      return;
    }
    tableData.value = res.data.records ?? [];
    total.value = res.data.total ?? 0;
    currentPage.value = res.data.current ?? page;
  } catch {
    ElMessage.error("分页数据获取失败，请检查后端接口");
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  void getAppoinrment(page);
};

onMounted(() => {
  void getAppoinrment;
});
</script>

<style></style>
