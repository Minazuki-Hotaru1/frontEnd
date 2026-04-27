<template>
  <div>
  <el-table v-loading="loading" :data="userVOTable" border style="width: 100%">
      <el-table-column prop="id" label="ID" min-width="80" />
      <el-table-column prop="username" label="账号" min-width="80" />
      <el-table-column prop="address" label="住址" min-width="120" />
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
import type { UserVO } from "../../types/UserVO";
import request from "../../utils/request";
import { ElMessage } from "element-plus";

const userVOTable = ref<UserVO[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(true)

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
  } finally{
    loading.value = false
  }
}

const handlePageChange = (page: number) =>{
  currentPage.value = page
  void getPageUser(page)
}

onMounted(()=>{
  void getPageUser()
})
</script>


<style scoped>
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>