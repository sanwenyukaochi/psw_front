<script setup>
import { reactive, onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import forumApi from "@/api/admin/forumListApi.js";

// 状态管理
const loading = ref(false);
const forums = ref([]);
const total = ref(0);
const pageNum = ref(0);
const pageSize = ref(6);
const filter = reactive({
  forumTitle: '',
  forumContent: '',
});

// 模态框状态
const modalVisible = ref(false);
const modalLoading = ref(false);
const currentForum = ref(null);
const createModalVisible = ref(false);
const createModalLoading = ref(false);
const newForum = ref({
  forumTitle: '',
  forumContent: '',
  forumImage: '',
});

// 表格列配置
const columns = [
  { title: '论坛Id', dataIndex: 'forumId', width: 100 },
  { title: '图片', dataIndex: 'forumImage', width: 80 },
  { title: '标题', dataIndex: 'forumTitle', width: 150 },
  { title: '内容', dataIndex: 'forumContent', width: 300 },
  { title: '创建时间', dataIndex: 'createdAt', width: 160, customRender: ({ text }) => new Date(text).toLocaleString() },
  { title: '创建者', dataIndex: 'createBy', width: 120, customRender: ({ text }) => text?.username || '-' },
  { title: '操作', dataIndex: 'action', width: 280, fixed: 'right' }
];

// 获取论坛列表
const fetchForums = async (currentPage = 0, size = 6) => {
  try {
    loading.value = true;
    const { data } = await forumApi.getForumList({
      pageNum: currentPage,
      pageSize: size,
      ...filter
    });
    
    forums.value = data.records;
    total.value = data.total;
    pageNum.value = data.pageNum;
    pageSize.value = data.pageSize;
  } catch (error) {
    message.error('获取论坛列表失败');
    console.error('获取论坛列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理表格变化
const handleTableChange = ({ current, pageSize: size }) => {
  fetchForums(current - 1, size);
};

// 搜索
const handleSearch = () => {
  fetchForums(0);
};

// 重置搜索
const handleReset = () => {
  filter.forumTitle = '';
  filter.forumContent = '';
  fetchForums(0);
};

// 显示更新模态框
const showUpdateModal = (forum) => {
  currentForum.value = { ...forum };
  modalVisible.value = true;
};

// 更新论坛
const handleUpdate = async () => {
  try {
    if (!currentForum.value?.forumId) {
      message.error('论坛ID不能为空');
      return;
    }

    modalLoading.value = true;
    const updateData = {
      forumTitle: currentForum.value.forumTitle,
      forumContent: currentForum.value.forumContent,
    };
    await forumApi.updateForum(currentForum.value.forumId, updateData);
    message.success('更新成功');
    modalVisible.value = false;
    fetchForums(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('更新失败');
    console.error('更新失败:', error);
  } finally {
    modalLoading.value = false;
  }
};

// 删除论坛
const handleDelete = async (forumId) => {
  try {
    await forumApi.deleteForum(forumId);
    message.success('删除成功');
    fetchForums(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('删除失败');
    console.error('删除失败:', error);
  }
};

// 上传图片
const handleImageUpload = async (forumId, file) => {
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
    await forumApi.uploadImage(forumId, file);
    message.success('图片更新成功');
    fetchForums(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('图片更新失败');
    console.error('图片更新失败:', error);
  } finally {
    loading.value = false;
  }
};

// 显示创建论坛模态框
const showCreateModal = () => {
  newForum.value = {
    forumTitle: '',
    forumContent: '',
    forumImage: '',
  };
  createModalVisible.value = true;
};

// 创建论坛
const handleCreate = async () => {
  try {
    createModalLoading.value = true;
    await forumApi.createForum(newForum.value);
    message.success('创建成功');
    createModalVisible.value = false;
    fetchForums(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('创建失败');
    console.error('创建失败:', error);
  } finally {
    createModalLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  fetchForums();
});
</script>

<template>
  <div class="forum-list">
    <!-- 搜索区域 -->
    <div class="search-area">
      <div class="search-container">
        <a-form layout="inline">
          <a-form-item>
            <a-input
              v-model:value="filter.forumTitle"
              placeholder="输入论坛标题"
              allow-clear
              style="width: 200px"
            />
          </a-form-item>
          <a-form-item>
            <a-input
              v-model:value="filter.forumContent"
              placeholder="输入论坛内容"
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
        <a-button type="primary" class="create-btn" @click="showCreateModal">创建论坛</a-button>
      </div>
    </div>

    <a-table :columns="columns" :dataSource="forums" :loading="loading" :pagination="{
        current: pageNum + 1,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['5', '6', '7', '8']
      }"
      @change="handleTableChange"
      :scroll="{ x: 1200 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'forumImage'">
          <img
            :src="record.forumImage || '/default-forum.png'"
            alt="forum"
            class="forum-image"
          />
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="primary" @click="showUpdateModal(record)">更新</a-button>
            <a-upload
              :showUploadList="false"
              :beforeUpload="() => false"
              @change="(info) => handleImageUpload(record.forumId, info.file)"
            >
              <a-button type="primary" style="background-color: #52c41a; border-color: #52c41a">更新图片</a-button>
            </a-upload>
            <a-popconfirm
              title="确定要删除这个论坛吗？"
              @confirm="handleDelete(record.forumId)"
            >
              <a-button type="primary" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 更新论坛模态框 -->
    <a-modal
      v-model:open="modalVisible"
      title="更新论坛信息"
      :confirmLoading="modalLoading"
      @ok="handleUpdate"
      @cancel="modalVisible = false"
    >
      <a-form
        v-if="currentForum"
        :model="currentForum"
        layout="vertical"
      >
        <a-form-item label="标题">
          <a-input v-model:value="currentForum.forumTitle" />
        </a-form-item>
        <a-form-item label="内容">
          <a-textarea v-model:value="currentForum.forumContent" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 创建论坛模态框 -->
    <a-modal
      v-model:open="createModalVisible"
      title="创建论坛"
      :confirmLoading="createModalLoading"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
    >
      <a-form
        :model="newForum"
        layout="vertical"
      >
        <a-form-item 
          label="标题" 
          required
          :rules="[{ required: true, message: '请输入论坛标题' }]"
        >
          <a-input v-model:value="newForum.forumTitle" />
        </a-form-item>
        <a-form-item 
          label="内容"
          required
          :rules="[{ required: true, message: '请输入论坛内容' }]"
        >
          <a-textarea v-model:value="newForum.forumContent" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.forum-list {
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

.forum-image {
  width: 50px;
  height: 50px;
  border: 3px solid #1677ff;
  border-radius: 4px;
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
  .forum-list {
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