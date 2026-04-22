<template>
  <div class="admin-page">
    <el-table v-loading="loading" :data="tableData" border style="width: 100%">
      <el-table-column prop="id" label="ID" min-width="80" />
      <el-table-column prop="username" label="账号" min-width="80" />
      <el-table-column prop="roles" label="企业名称" min-width="120" />
      <el-table-column prop="typeName" label="企业类型" min-width="120" />
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
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { ElMessage } from "element-plus"
import request from "../../utils/request"

interface Enterprise {
  id: number
  username: string
  typeName: string
  roles: string
}

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref<Enterprise[]>([])

const getTableData = async (page = currentPage.value) => {
  loading.value = true

  try {
    const res = await request.get("/getEnterprise", {
      params: {
        page,
        number: pageSize.value,
      },
    })

    tableData.value = res.data.records ?? []
    total.value = res.data.total ?? 0
    currentPage.value = res.data.current ?? page
  } catch {
    ElMessage.error("分页数据获取失败，请检查后端接口")
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  void getTableData(page)
}

onMounted(() => {
  void getTableData()
})
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
</style>
