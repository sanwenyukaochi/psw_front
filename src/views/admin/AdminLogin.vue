<script setup>
import { reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { adminLogin } from '@/utils/userUtils.js';

// 状态管理
const loading = ref(false);
const form = reactive({
  username: '',
  password: '',
  remember: true,
});

const router = useRouter();

// 表单校验规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度必须在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' }
  ]
};

// 处理登录
const handleLogin = async (values) => {
  try {
    loading.value = true;
    await adminLogin(values.username, values.password);
    
    // 记住用户名
    if (form.remember) {
      localStorage.setItem('adminUsername', values.username);
    } else {
      localStorage.removeItem('adminUsername');
    }
    
    message.success('登录成功');
    await router.push('/mainList');
  } catch (error) {
    console.error('登录失败:', error);
    message.error(error.message || '登录失败，请检查用户名和密码');
  } finally {
    loading.value = false;
  }
};

// 处理登录失败
const handleLoginFailed = (errorInfo) => {
  console.error('表单验证失败:', errorInfo);
  message.error('请检查输入信息是否正确');
};

// 初始化时，如果有记住的用户名则自动填充
if (localStorage.getItem('adminUsername')) {
  form.username = localStorage.getItem('adminUsername');
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>宠物商城管理系统</h1>
        <p>欢迎回来，请登录您的账号</p>
      </div>
      
      <a-form
        :model="form"
        name="loginForm"
        :rules="rules"
        @finish="handleLogin"
        @finishFailed="handleLoginFailed"
        class="login-form"
      >
        <a-form-item name="username">
          <a-input
            v-model:value="form.username"
            size="large"
            placeholder="请输入用户名"
            autocomplete="username"
          >
            <template #prefix>
              <user-outlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="password">
          <a-input-password
            v-model:value="form.password"
            size="large"
            placeholder="请输入密码"
            autocomplete="current-password"
          >
            <template #prefix>
              <lock-outlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-checkbox v-model:checked="form.remember" class="remember-checkbox">
            记住账号
          </a-checkbox>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
            class="login-button"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>

      <div class="login-footer">
        <p>请使用管理员账号登录系统</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  /* background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%); */
  background-image: url('@/assets/img/psw/1.jpeg'); /* 使用背景图片 */
  background-size: cover;
  background-position: center;
}

.login-container {
  width: 400px;
  padding: 40px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 28px;
  color: #1677ff;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-form :deep(.ant-input-affix-wrapper) {
  height: 40px;
  padding: 8px 11px;
}

.login-form :deep(.ant-input-prefix) {
  color: #bfbfbf;
  margin-right: 10px;
}

.remember-checkbox {
  color: #666;
}

.login-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.login-footer {
  text-align: center;
  color: #666;
  font-size: 14px;
}

/* 移动端适配 */
@media screen and (max-width: 576px) {
  .login-container {
    width: 90%;
    padding: 20px;
    margin: 20px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .login-header p {
    font-size: 14px;
  }
}
</style>
