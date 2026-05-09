<template>
  <div>
    <el-table v-loading="loading" :data="userVOTable" border style="width: 100%">
      <el-table-column prop="id" label="ID" min-width="80" />
      <el-table-column prop="username" label="账号" min-width="80" />
      <el-table-column prop="address" label="住址" min-width="120" />
      <el-table-column prop="appointmentCount" label="预约数量" min-width="80" align="center">
        <template #default="{ row }">
          <el-tag type="info" size="small">{{ row.appointmentCount ?? 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="140" align="center">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="showAppointments(row)"
          >
            查看预约记录
          </el-button>
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

    <!-- 预约记录弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="`${currentUsername} 的预约记录`"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-table v-loading="appLoading" :data="appointmentList" border style="width: 100%">
        <el-table-column prop="id" label="预约ID" min-width="80" />
        <el-table-column prop="enterpriseId" label="企业ID" min-width="80" />
        <el-table-column prop="startTime" label="开始时间" min-width="120" />
        <el-table-column prop="endTime" label="结束时间" min-width="120" />
        <el-table-column prop="appStatus" label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.appStatus === '1'" type="warning">已预约未到场</el-tag>
            <el-tag v-else-if="row.appStatus === '2'" type="success">已到场</el-tag>
            <el-tag v-else-if="row.appStatus === '3'" type="danger">预约未到场</el-tag>
            <el-tag v-else type="info">{{ row.appStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="120">
          <template #default="{ row }">
            <span>{{ row.remarks || '-' }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!appLoading && appointmentList.length === 0" class="empty-hint">
        该用户暂无预约记录
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import type { UserVO } from "../../types/UserVO";
import request from "../../utils/request";
import { ElMessage } from "element-plus";

const userVOTable = ref<UserVO[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(true)

const dialogVisible = ref(false)
const appLoading = ref(false)
const currentUsername = ref("")
const appointmentList = ref<any[]>([])

const getPageUser = async (page = currentPage.value) => {
  const res = await request.get("/getAllUserPage", {
    params: {
      page: page,
      number: pageSize.value
    }
  })

  try {
    userVOTable.value = res.data.records ?? []
    total.value = res.data.total ?? 0
    currentPage.value = res.data.current ?? page

  } catch {
    ElMessage.error("分页数据获取失败，请检查后端接口")
  } finally {
    loading.value = false
  }
}

const showAppointments = async (row: UserVO) => {
  currentUsername.value = row.username
  dialogVisible.value = true
  appLoading.value = true
  appointmentList.value = []

  try {
    const res = await request.get("/getUserAppointments", {
      params: { userId: row.id }
    })
    appointmentList.value = res.data ?? []

    if (appointmentList.value.length === 0) {
      ElMessage.info("该用户暂无预约记录")
    }
  } catch {
    ElMessage.error("获取预约记录失败")
  } finally {
    appLoading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  void getPageUser(page)
}

onMounted(() => {
  void getPageUser()
})
</script>

<style scoped>
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.empty-hint {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}
</style>
