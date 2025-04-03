<script setup>
import { reactive } from 'vue';
import { userLogin } from '@/utils/userUtils.js';
import { useJumpToPath } from '@/utils/routerUtils.js';
const form = reactive({
  username: '',
  password: '',
  remember: true,
});
const { jumpToPath } = useJumpToPath();
const onFinish = async () => {
  console.log('Success:', form.valueOf());
  try {
    await userLogin(form.username, form.password);
    await jumpToPath('/adminHome');
  } catch (error) {
    console.log(error);
  }
};
const onFinishFailed = errorInfo => {
  console.log('Failed:', errorInfo);
};
</script>

<template>
  <div class="page-container">
    <div class="login-container">
      <a-form
          :model="form"
          name="basic"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
          autocomplete="off"
          @finish="onFinish"
          @finishFailed="onFinishFailed"
      >
        <a-form-item
            label="Username"
            name="username"
            :rules="[{ required: true, message: 'Please input your username!' }]"
        >
          <a-input v-model:value="form.username" placeholder="Enter your username" autocomplete="username"/>
        </a-form-item>

        <a-form-item
            label="Password"
            name="password"
            :rules="[{ required: true, message: 'Please input your password!' }]"
        >
          <a-input-password v-model:value="form.password" placeholder="Enter your password" autocomplete="current-password" />
        </a-form-item>

        <a-form-item name="remember" :wrapper-col="{ offset: 8, span: 16 }">
          <a-checkbox v-model:checked="form.remember">Remember me</a-checkbox>
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
          <a-button type="primary" html-type="submit" block>Login</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  background-color: #f0f2f5; /* 设置整体页面的背景色 */
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-container {
  width: 400px;
  padding: 30px;
  background: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-family: 'Arial', sans-serif;
}

a-form-item label {
  font-weight: 600;
  font-size: 14px;
}

a-input,
a-input-password {
  border-radius: 5px;
  height: 40px;
}

a-checkbox {
  font-size: 14px;
}

a-button {
  height: 40px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
}

a-button[type="primary"] {
  background-color: #4CAF50;
  border-color: #4CAF50;
}

a-button[type="primary"]:hover {
  background-color: #45a049;
  border-color: #45a049;
}
</style>
