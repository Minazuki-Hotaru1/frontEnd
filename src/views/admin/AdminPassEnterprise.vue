<template>
  <div class="admin-page">
    <el-table v-loading="loading" :data="tableData" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="账号" min-width="80" />
      <el-table-column prop="password" label="密码" min-width="80" />
      <el-table-column prop="roleName" label="企业类型" min-width="100" />

      <el-table-column prop="address" label="企业地址" min-width="180">
        <template #default="scope">
          <el-link type="primary" @click="openAddressDialog(scope.row.address)">
            <el-tooltip
              class="box-item"
              effect="dark"
              content="点击查看地址经纬度信息"
              placement="top"
            >
              <span>{{ scope.row.address }}</span>
            </el-tooltip>
          </el-link>
        </template>
      </el-table-column>

      <el-table-column prop="roles" label="企业名称" min-width="140" />

      <el-table-column prop="haveSeeIt" label="企业用户状态" width="130">
        <template #default="{ row }">
          <span :class="statusMap[row.haveSeeIt]?.class">
            {{ statusMap[row.haveSeeIt]?.text || "未知状态" }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="操作按钮" width="120">
        <template #default="scope">
          <el-button plain type="success" class="button1" @click="openPassConfirmDialog(scope.row)">
            确认
          </el-button>
          <br />
          <el-button plain type="danger" class="button1" @click="openUnPassConfirmDialog(scope.row)">
            不通过
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

    <el-dialog v-model="clickAddress" title="地址详细信息" width="460" align-center>
      <div class="address-card">
        <div class="address-card__row">
          <span class="label">纬度</span>
          <span class="value">{{ lat || "暂无数据" }}</span>
        </div>
        <div class="address-card__row">
          <span class="label">经度</span>
          <span class="value">{{ long || "暂无数据" }}</span>
        </div>
        <div class="address-card__row">
          <span class="label">匹配度</span>
          <span class="value">{{ scoreText }}</span>
        </div>

        <div class="score-banner" :class="scoreClass">
          {{ scoreTip }}
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="buttonVisiblePass" title="审核确认" width="420" align-center>
      <div class="confirm-dialog">
        <p>确认通过该企业用户申请吗？</p>
        <p v-if="selectedRow"><strong>企业名称：</strong>{{ selectedRow.roles }}</p>
        <p v-if="selectedRow"><strong>账号：</strong>{{ selectedRow.username }}</p>
      </div>

      <template #footer>
        <el-button @click="buttonVisiblePass = false">取消</el-button>
        <el-button type="success" @click="enterprisePass(selectedRow?.id)">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="buttonVisibleUnPass" title="审核确认" width="420" align-center>
      <div class="confirm-dialog">
        <p>确认<strong>不通过</strong>该企业用户申请吗？</p>
        <p v-if="selectedRow"><strong>企业名称：</strong>{{ selectedRow.roles }}</p>
        <p v-if="selectedRow"><strong>账号：</strong>{{ selectedRow.username }}</p>
      </div>

      <template #footer>
        <el-button @click="buttonVisibleUnPass = false">取消</el-button>
        <el-button type="danger" @click="enterpriseUnPass(selectedRow)">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { ElMessage } from "element-plus"
import request from "../../utils/request"

const clickAddress = ref(false)

interface ConfirmItem {
  id: number
  username: string
  password: string
  address: string
  typeID: string
  roleName: string
  roles: string
  haveSeeIt: string
}

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref<ConfirmItem[]>([])
const lat = ref("")
const long = ref("")
const score = ref<number | null>(null)
const buttonVisiblePass = ref(false)
const buttonVisibleUnPass = ref(false)
const selectedRow = ref<ConfirmItem | null>(null)

const statusMap: Record<string, { text: string; class: string }> = {
  "1": { text: "未查看", class: "status-unseen" },
  "2": { text: "已查看", class: "status-seen" },
  "3": { text: "已处理", class: "status-done" },
  "4": { text: "已拒绝", class: "status-reject" },
}

const scoreText = computed(() => {
  return score.value === null ? "暂无数据" : `${score.value} 分`
})

const scoreClass = computed(() => {
  if (score.value === null) return "score-unknown"
  if (score.value < 60) return "score-low"
  if (score.value < 80) return "score-medium"
  return "score-high"
})

const scoreTip = computed(() => {
  if (score.value === null) return "暂未获取到匹配度信息"
  if (score.value < 60) return "匹配度较低，请人工重点核对地址准确性"
  if (score.value < 80) return "匹配度一般，建议结合企业提交信息再次确认"
  return "匹配度较高，可作为较可靠的地址参考"
})

const getLatAndLong = async (address: string) => {
  const res = await request.get("/getAddressLatAndLong", {
    params: {
      address,
    },
  })

  lat.value = res.data.lat ?? ""
  long.value = res.data.lng ?? ""
  score.value = typeof res.data.score === "number" ? res.data.score : Number(res.data.score ?? 0)
}

const openAddressDialog = async (address: string) => {
  try {
    await getLatAndLong(address)
    clickAddress.value = true
  } catch {
    ElMessage.error("经纬度获取失败，请检查后端接口")
  }
}

const canAudit = async (id: number) => {
  const res = await request.get("/getOneConfirm", {
    params: {
      id,
    },
  })

  const latestStatus = res.data.haveSeeIt
  if (latestStatus === "3" || latestStatus === "4") {
    ElMessage.error("该用户已完成审核，请勿重复点击")
    return false
  }

  return latestStatus === "1" || latestStatus === "2"
}

const openPassConfirmDialog = async (row: ConfirmItem) => {
  selectedRow.value = row
  const pass = await canAudit(row.id)
  if (!pass) return
  buttonVisiblePass.value = true
}

const openUnPassConfirmDialog = async (row: ConfirmItem) => {
  selectedRow.value = row
  const pass = await canAudit(row.id)
  if (!pass) return
  buttonVisibleUnPass.value = true
}

const fetchConfirmList = async (page = currentPage.value) => {
  loading.value = true

  try {
    const res = await request.get("/getConfirm", {
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
  void fetchConfirmList(page)
}

const enterprisePass = async (id?: number) => {
  if (!id) return

  const res = await request.get("/approved", {
    params: {
      id,
    },
  })

  if (res.data.success) {
    ElMessage.success("用户审核成功")
    buttonVisiblePass.value = false
    if (selectedRow.value) selectedRow.value.haveSeeIt = "3"
    await fetchConfirmList(currentPage.value)
  } else {
    ElMessage.error(res.data.message)
  }
}

const enterpriseUnPass = async (row: ConfirmItem | null) => {
  if (!row) return

  const res = await request.get("/unApproved", {
    params: {
      id: row.id,
    },
  })

  if (res.data.success) {
    ElMessage.success("用户审核成功")
    buttonVisibleUnPass.value = false
    row.haveSeeIt = "4"
    await fetchConfirmList(currentPage.value)
  } else {
    ElMessage.error(res.data.message)
  }
}

onMounted(() => {
  void fetchConfirmList()
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

.button1 {
  width: 76px;
  margin-bottom: 8px;
}

.address-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;
}

.address-card__row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.address-card__row .label {
  color: #6b7280;
  font-size: 14px;
}

.address-card__row .value {
  color: #111827;
  font-size: 14px;
  font-weight: 600;
  text-align: right;
}

.score-banner {
  margin-top: 8px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid transparent;
}

.score-low {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

.score-medium {
  background: #fff7ed;
  color: #c2410c;
  border-color: #fed7aa;
}

.score-high {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}

.score-unknown {
  background: #f3f4f6;
  color: #4b5563;
  border-color: #d1d5db;
}

.confirm-dialog p {
  margin: 10px 0;
  color: #374151;
}

.status-unseen {
  color: #f59e0b;
}

.status-seen {
  color: #3b82f6;
}

.status-done {
  color: #10b981;
}

.status-reject {
  color: #ef4444;
}
</style>
