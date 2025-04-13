<script setup>
import { reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import AuthApi from "@/api/auth/authApi.js";
import { encryptPassword } from '@/utils/userUtils.js';

// 状态管理
const loading = ref(false);
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
});

const router = useRouter();

// 确认密码验证器
const validateConfirmPassword = (_rule, value) => {
  if (value === '') {
    return Promise.reject('请再次输入密码');
  } else if (value !== form.password) {
    return Promise.reject('两次输入的密码不一致');
  } else {
    return Promise.resolve();
  }
};

// 表单校验规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度必须在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
};

// 处理注册
const handleRegister = async (values) => {
  try {
    loading.value = true;
    
    // 1. 获取 RSA 公钥
    const pkResponse = await AuthApi.getRsaPublicKey();
    if (pkResponse.code !== '0' || !pkResponse.data) {
      throw new Error('获取加密密钥失败');
    }
    const rsaPk = pkResponse.data;
    
    // 2. 加密密码
    const encryptedPassword = encryptPassword(values.password, rsaPk);
    
    // 3. 调用注册 API
    const registerParams = {
      username: values.username,
      password: encryptedPassword,
    };
    const registerResponse = await AuthApi.register(registerParams);
    
    // 4. 处理注册结果
    if (registerResponse.code !== '0') {
      throw new Error(registerResponse.message || '注册失败');
    }
    
    message.success('注册成功！即将跳转到登录页面。');
    setTimeout(() => {
      router.push('/userLogin');
    }, 1500);
    
  } catch (error) {
    console.error('注册失败:', error);
    message.error(error.message || '注册失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 处理注册失败
const handleRegisterFailed = (errorInfo) => {
  console.error('表单验证失败:', errorInfo);
  message.error('请检查输入信息是否正确');
};

// 处理返回登录
const handleGoToLogin = () => {
  router.push('/userLogin');
};

</script>

<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1>创建新账户</h1>
        <p>加入我们，开启宠物购物之旅</p>
      </div>
      
      <a-form
        :model="form"
        name="registerForm"
        :rules="rules"
        @finish="handleRegister"
        @finishFailed="handleRegisterFailed"
        class="register-form"
      >
        <a-form-item name="username">
          <a-input
            v-model:value="form.username"
            size="large"
            placeholder="请输入用户名 (3-20字符)"
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
            placeholder="请输入密码 (6-20字符)"
            autocomplete="new-password"
          >
            <template #prefix>
              <lock-outlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item name="confirmPassword">
          <a-input-password
            v-model:value="form.confirmPassword"
            size="large"
            placeholder="请再次输入密码"
            autocomplete="new-password"
          >
            <template #prefix>
              <lock-outlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
            class="register-button"
          >
            注册
          </a-button>
        </a-form-item>
      </a-form>

      <div class="register-footer">
        <p>已有账户？ <a class="login-link" @click="handleGoToLogin">立即登录</a></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  /* background: linear-gradient(135deg, #69c0ff 0%, #1677ff 100%); */
  background-image: url('@/assets/img/psw/3.png'); /* 使用背景图片 */
  background-size: cover;
  background-position: center;
}

.register-container {
  width: 400px;
  padding: 40px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.register-header h1 {
  font-size: 28px;
  color: #1677ff;
  margin-bottom: 8px;
}

.register-header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.register-form {
  margin-bottom: 24px;
}

.register-form :deep(.ant-input-affix-wrapper) {
  height: 40px;
  padding: 8px 11px;
}

.register-form :deep(.ant-input-prefix) {
  color: #bfbfbf;
  margin-right: 10px;
}

.register-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.register-footer {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.login-link {
  color: #1677ff;
  cursor: pointer;
}

.login-link:hover {
  text-decoration: underline;
}

.register-form :deep(.ant-form-item) {
  margin-bottom: 24px;
}

.register-form :deep(.ant-form-item-explain-error) {
  font-size: 14px;
  margin-top: 4px;
  color: #ff4d4f;
}

.register-form :deep(.ant-input-affix-wrapper-status-error) {
  border-color: #ff4d4f;
}

.register-form :deep(.ant-form-item-has-error .ant-input-prefix) {
  color: #ff4d4f;
}

/* 移动端适配 */
@media screen and (max-width: 576px) {
  .register-container {
    width: 90%;
    padding: 20px;
    margin: 20px;
  }

  .register-header h1 {
    font-size: 24px;
  }

  .register-header p {
    font-size: 14px;
  }
}
</style>