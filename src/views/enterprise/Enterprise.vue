<template>

  <el-menu :default-active="activeMenu" class="menu" @select="handleSelect">
    <el-menu-item index="appointmentUser">
      <el-icon>
        <Document />
      </el-icon>
      <span>预约用户</span>
    </el-menu-item>

    <el-button @click="logout">logout</el-button>

  </el-menu>
  <h1>111</h1>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue"
import { ElMessage } from "element-plus"
import { useAuthStore } from "../../stores/useAuthStore"
import { useRouter } from "vue-router"


const router = useRouter()
const handleSelect = null
const activeMenu = ref("appointmentUser")
const authStore = useAuthStore()

const logout = () =>{
  console.log(authStore.id);
  
  
  // authStore.clearAuthData()
  // ElMessage.success("登出成功")
  // router.push("/")
}

onMounted(() => {
})

</script>

<style></style>