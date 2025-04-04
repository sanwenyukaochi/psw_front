<script setup>
import { reactive, onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import goodApi from "@/api/admin/goodApi.js";

// 状态管理
const loading = ref(false);
const goods = ref([]);
const total = ref(0);
const pageNum = ref(0);
const pageSize = ref(6);
const filter = reactive({
  goodName: '',
});

// 模态框状态
const modalVisible = ref(false);
const modalLoading = ref(false);
const currentGood = ref(null);
const createModalVisible = ref(false);
const createModalLoading = ref(false);
const newGood = ref({
  goodName: '',
  description: '',
  price: '',
  stock: '',
  image: '',
});

// 表格列配置
const columns = [
  { title: '商品Id', dataIndex: 'goodId', width: 100 },
  { title: '图片', dataIndex: 'image', width: 80 },
  { title: '名称', dataIndex: 'goodName', width: 120 },
  { title: '描述', dataIndex: 'description', width: 200 },
  { title: '价格', dataIndex: 'price', width: 100 },
  { title: '库存', dataIndex: 'stock', width: 80 },
  { title: '操作', dataIndex: 'action', width: 280, fixed: 'right' }
];

// 获取商品列表
const fetchGoods = async (currentPage = 0, size = 6) => {
  try {
    loading.value = true;
    const { data } = await goodApi.getGoodList({
      pageNum: currentPage,
      pageSize: size,
      ...filter
    });
    
    goods.value = data.records;
    total.value = data.total;
    pageNum.value = data.pageNum;
    pageSize.value = data.pageSize;
  } catch (error) {
    message.error('获取商品列表失败');
    console.error('获取商品列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理表格变化
const handleTableChange = ({ current, pageSize: size }) => {
  fetchGoods(current - 1, size);
};

// 搜索
const handleSearch = () => {
  fetchGoods(0);
};

// 重置搜索
const handleReset = () => {
  filter.goodName = '';
  fetchGoods(0);
};

// 显示更新模态框
const showUpdateModal = (good) => {
  currentGood.value = { ...good };
  modalVisible.value = true;
};

// 更新商品
const handleUpdate = async () => {
  try {
    if (!currentGood.value?.goodId) {
      message.error('商品ID不能为空');
      return;
    }

    modalLoading.value = true;
    const updateData = {
      goodName: currentGood.value.goodName,
      description: currentGood.value.description,
      price: currentGood.value.price,
      stock: currentGood.value.stock,
    };
    await goodApi.updateGood(currentGood.value.goodId, updateData);
    message.success('更新成功');
    modalVisible.value = false;
    fetchGoods(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('更新失败');
    console.error('更新失败:', error);
  } finally {
    modalLoading.value = false;
  }
};

// 删除商品
const handleDelete = async (goodId) => {
  try {
    await goodApi.deleteGood(goodId);
    message.success('删除成功');
    fetchGoods(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('删除失败');
    console.error('删除失败:', error);
  }
};

// 上传图片
const handleImageUpload = async (goodId, file) => {
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
    await goodApi.uploadImage(goodId, file);
    message.success('图片更新成功');
    fetchGoods(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('图片更新失败');
    console.error('图片更新失败:', error);
  } finally {
    loading.value = false;
  }
};

// 显示创建商品模态框
const showCreateModal = () => {
  newGood.value = {
    goodName: '',
    description: '',
    price: '',
    stock: '',
    image: '',
  };
  createModalVisible.value = true;
};

// 创建商品
const handleCreate = async () => {
  try {
    createModalLoading.value = true;
    await goodApi.createGood(newGood.value);
    message.success('创建成功');
    createModalVisible.value = false;
    fetchGoods(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('创建失败');
    console.error('创建失败:', error);
  } finally {
    createModalLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  fetchGoods();
});
</script>

<template>
  <div class="good-list">
    <!-- 搜索区域 -->
    <div class="search-area">
      <div class="search-container">
        <a-form layout="inline">
          <a-form-item>
            <a-input
              v-model:value="filter.goodName"
              placeholder="输入商品名称"
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
        <a-button type="primary" class="create-btn" @click="showCreateModal">创建商品</a-button>
      </div>
    </div>

    <a-table :columns="columns" :dataSource="goods" :loading="loading" :pagination="{
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
        <template v-if="column.dataIndex === 'image'">
          <img
            :src="record.image || '/default-good.png'"
            alt="good"
            class="good-image"
          />
        </template>
        <template v-else-if="column.dataIndex === 'price'">
          ¥{{ record.price.toFixed(2) }}
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="primary" @click="showUpdateModal(record)">更新</a-button>
            <a-upload
              :showUploadList="false"
              :beforeUpload="() => false"
              @change="(info) => handleImageUpload(record.goodId, info.file)"
            >
              <a-button type="primary" style="background-color: #52c41a; border-color: #52c41a">更新图片</a-button>
            </a-upload>
            <a-popconfirm
              title="确定要删除这个商品吗？"
              @confirm="handleDelete(record.goodId)"
            >
              <a-button type="primary" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 更新商品模态框 -->
    <a-modal
      v-model:open="modalVisible"
      title="更新商品信息"
      :confirmLoading="modalLoading"
      @ok="handleUpdate"
      @cancel="modalVisible = false"
    >
      <a-form
        v-if="currentGood"
        :model="currentGood"
        layout="vertical"
      >
        <a-form-item label="名称">
          <a-input v-model:value="currentGood.goodName" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="currentGood.description" />
        </a-form-item>
        <a-form-item label="价格">
          <a-input-number 
            v-model:value="currentGood.price" 
            :min="0" 
            :precision="2"
            :step="0.01"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="库存">
          <a-input-number 
            v-model:value="currentGood.stock" 
            :min="0" 
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 创建商品模态框 -->
    <a-modal
      v-model:open="createModalVisible"
      title="创建商品"
      :confirmLoading="createModalLoading"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
    >
      <a-form
        :model="newGood"
        layout="vertical"
      >
        <a-form-item 
          label="名称" 
          required
          :rules="[{ required: true, message: '请输入商品名称' }]"
        >
          <a-input v-model:value="newGood.goodName" />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="newGood.description" />
        </a-form-item>
        <a-form-item 
          label="价格"
          required
          :rules="[{ required: true, message: '请输入商品价格' }]"
        >
          <a-input-number 
            v-model:value="newGood.price" 
            :min="0" 
            :precision="2"
            :step="0.01"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item 
          label="库存"
          required
          :rules="[{ required: true, message: '请输入商品库存' }]"
        >
          <a-input-number 
            v-model:value="newGood.stock" 
            :min="0" 
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.good-list {
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

.good-image {
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
  .good-list {
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