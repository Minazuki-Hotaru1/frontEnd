<template>
  <div class="map-page-container">
    <el-amap ref="map" :min-zoom="10" :max-zoom="22" :center="center" :zoom="zoom">
        <slot>插入其他界面的组件</slot>
    </el-amap>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { ElAmap, ElAmapInfoWindow } from "@vuemap/vue-amap";

const center = ref([102.71004467423104, 25.04561322999556])
const zoom = ref(12)


</script>

<style scoped>
.map-page-container {
  width: auto;
  height: 800px;
}
</style>
