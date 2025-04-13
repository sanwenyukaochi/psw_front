<script setup>
import { reactive, ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import typeApi from "@/api/admin/typeListApi.js";

// 状态管理
const loading = ref(false);
const types = ref([]);
const total = ref(0);
const pageNum = ref(0);
const pageSize = ref(6);
const filter = reactive({
  typeFeature: '',
});

// 模态框状态
const modalVisible = ref(false);
const modalLoading = ref(false);
const currentType = ref(null);
const createModalVisible = ref(false);
const createModalLoading = ref(false);
const newType = ref({
  typeName: '',
  typeFeature: '',
});

// 表格列配置
const columns = [
  { title: '类型Id', dataIndex: 'typeId', width: 100 },
  { title: '类型名称', dataIndex: 'typeName', width: 120 },
  { 
    title: '类型特征', 
    dataIndex: 'typeFeature',
    width: 400,
    ellipsis: true 
  },
  { title: '操作', dataIndex: 'action', width: 200, fixed: 'right' }
];

// 获取类型列表
const fetchTypes = async (page = 0) => {
  try {
    loading.value = true;
    const params = {
      pageNum: page,
      pageSize: pageSize.value,
      typeFeature: filter.typeFeature
    };
    const { data } = await typeApi.getTypeList(params);
    
    types.value = data.records;
    total.value = data.total;
    pageNum.value = data.pageNum;
  } catch (error) {
    console.error(error);
    message.error('获取类型列表失败:');
  } finally {
    loading.value = false;
  }
};

// 处理表格变化
const handleTableChange = (pagination) => {
  pageSize.value = pagination.pageSize;
  fetchTypes(pagination.current - 1);
};

// 搜索
const handleSearch = () => {
  fetchTypes(0);
};

// 重置搜索
const handleReset = () => {
  filter.typeFeature = '';
  fetchTypes(0);
};

// 显示更新模态框
const showUpdateModal = (type) => {
  currentType.value = { ...type };
  modalVisible.value = true;
};

// 更新类型
const handleUpdate = async () => {
  try {
    modalLoading.value = true;
    const updateData = {
      typeName: currentType.value.typeName,
      typeFeature: currentType.value.typeFeature
    };
    await typeApi.updateType(currentType.value.typeId, updateData);
    message.success('更新成功');
    modalVisible.value = false;
    fetchTypes(pageNum.value, pageSize.value);
  } catch (error) {
    message.error(error);
    console.error('更新失败:', error);
  } finally {
    modalLoading.value = false;
  }
};

// 删除类型
const handleDelete = async (typeId) => {
  try {
    await typeApi.deleteType(typeId);
    message.success('删除成功');
    fetchTypes(pageNum.value, pageSize.value);
  } catch (error) {
    message.error(error);
    console.error('删除失败:', error);
  }
};

// 显示创建类型模态框
const showCreateModal = () => {
  newType.value = {
    typeName: '',
    typeFeature: ''
  };
  createModalVisible.value = true;
};

// 创建类型
const handleCreate = async () => {
  try {
    createModalLoading.value = true;
    await typeApi.createType(newType.value);
    message.success('创建成功');
    createModalVisible.value = false;
    fetchTypes(pageNum.value, pageSize.value);
  } catch (error) {
    message.error(error);
    console.error('创建失败');
  } finally {
    createModalLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  fetchTypes();
});
</script>

<template>
  <div class="type-list">
    <!-- 搜索区域 -->
    <div class="search-area">
      <div class="search-container">
        <a-form layout="inline">
          <a-form-item>
            <a-input
              v-model:value="filter.typeFeature"
              placeholder="输入类型特征"
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
        <a-button type="primary" class="create-btn" @click="showCreateModal">创建类型</a-button>
      </div>
    </div>

    <!-- 类型表格 -->
    <a-table
      :columns="columns"
      :dataSource="types"
      :loading="loading"
      :pagination="{
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
        <template v-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="primary" @click="showUpdateModal(record)">更新</a-button>
            <a-popconfirm
              title="确定要删除这个类型吗？"
              @confirm="handleDelete(record.typeId)"
            >
              <a-button type="primary" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 更新类型模态框 -->
    <a-modal
      v-model:open="modalVisible"
      title="更新类型信息"
      :confirmLoading="modalLoading"
      @ok="handleUpdate"
      @cancel="modalVisible = false"
    >
      <a-form
        v-if="currentType"
        :model="currentType"
        layout="vertical"
      >
        <a-form-item label="类型名称">
          <a-input v-model:value="currentType.typeName" />
        </a-form-item>
        <a-form-item label="类型特征">
          <a-textarea
            v-model:value="currentType.typeFeature"
            :rows="4"
            :maxLength="500"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 创建类型模态框 -->
    <a-modal
      v-model:open="createModalVisible"
      title="创建类型"
      :confirmLoading="createModalLoading"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
    >
      <a-form
        :model="newType"
        layout="vertical"
      >
        <a-form-item 
          label="类型名称" 
          required
          :rules="[{ required: true, message: '请输入类型名称' }]"
        >
          <a-input v-model:value="newType.typeName" />
        </a-form-item>
        <a-form-item 
          label="类型特征"
          required
          :rules="[{ required: true, message: '请输入类型特征' }]"
        >
          <a-textarea
            v-model:value="newType.typeFeature"
            :rows="4"
            :maxLength="500"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.type-list {
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
  .type-list {
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