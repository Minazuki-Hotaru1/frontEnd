<template>
  <el-button @click="getPageUser">111</el-button>
</template>

<script lang="ts" setup>

import { ref } from "vue"
import type { UserVO } from "../../types/UserVO";
import request from "../../utils/request";

const userVOTable = ref<UserVO[]>([])

const getPageUser = async () =>{
  const res = await request.get("/getAllUserPage",{
    params:{
      page: 1,
      number: 10
    }
  })
  userVOTable.value = res.data
  console.log(userVOTable);
  
}

</script>

<style>

</style>