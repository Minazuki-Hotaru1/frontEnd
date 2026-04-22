<template>
  <div class="container">
    <div class="bg"></div>
    <div class="content">
      <router-view />
    </div>

    <div class="heading">登录账号</div>
    <form class="form" @submit.prevent="handleSubmit">
      <el-form-item label="登录用户选择" class="item1">
        <el-select v-model="form.region" placeholder="选择您登陆的角色">
          <el-option label="管理员用户" value="user1" />
          <el-option label="企业用户" value="user2" />
          <el-option label="普通用户" value="user3" />
        </el-select>
      </el-form-item>
      <div class="input-field">
        <input id="username" v-model="username" autocomplete="on" type="text" name="username" placeholder=" " />
        <label for="username">Full Name</label>
      </div>

      <div class="input-field">
        <input id="password" v-model="password" autocomplete="on" type="password" name="password" placeholder=" " />
        <label for="password">Password</label>
      </div>

      <div class="btn-container">
        <button class="btn" type="submit">登录</button>
        <div class="acc-text">
          新用户？
          <a class="register-link" plain @click="dialogFormVisible = true">点击这里注册账号</a>
        </div>
      </div>
    </form>

    <el-dialog v-model="dialogFormVisible" title="注册为普通用户" width="500">
      <el-form :model="form">
        <el-form-item label="账户" :label-width="formLabelWidth">
          <el-input v-model="form.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth">
          <el-input v-model="form.password" autocomplete="off" />
        </el-form-item>
        <el-form-item label="具体住址" :label-width="formLabelWidth">
          <el-input v-model="form.address" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-for="button in buttons" :key="button.text" :type="button.type" link @click="goToEnRegistration">
            {{ button.text }}
          </el-button>
          <el-button @click="dialogFormVisible = false">关闭</el-button>
          <el-button type="primary" @click="userRegister">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-button @click="gotoMap">test</el-button>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue"
import { ElMessage } from "element-plus"
import { useRouter } from "vue-router"
import request from "../../utils/request"

const username = ref("")
const password = ref("")
const router = useRouter()

const dialogFormVisible = ref(false)
const formLabelWidth = '140px'

const form = reactive({
  region: "",
  delivery: false,
  username: '',
  password: '',
  address: ''
})

const gotoTest = () => {
  router.push("/test")
}

const gotoMap = () => {
  router.push("/map")
}


//企业用户注册
const buttons = [
  { type: 'primary', text: '企业用户点击这里注册' }
]
const goToEnRegistration = () => {
  window.open("/EnRegistration")
}


const handleSubmit = async () => {
  if (username.value.trim() === "" || password.value.trim() === "") {
    ElMessage.error("请输入账号和密码")
    return
  }
  if (form.region === "") {
    ElMessage.error("请选择您登录的角色")
    return
  }

  try {
    const res = await request.post("/login", {
      userType: form.region,
      username: username.value,
      password: password.value,
    })

    if (res.data.success) {
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("username", res.data.username)
      ElMessage.success("登录成功")
      switch (form.region) {
        case 'user1':
          router.push("/admin")
          return
        case 'user2':
          router.push("/home")
          return
      }
    }

    ElMessage.error(res.data.message || "用户名或密码错误")
  } catch {
    ElMessage.error("请求失败，请检查后端服务是否启动")
  }
}

//普通用户注册
const userRegister = async () => {
  if (form.username == "") {
    ElMessage.error("请输入账号")
    return
  }
  if (form.password == "") {
    ElMessage.error("请输入密码")
    return
  }
  if (form.address == "") {
    ElMessage.error("请输入地址信息")
    return
  }

  try {
    const res = await request.post("/userRegister", {
      username: form.username,
      password: form.password,
      address: form.address,
    })

    if (res.data.success) {
      ElMessage.success("账号注册成功")
      dialogFormVisible.value = false
      return
    }
    ElMessage.error(res.data.message)
  } catch {
    ElMessage.error("注册失败，请检查后端接口")
  }
}
</script>

<style scoped>
.item1 {
  width: 300px;
}

.container {
  border: solid 1px #8d8d8d;
  padding: 20px;
  border-radius: 20px;
  background-color: #fff;
}

.container .heading {
  font-size: 1.3rem;
  margin-bottom: 20px;
  font-weight: bolder;
}

.form {
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form .btn-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
}

.form .btn {
  padding: 10px 20px;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  border-radius: 10px;
  border: solid 1px #1034aa;
  border-bottom: solid 1px #90c2ff;
  background: linear-gradient(135deg, #0034de, #006eff);
  color: #fff;
  font-weight: bolder;
  transition: all 0.2s ease;
  box-shadow: 0px 2px 3px #000d3848, inset 0px 4px 5px #0070f0,
    inset 0px -4px 5px #002cbb;
}

.form .btn:active {
  box-shadow: inset 0px 4px 5px #0070f0, inset 0px -4px 5px #002cbb;
  transform: scale(0.995);
}

.input-field {
  position: relative;
}

.input-field label {
  position: absolute;
  top: 50%;
  left: 15px;
  color: #8d8d8d;
  pointer-events: none;
  background-color: #fff;
  transform: translateY(-50%);
  transition: all 0.3s ease;
  line-height: 1;
}

.input-field input {
  padding: 10px 15px;
  font-size: 1rem;
  border-radius: 8px;
  border: solid 1px #8d8d8d;
  letter-spacing: 1px;
  width: 100%;
  box-sizing: border-box;
}

.input-field input:focus,
.input-field input:valid {
  outline: none;
  border: solid 1px #0034de;
}

.input-field input::placeholder {
  color: transparent;
}

.input-field input:focus~label,
.input-field input:not(:placeholder-shown)~label {
  top: 0;
  transform: translateY(-50%) translateX(-10px) scale(0.8);
  background-color: #fff;
  padding: 0 5px;
  color: #0034de;
  font-weight: bold;
  letter-spacing: 1px;
  border: none;
  border-radius: 100px;
}

.form .passicon {
  cursor: pointer;
  font-size: 1.3rem;
  position: absolute;
  top: 6px;
  right: 8px;
}

.form .close {
  display: none;
}

.register-link {
  color: #0000ff;
  cursor: pointer;
}
</style>

<style scoped>
.bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background-size: cover;
  filter: blur(5px) brightness(0.8);
}

.content {
  position: relative;
  z-index: 1;
}
</style>
