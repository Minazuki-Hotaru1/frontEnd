<template>
  <MapContainer> </MapContainer>
</template>

<script lang="ts" setup>
import request from "../../utils/request";
import MapContainer from "../login/MapContainer.vue";
import { onMounted, ref } from "vue";

const EnList = ref([]);

const getAllEnList = async () => {
  const res = await request.get("/userGetAllEn");
  EnList.value = res.data ?? [];
};

onMounted(() => {
  void getAllEnList;
});
</script>

<style></style>
