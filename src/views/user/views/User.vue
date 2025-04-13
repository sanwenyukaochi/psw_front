<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message, Upload, Select, InputNumber } from 'ant-design-vue';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EditOutlined, 
  SaveOutlined, 
  CloseOutlined, 
  UploadOutlined,
  IdcardOutlined, // For User ID
  ManOutlined,    // For Sex
  TeamOutlined,   // For Role
  FieldNumberOutlined // For Age
} from '@ant-design/icons-vue';
import userApi from '@/api/user/user.js';

// 状态管理
const loading = ref(false);
const saving = ref(false);
const editMode = ref(false);
const userData = ref(null);
const editData = reactive({ // Ensure all editable fields are here
  username: '',
  email: '',
  phone: '',
  sex: '',
  age: null
});
const avatarFileList = ref([]);

// 获取用户信息
const fetchUserData = async () => {
  try {
    loading.value = true;
    const response = await userApi.getUser();
    if (response.code === '0' && response.data) {
      userData.value = response.data;
      // 初始化编辑数据 - 只包含可编辑的字段
      editData.username = response.data.username;
      editData.email = response.data.email;
      editData.phone = response.data.phone;
      editData.sex = response.data.sex;
      editData.age = response.data.age;
      
      if (response.data.avatar) {
        avatarFileList.value = [
          {
            uid: '-1',
            name: 'avatar.png',
            status: 'done',
            url: response.data.avatar,
          },
        ];
      }
    } else {
      message.error(response.message || '获取用户信息失败');
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    message.error('获取用户信息失败');
  } finally {
    loading.value = false;
  }
};

// 切换编辑模式
const toggleEditMode = () => {
  if (!editMode.value) {
    // 进入编辑模式时，用当前数据填充编辑数据
    editData.username = userData.value.username;
    editData.email = userData.value.email;
    editData.phone = userData.value.phone;
    editData.sex = userData.value.sex;
    editData.age = userData.value.age;
  }
  editMode.value = !editMode.value;
};

// 保存用户信息
const handleSave = async () => {
  try {
    saving.value = true;
    // 构造需要更新的数据 (editData 已经包含了所有可编辑字段)
    const response = await userApi.updateUser(editData);
    if (response.code === '0') {
      message.success('用户信息更新成功');
      // 更新本地显示的 userData，只更新修改过的字段
      userData.value = { ...userData.value, ...editData }; 
      editMode.value = false;
    } else {
      message.error(response.message || '更新用户信息失败');
    }
  } catch (error) {
    console.error('更新用户信息失败:', error);
    message.error('更新用户信息失败');
  } finally {
    saving.value = false;
  }
};

// 取消编辑
const handleCancel = () => {
  editMode.value = false;
};

// 头像上传前校验
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('只能上传图片文件!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!');
  }
  return isImage && isLt2M;
};

// 自定义头像上传
const customRequest = async ({ file, onSuccess, onError }) => {
  try {
    const response = await userApi.uploadAvatar(file);
    if (response.code === '0' && response.data) {
      message.success('头像上传成功');
      
      // 创建新对象来更新 userData ref，确保响应式更新
      userData.value = { 
        ...userData.value, 
        avatar: response.data 
      };
      
      avatarFileList.value = [
        {
          uid: file.uid,
          name: file.name,
          status: 'done',
          url: response.data, // 使用后端返回的新 URL
        },
      ];
      onSuccess(response.data);
    } else {
      message.error(response.message || '头像上传失败');
      onError(new Error(response.message || '上传失败'));
    }
  } catch (error) {
    console.error('头像上传失败:', error);
    message.error('头像上传失败');
    onError(error);
  }
};

// 初始化
onMounted(() => {
  fetchUserData();
});

</script>

<template>
  <div class="user-profile-page">
    <div class="profile-container">
      <a-card title="个人中心" :loading="loading">
        <template #extra>
          <a-space v-if="!editMode">
            <a-button type="primary" @click="toggleEditMode">
              <template #icon><edit-outlined /></template>
              编辑资料
            </a-button>
          </a-space>
          <a-space v-else>
            <a-button @click="handleCancel">
              <template #icon><close-outlined /></template>
              取消
            </a-button>
            <a-button type="primary" @click="handleSave" :loading="saving">
              <template #icon><save-outlined /></template>
              保存
            </a-button>
          </a-space>
        </template>

        <div v-if="userData" class="profile-content">
          <div class="avatar-section">
            <a-avatar :size="128" :src="typeof userData.avatar === 'string' ? userData.avatar : undefined">
              <template #icon><user-outlined /></template>
            </a-avatar>
            <div class="avatar-upload" v-if="editMode">
              <a-upload
                v-model:file-list="avatarFileList"
                name="avatar"
                list-type="picture-card"
                class="avatar-uploader"
                :show-upload-list="false"
                :before-upload="beforeAvatarUpload"
                :customRequest="customRequest"
              >
                <div>
                  <upload-outlined />
                  <div style="margin-top: 8px">更换头像</div>
                </div>
              </a-upload>
               <p class="upload-tip">支持 JPG/PNG, 小于 2MB</p>
            </div>
          </div>

          <a-descriptions bordered :column="{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }" class="info-section">
             <a-descriptions-item>
                <template #label>
                  <idcard-outlined /> 用户ID
                </template>
                <span>{{ userData.userId }}</span>
             </a-descriptions-item>

             <a-descriptions-item>
                <template #label>
                  <user-outlined /> 用户名
                </template>
                <span v-if="!editMode">{{ userData.username }}</span>
                <a-input v-else v-model:value="editData.username" placeholder="请输入用户名" />
             </a-descriptions-item>
             
             <a-descriptions-item>
                <template #label>
                  <man-outlined /> 性别
                </template>
                <span v-if="!editMode">{{ userData.sex || '-' }}</span>
                 <a-select v-else v-model:value="editData.sex" placeholder="请选择性别" style="width: 120px">
                    <a-select-option value="男">男</a-select-option>
                    <a-select-option value="女">女</a-select-option>
                    <a-select-option value="保密">保密</a-select-option> 
                 </a-select>
             </a-descriptions-item>
             
             <a-descriptions-item>
                <template #label>
                  <field-number-outlined /> 年龄
                </template>
                <span v-if="!editMode">{{ userData.age !== null ? userData.age : '-' }}</span>
                 <a-input-number v-else v-model:value="editData.age" :min="0" :max="150" placeholder="请输入年龄" style="width: 120px" />
             </a-descriptions-item>

            <a-descriptions-item>
              <template #label>
                <mail-outlined /> 邮箱
              </template>
              <span v-if="!editMode">{{ userData.email || '-' }}</span>
              <a-input v-else v-model:value="editData.email" placeholder="请输入邮箱" />
            </a-descriptions-item>

            <a-descriptions-item>
               <template #label>
                 <phone-outlined /> 手机号
               </template>
              <span v-if="!editMode">{{ userData.phone || '-' }}</span>
              <a-input v-else v-model:value="editData.phone" placeholder="请输入手机号" />
            </a-descriptions-item>
            
             <a-descriptions-item>
               <template #label>
                 <team-outlined /> 角色
               </template>
               <span>{{ userData.role?.role || '-' }}</span>
            </a-descriptions-item>
            
            <!-- 其他不可编辑字段可以继续添加 -->

          </a-descriptions>
        </div>
         <a-empty v-else-if="!loading" description="无法加载用户信息" />
      </a-card>
    </div>
  </div>
</template>

<style scoped>
.user-profile-page {
  padding: 24px;
  background: #f0f2f5;
}

/* 新增容器用于控制宽度和居中 */
.profile-container {
  max-width: 1000px; /* 调整最大宽度以留出边距 */
  margin: 0 auto; /* 水平居中 */
}

.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-section {
  margin-bottom: 32px;
  text-align: center;
  position: relative; /* For positioning upload button */
}

.avatar-upload {
  margin-top: 16px;
}

.avatar-uploader :deep(.ant-upload) {
  width: 128px;
  height: 128px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 50%; /* Make the upload area circular */
  overflow: hidden;
}

.upload-tip {
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}

.info-section {
  width: 100%;
  /* max-width: 800px;  移除这里的最大宽度，由外层容器控制 */
}

.info-section :deep(.ant-descriptions-item-label) {
  width: 120px; /* Adjust label width */
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .user-profile-page {
    padding: 12px;
  }

  .profile-container {
      max-width: 100%; /* 移动端占满 */
  }

  .avatar-section {
    margin-bottom: 24px;
  }

  .info-section :deep(.ant-descriptions-item-label) {
    width: 100px;
  }
}
</style>