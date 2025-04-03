<script setup>
import { reactive, onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import userApi from "@/api/admin/userApi.js";

// 状态管理
const loading = ref(false);
const users = ref([]);
const total = ref(0);
const pageNum = ref(0);
const pageSize = ref(6);
const filter = reactive({
  username: '',
  sex: undefined,
  age: '',
});

// 模态框状态
const modalVisible = ref(false);
const modalLoading = ref(false);
const currentUser = ref(null);
const createModalVisible = ref(false);
const createModalLoading = ref(false);
const newUser = ref({
  username: '',
  password: '',
  sex: '男',
  age: '',
  phone: '',
  email: '',
});

// 表格列配置
const columns = [
  { title: '用户Id', dataIndex: 'userId', width: 100 },
  { title: '头像', dataIndex: 'avatar', width: 80 },
  { title: '用户名', dataIndex: 'username', width: 100 },
  { title: '性别', dataIndex: 'sex', width: 60 },
  { title: '年龄', dataIndex: 'age', width: 60 },
  { title: '电话', dataIndex: 'phone', width: 120 },
  { title: '邮箱', dataIndex: 'email', width: 160 },
  { title: '角色', dataIndex: 'role', width: 80 },
  { title: '操作', dataIndex: 'action', width: 280, fixed: 'right' }
];

// 获取用户列表
const fetchUsers = async (currentPage = 0, size = 6) => {
  try {
    loading.value = true;
    const { data } = await userApi.getUserList({
      pageNum: currentPage,
      pageSize: size,
      ...filter
    });
    
    users.value = data.records;
    total.value = data.total;
    pageNum.value = data.pageNum;
    pageSize.value = data.pageSize;
  } catch (error) {
    message.error('获取用户列表失败');
    console.error('获取用户列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理表格变化
const handleTableChange = ({ current, pageSize: size }) => {
  fetchUsers(current - 1, size);
};

// 搜索
const handleSearch = () => {
  fetchUsers(0);
};

// 重置搜索
const handleReset = () => {
  filter.username = '';
  filter.sex = undefined;
  filter.age = '';
  fetchUsers(0);
};

// 显示更新模态框
const showUpdateModal = (user) => {
  currentUser.value = { ...user };
  modalVisible.value = true;
};

// 更新用户
const handleUpdate = async () => {
  try {
    modalLoading.value = true;
    const updateData = {
      username: currentUser.value.username,
      sex: currentUser.value.sex,
      age: currentUser.value.age,
      phone: currentUser.value.phone,
      email: currentUser.value.email
    };
    await userApi.updateUser(currentUser.value.userId, updateData);
    message.success('更新成功');
    modalVisible.value = false;
    fetchUsers(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('更新失败');
    console.error('更新失败:', error);
  } finally {
    modalLoading.value = false;
  }
};

// 删除用户
const handleDelete = async (userId) => {
  try {
    await userApi.deleteUser(userId);
    message.success('删除成功');
    fetchUsers(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('删除失败');
    console.error('删除失败:', error);
  }
};

// 上传头像
const handleAvatarUpload = async (userId, file) => {
  try {
    if (!file) return;
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      message.error('请上传图片文件');
      return;
    }
    
    // 验证文件大小（限制为2MB）
    if (file.size > 2 * 1024 * 1024) {
      message.error('图片大小不能超过2MB');
      return;
    }

    loading.value = true;
    await userApi.uploadAvatar(userId, file);
    message.success('头像更新成功');
    fetchUsers(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('头像更新失败');
    console.error('头像更新失败:', error);
  } finally {
    loading.value = false;
  }
};

// 显示创建用户模态框
const showCreateModal = () => {
  newUser.value = {
    username: '',
    password: '',
    sex: '男',
    age: '',
    phone: '',
    email: '',
  };
  createModalVisible.value = true;
};

// 创建用户
const handleCreate = async () => {
  try {
    createModalLoading.value = true;
    await userApi.createUser(newUser.value);
    message.success('创建成功');
    createModalVisible.value = false;
    fetchUsers(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('创建失败');
    console.error('创建失败:', error);
  } finally {
    createModalLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="user-list">
    <!-- 搜索区域 -->
    <div class="search-area">
      <div class="search-container">
        <a-form layout="inline">
          <a-form-item>
            <a-select
              v-model:value="filter.sex"
              placeholder="选择性别"
              allow-clear
              style="width: 120px"
            >
              <a-select-option value="男">男</a-select-option>
              <a-select-option value="女">女</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-input
              v-model:value="filter.age"
              placeholder="输入年龄"
              allow-clear
              style="width: 120px"
            />
          </a-form-item>
          <a-form-item>
            <a-input
              v-model:value="filter.username"
              placeholder="输入用户名"
              allow-clear
              style="width: 200px"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">搜索</a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
        <a-button type="primary" class="create-btn" @click="showCreateModal">创建用户</a-button>
      </div>
    </div>

    <a-table :columns="columns" :dataSource="users" :loading="loading" :pagination="{
        current: pageNum + 1,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['5', '6', '7', '8']
      }"
      @change="handleTableChange"
      :scroll="{ x: 1040 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'avatar'">
          <img
            :src="record.avatar || '/default-avatar.png'"
            alt="avatar"
            class="user-avatar"
          />
        </template>
        <template v-else-if="column.dataIndex === 'role'">
          {{ record.role?.role === 'ROLE_ADMIN' ? '管理员' : '普通用户' }}
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="primary" @click="showUpdateModal(record)">更新</a-button>
            <a-upload
              :showUploadList="false"
              :beforeUpload="() => false"
              @change="(info) => handleAvatarUpload(record.userId, info.file)"
            >
              <a-button type="primary" style="background-color: #52c41a; border-color: #52c41a">更新头像</a-button>
            </a-upload>
            <a-popconfirm
              title="确定要删除这个用户吗？"
              @confirm="handleDelete(record.userId)"
            >
              <a-button type="primary" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 更新用户模态框 -->
    <a-modal
      v-model:open="modalVisible"
      title="更新用户信息"
      :confirmLoading="modalLoading"
      @ok="handleUpdate"
      @cancel="modalVisible = false"
    >
      <a-form
        v-if="currentUser"
        :model="currentUser"
        layout="vertical"
      >
        <a-form-item label="用户名">
          <a-input v-model:value="currentUser.username" />
        </a-form-item>
        <a-form-item label="性别">
          <a-select v-model:value="currentUser.sex">
            <a-select-option value="男">男</a-select-option>
            <a-select-option value="女">女</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="年龄">
          <a-input-number v-model:value="currentUser.age" />
        </a-form-item>
        <a-form-item label="电话">
          <a-input v-model:value="currentUser.phone" />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="currentUser.email" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 创建用户模态框 -->
    <a-modal
      v-model:open="createModalVisible"
      title="创建用户"
      :confirmLoading="createModalLoading"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
    >
      <a-form
        :model="newUser"
        layout="vertical"
      >
        <a-form-item 
          label="用户名" 
          required
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input v-model:value="newUser.username" />
        </a-form-item>
        <a-form-item 
          label="密码" 
          required
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password v-model:value="newUser.password" />
        </a-form-item>
        <a-form-item label="性别">
          <a-select v-model:value="newUser.sex">
            <a-select-option value="男">男</a-select-option>
            <a-select-option value="女">女</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="年龄">
          <a-input-number v-model:value="newUser.age" :min="1" :max="120" />
        </a-form-item>
        <a-form-item label="电话">
          <a-input v-model:value="newUser.phone" />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="newUser.email" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.user-list {
  padding: 24px;
  background: #fff;
  border-radius: 4px;
}

.search-area {
  margin-bottom: 24px;
}

.search-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 230px 0 0;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border: 3px solid #1677ff;
  border-radius: 50%;
  object-fit: cover;
}

:deep(.ant-table-wrapper) {
  margin-top: 16px;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .user-list {
    padding: 12px;
  }

  .search-container {
    flex-direction: column;
    align-items: stretch;
    padding: 0;
  }

  .search-area :deep(.ant-form) {
    width: 100%;
  }

  .search-area :deep(.ant-form-inline .ant-form-item) {
    width: 100%;
    margin-right: 0;
  }

  .search-area :deep(.ant-form-inline .ant-form-item-control) {
    width: 100%;
  }

  .search-area :deep(.ant-select),
  .search-area :deep(.ant-input) {
    width: 100% !important;
  }

  .search-area :deep(.ant-space) {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .search-area :deep(.ant-space .ant-btn) {
    flex: 1;
    margin: 0 4px;
  }

  .create-btn {
    width: 100%;
    margin-top: 12px;
  }

  :deep(.ant-table) {
    width: 100%;
    overflow-x: auto;
  }

  :deep(.ant-table-cell) {
    white-space: nowrap;
    padding: 8px;
  }

  :deep(.ant-table-tbody > tr > td) {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :deep(.ant-space) {
    flex-wrap: wrap;
    gap: 8px;
  }

  :deep(.ant-space > .ant-space-item) {
    margin-right: 0 !important;
  }

  :deep(.ant-modal) {
    max-width: 90%;
    margin: 0 auto;
  }

  :deep(.ant-modal-body) {
    padding: 12px;
  }
}
</style>
