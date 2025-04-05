<script setup>
import { reactive, onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import noticeApi from "@/api/admin/noticeApi.js";

// 状态管理
const loading = ref(false);
const notices = ref([]);
const total = ref(0);
const pageNum = ref(0);
const pageSize = ref(6);
const filter = reactive({
  noticeTitle: '',
  noticeContent: '',
});

// 模态框状态
const modalVisible = ref(false);
const modalLoading = ref(false);
const currentNotice = ref(null);
const createModalVisible = ref(false);
const createModalLoading = ref(false);
const newNotice = ref({
  noticeTitle: '',
  noticeContent: '',
});

// 表格列配置
const columns = [
  { title: '公告Id', dataIndex: 'noticeId', width: 100 },
  { title: '标题', dataIndex: 'noticeTitle', width: 200 },
  { title: '内容', dataIndex: 'noticeContent', width: 300 },
  { title: '创建时间', dataIndex: 'createdAt', width: 160, customRender: ({ text }) => new Date(text).toLocaleString() },
  { title: '操作', dataIndex: 'action', width: 200, fixed: 'right' }
];

// 获取公告列表
const fetchNotices = async (currentPage = 0, size = 6) => {
  try {
    loading.value = true;
    const { data } = await noticeApi.getNoticeList({
      pageNum: currentPage,
      pageSize: size,
      ...filter
    });
    
    notices.value = data.records;
    total.value = data.total;
    pageNum.value = data.pageNum;
    pageSize.value = data.pageSize;
  } catch (error) {
    message.error('获取公告列表失败');
    console.error('获取公告列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理表格变化
const handleTableChange = ({ current, pageSize: size }) => {
  fetchNotices(current - 1, size);
};

// 搜索
const handleSearch = () => {
  fetchNotices(0);
};

// 重置搜索
const handleReset = () => {
  filter.noticeTitle = '';
  filter.noticeContent = '';
  fetchNotices(0);
};

// 显示更新模态框
const showUpdateModal = (notice) => {
  currentNotice.value = { ...notice };
  modalVisible.value = true;
};

// 更新公告
const handleUpdate = async () => {
  try {
    if (!currentNotice.value?.noticeId) {
      message.error('公告ID不能为空');
      return;
    }

    modalLoading.value = true;
    const updateData = {
      noticeTitle: currentNotice.value.noticeTitle,
      noticeContent: currentNotice.value.noticeContent,
    };
    await noticeApi.updateNotice(currentNotice.value.noticeId, updateData);
    message.success('更新成功');
    modalVisible.value = false;
    fetchNotices(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('更新失败');
    console.error('更新失败:', error);
  } finally {
    modalLoading.value = false;
  }
};

// 删除公告
const handleDelete = async (noticeId) => {
  try {
    await noticeApi.deleteNotice(noticeId);
    message.success('删除成功');
    fetchNotices(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('删除失败');
    console.error('删除失败:', error);
  }
};

// 显示创建公告模态框
const showCreateModal = () => {
  newNotice.value = {
    noticeTitle: '',
    noticeContent: '',
  };
  createModalVisible.value = true;
};

// 创建公告
const handleCreate = async () => {
  try {
    createModalLoading.value = true;
    await noticeApi.createNotice(newNotice.value);
    message.success('创建成功');
    createModalVisible.value = false;
    fetchNotices(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('创建失败');
    console.error('创建失败:', error);
  } finally {
    createModalLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  fetchNotices();
});
</script>

<template>
  <div class="notice-list">
    <!-- 搜索区域 -->
    <div class="search-area">
      <div class="search-container">
        <a-form layout="inline">
          <a-form-item>
            <a-input
              v-model:value="filter.noticeTitle"
              placeholder="输入公告标题"
              allow-clear
              style="width: 200px"
            />
          </a-form-item>
          <a-form-item>
            <a-input
              v-model:value="filter.noticeContent"
              placeholder="输入公告内容"
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
        <a-button type="primary" class="create-btn" @click="showCreateModal">创建公告</a-button>
      </div>
    </div>

    <a-table :columns="columns" :dataSource="notices" :loading="loading" :pagination="{
        current: pageNum + 1,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['5', '6', '7', '8']
      }"
      @change="handleTableChange"
      :scroll="{ x: 960 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="primary" @click="showUpdateModal(record)">更新</a-button>
            <a-popconfirm
              title="确定要删除这个公告吗？"
              @confirm="handleDelete(record.noticeId)"
            >
              <a-button type="primary" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 更新公告模态框 -->
    <a-modal
      v-model:open="modalVisible"
      title="更新公告信息"
      :confirmLoading="modalLoading"
      @ok="handleUpdate"
      @cancel="modalVisible = false"
    >
      <a-form
        v-if="currentNotice"
        :model="currentNotice"
        layout="vertical"
      >
        <a-form-item label="标题">
          <a-input v-model:value="currentNotice.noticeTitle" />
        </a-form-item>
        <a-form-item label="内容">
          <a-textarea v-model:value="currentNotice.noticeContent" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 创建公告模态框 -->
    <a-modal
      v-model:open="createModalVisible"
      title="创建公告"
      :confirmLoading="createModalLoading"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
    >
      <a-form
        :model="newNotice"
        layout="vertical"
      >
        <a-form-item 
          label="标题" 
          required
          :rules="[{ required: true, message: '请输入公告标题' }]"
        >
          <a-input v-model:value="newNotice.noticeTitle" />
        </a-form-item>
        <a-form-item 
          label="内容"
          required
          :rules="[{ required: true, message: '请输入公告内容' }]"
        >
          <a-textarea v-model:value="newNotice.noticeContent" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.notice-list {
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

:deep(.ant-table-wrapper) {
  margin-top: 16px;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .notice-list {
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