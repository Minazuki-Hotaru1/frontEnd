<template>
  <div class="home">
    <h1>登录成功</h1>
    <p v-if="username">当前用户：{{ username }}</p>
    <button type="button" @click="logout">退出登录</button>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage } from "element-plus"
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import request from "../../utils/request"

const username = ref("")
const router = useRouter()

const loadProfile = async () => {
  try {
    const res = await request.get("/me")
    username.value = res.data.username
  } catch {
    ElMessage.error("登录状态已失效，请重新登录")
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    router.push("/")
  }
}

const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("username")
  ElMessage.success("已退出登录")
  router.push("/")
}

onMounted(() => {
  void loadProfile()
})
</script>

<style scoped>
.home {
  padding: 40px;
}

button {
  margin-top: 16px;
  padding: 8px 16px;
  cursor: pointer;
}
</style>
