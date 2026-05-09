<template>
  <div class="chart-container">
    <div
      v-if="loading"
      class="loading-wrap"
    >
      <el-icon
        class="loading-icon"
        :size="32"
        ><Loading
      /></el-icon>
      <p>正在加载预约数据...</p>
    </div>

    <div
      v-else-if="noData"
      class="empty-wrap"
    >
      <el-empty description="暂无预约数据" />
    </div>

    <div
      v-else
      ref="chartRef"
      class="chart-box"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, nextTick } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import { Loading } from "@element-plus/icons-vue";
import request from "../../utils/request";
import { useAuthStore } from "../../stores/useAuthStore";

const authStore = useAuthStore();
const chartRef = ref<HTMLDivElement>();
const loading = ref(true);
const noData = ref(false);

onMounted(async () => {
  let dates: string[] = [];
  let status1: number[] = [];
  let status2: number[] = [];
  let status3: number[] = [];

  try {
    const res = await request.get("/getAppointmentChart", {
      params: { enId: authStore.id },
    });
    const data = res.data;

    dates = data.dates ?? [];
    status1 = data.status1 ?? [];
    status2 = data.status2 ?? [];
    status3 = data.status3 ?? [];

    if (dates.length === 0) {
      noData.value = true;
      return;
    }
  } catch {
    ElMessage.error("获取预约图表数据失败");
    noData.value = true;
    return;
  } finally {
    loading.value = false;
  }

  // 必须等 loading 变为 false 后，v-else 区域的 div 才会挂载到 DOM
  await nextTick();
  const chartDom = chartRef.value;
  if (!chartDom) return;

  const chart = echarts.init(chartDom);
  chart.setOption({
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: ["已预约未到场", "已到场", "预约未到场"],
      top: 10,
    },
    grid: {
      left: 50,
      right: 40,
      top: 50,
      bottom: 40,
    },
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: {
        rotate: 30,
        fontSize: 12,
      },
      name: "日期",
    },
    yAxis: {
      type: "value",
      name: "预约人数",
      minInterval: 1,
      axisLabel: {
        fontSize: 12,
      },
    },
    series: [
      {
        name: "已预约未到场",
        type: "bar",
        stack: "total",
        data: status1,
        itemStyle: { color: "#e6a23c" },
        label: {
          show: true,
          fontSize: 12,
          color: "#606266",
        },
      },
      {
        name: "已到场",
        type: "bar",
        stack: "total",
        data: status2,
        itemStyle: { color: "#67c23a" },
        label: {
          show: true,
          fontSize: 12,
          color: "#606266",
        },
      },
      {
        name: "预约未到场",
        type: "bar",
        stack: "total",
        data: status3,
        itemStyle: { color: "#f56c6c" },
        label: {
          show: true,
          fontSize: 12,
          color: "#606266",
        },
      },
    ],
  });

  window.addEventListener("resize", () => chart.resize());
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-box {
  width: 100%;
  height: 100%;
}

.loading-wrap {
  text-align: center;
  color: #6b7280;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.empty-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
