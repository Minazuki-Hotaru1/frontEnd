<template>
  <!-- From Uiverse.io by marcelodolza -->
  <div class="container"></div>

  <form @submit.prevent="handleSubmit">
    <el-card style="max-width: 480px">
      <template #header>
        <div class="card-header">
          <span>注册企业用户账号</span>
        </div>
      </template>
      <el-form-item
        label="注册用户选择"
        class="item1"
      >
        <el-select
          v-model="form.region"
          placeholder="选择您注册的角色"
        >
          <el-option
            label="医院"
            value="101"
          />
          <el-option
            label="停车场"
            value="102"
          />
          <el-option
            label="公园景点"
            value="103"
          />
          <el-option
            label="充电桩停车场"
            value="104"
          />
          <el-option
            label="其他"
            value="105"
          />
        </el-select>
      </el-form-item>
      <div class="wave-group">
        <input
          placeholder=" "
          type="text"
          class="input"
          v-model="form.username"
        />
        <span class="bar"></span>
        <label class="label">
          <span
            class="label-char"
            style="--index: 0"
            >账</span
          >
          <span
            class="label-char"
            style="--index: 1"
            >号</span
          >
        </label>
      </div>
      <div class="wave-group margin-top">
        <input
          placeholder=" "
          type="text"
          class="input"
          v-model="form.password"
        />
        <span class="bar"></span>
        <label class="label">
          <span
            class="label-char"
            style="--index: 0"
            >密</span
          >
          <span
            class="label-char"
            style="--index: 1"
            >码</span
          >
        </label>
      </div>
      <div class="wave-group margin-top">
        <input
          placeholder=" "
          type="text"
          class="input"
          v-model="form.roles"
        />
        <span class="bar"></span>
        <label class="label">
          <span
            class="label-char"
            style="--index: 0"
            >企</span
          >
          <span
            class="label-char"
            style="--index: 1"
            >业</span
          >
          <span
            class="label-char"
            style="--index: 1"
            >名</span
          >
          <span
            class="label-char"
            style="--index: 1"
            >字</span
          >
          <span
            class="label-char"
            style="--index: 1"
            >信</span
          >
          <span
            class="label-char"
            style="--index: 1"
            >息</span
          >
        </label>
      </div>
      <div class="wave-group margin-top">
        <input
          placeholder=" "
          type="text"
          class="input"
          v-model="form.address"
        />
        <span class="bar"></span>
        <label class="label">
          <span
            class="label-char"
            style="--index: 0"
            >企</span
          >
          <span
            class="label-char"
            style="--index: 1"
            >业</span
          >
          <span
            class="label-char"
            style="--index: 1"
            >具</span
          >
          <span
            class="label-char"
            style="--index: 1"
            >体</span
          >
          <span
            class="label-char"
            style="--index: 1"
            >地</span
          >
          <span
            class="label-char"
            style="--index: 1"
            >址</span
          >
        </label>
      </div>

      <template #footer>Footer content</template>
      <!-- From Uiverse.io by KINGFRESS -->
      <button>
        <span class="span-mother">
          <span>点</span>
          <span>击</span>
          <span>注</span>
          <span>册</span>
        </span>
        <span class="span-mother2">
          <span>点</span>
          <span>击</span>
          <span>注</span>
          <span>册</span>
        </span>
      </button>
    </el-card>
  </form>
</template>

<script lang="ts" setup>
import { ArrowLeft } from "@element-plus/icons-vue";
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import request from "../../utils/request";

const form = reactive({
  region: "",
  username: "",
  password: "",
  roles: "",
  address: "",
});

//注册账号
const handleSubmit = async () => {
  if (form.region === "") {
    ElMessage.error("请选择企业角色");
    return;
  }
  if (form.username === "" || form.password === "") {
    ElMessage.error("请输入账号和密码");
    return;
  }
  if (form.address === "") {
    ElMessage.error("请输入企业名字信息");
  }
  if (form.address === "") {
    ElMessage.error("请输入企业具体地址");
  }

  try {
    const res = await request.post("/EnRegistration", {
      typeID: form.region,
      username: form.username,
      password: form.password,
      roles: form.roles,
      address: form.address,
    });
    if (res.data.success) {
      ElMessage.success(res.data.message);
      return;
    } else {
      ElMessage.error(res.data.message);
      return;
    }
  } catch {
    ElMessage.error("请求失败，请检查后端服务是否启动");
  }
};
</script>

<style scoped>
/* From Uiverse.io by AbanoubMagdy1 */
.wave-group {
  position: relative;
}

.wave-group .input {
  font-size: 16px;
  padding: 10px 10px 10px 5px;
  display: block;
  width: 200px;
  border: none;
  border-bottom: 1px solid #515151;
  background: transparent;
}

.wave-group .input:focus {
  outline: none;
}

.wave-group .label {
  color: #999;
  font-size: 18px;
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 5px;
  top: 10px;
  display: flex;
}

.wave-group .label-char {
  transition: 0.2s ease all;
  transition-delay: calc(var(--index) * 0.05s);
}

.wave-group .input:focus ~ label .label-char,
.wave-group .input:not(:placeholder-shown) ~ label .label-char {
  transform: translateY(-20px);
  font-size: 14px;
  color: #5264ae;
}

.wave-group .bar {
  position: relative;
  display: block;
  width: 200px;
}

.wave-group .bar:before,
.wave-group .bar:after {
  content: "";
  height: 2px;
  width: 0;
  bottom: 1px;
  position: absolute;
  background: #5264ae;
  transition: 0.2s ease all;
  -moz-transition: 0.2s ease all;
  -webkit-transition: 0.2s ease all;
}

.wave-group .bar:before {
  left: 50%;
}

.wave-group .bar:after {
  right: 50%;
}

.wave-group .input:focus ~ .bar:before,
.wave-group .input:focus ~ .bar:after {
  width: 50%;
}

.margin-top {
  margin-top: 20px;
}

/* 背景  */
.container {
  z-index: -2;
  position: fixed;
  width: 100%;
  height: 100%;
  --s: 100px;
  /* control the size */
  --c1: #f8b195;
  --c2: #355c7d;

  --_g:
    var(--c2) 4% 14%, var(--c1) 14% 24%, var(--c2) 22% 34%, var(--c1) 34% 44%,
    var(--c2) 44% 56%, var(--c1) 56% 66%, var(--c2) 66% 76%, var(--c1) 76% 86%,
    var(--c2) 86% 96%;
  background:
    radial-gradient(
      100% 100% at 100% 0,
      var(--c1) 4%,
      var(--_g),
      #0008 96%,
      #0000
    ),
    radial-gradient(
        100% 100% at 0 100%,
        #0000,
        #0008 4%,
        var(--_g),
        var(--c1) 96%
      )
      var(--c1);
  background-size: var(--s) var(--s);
}

/* 按钮组件 */
/* From Uiverse.io by NorthFishHasNa */
/* From Uiverse.io by KINGFRESS */
button {
  margin-top: 15px;
  font-weight: bold;
  color: white;
  border-radius: 2rem;
  cursor: pointer;
  width: 95.02px;
  height: 42.66px;
  border: none;
  background-color: #3653f8;
  display: flex;
  justify-content: center;
  align-items: center;
}

button .span-mother {
  display: flex;
  overflow: hidden;
}

button:hover .span-mother {
  position: absolute;
}

button:hover .span-mother span {
  transform: translateY(1.2em);
}

button .span-mother span:nth-child(1) {
  transition: 0.2s;
}

button .span-mother span:nth-child(2) {
  transition: 0.3s;
}

button .span-mother span:nth-child(3) {
  transition: 0.4s;
}

button .span-mother span:nth-child(4) {
  transition: 0.5s;
}

button .span-mother span:nth-child(5) {
  transition: 0.6s;
}

button .span-mother span:nth-child(6) {
  transition: 0.7s;
}

button .span-mother2 {
  display: flex;
  position: absolute;
  overflow: hidden;
}

button .span-mother2 span {
  transform: translateY(-1.2em);
}

button:hover .span-mother2 span {
  transform: translateY(0);
}

button .span-mother2 span {
  transition: 0.2s;
}

button .span-mother2 span:nth-child(2) {
  transition: 0.3s;
}

button .span-mother2 span:nth-child(3) {
  transition: 0.4s;
}

button .span-mother2 span:nth-child(4) {
  transition: 0.5s;
}

button .span-mother2 span:nth-child(5) {
  transition: 0.6s;
}

button .span-mother2 span:nth-child(6) {
  transition: 0.7s;
}
</style>
