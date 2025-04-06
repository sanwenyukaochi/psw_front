<script setup>
import { reactive, onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import petApi from "@/api/admin/petListApi.js";
import typeApi from "@/api/admin/typeListApi.js";
import dayjs from 'dayjs';

// 状态管理
const loading = ref(false);
const pets = ref([]);
const total = ref(0);
const pageNum = ref(0);
const pageSize = ref(6);
const petTypes = ref([]);
const filter = reactive({
  petName: '',
  type: undefined,
});

// 模态框状态
const modalVisible = ref(false);
const modalLoading = ref(false);
const currentPet = ref(null);
const createModalVisible = ref(false);
const createModalLoading = ref(false);
const newPet = ref({
  petName: '',
  type: { typeId: '1', typeName: '猫类' },
  sex: '雄性',
  color: '',
  weight: '',
  birthDate: '',
  description: '',
});

// 表格列配置
const columns = [
  { title: '宠物Id', dataIndex: 'petId', width: 100 },
  { title: '图片', dataIndex: 'image', width: 80 },
  { title: '名称', dataIndex: 'petName', width: 100 },
  { title: '类型', dataIndex: 'type', width: 100, customRender: ({ record }) => record.type.typeName },
  { title: '性别', dataIndex: 'sex', width: 60 },
  { title: '颜色', dataIndex: 'color', width: 80 },
  { title: '体重(kg)', dataIndex: 'weight', width: 80 },
  { title: '出生日期', dataIndex: 'birthDate', width: 120, customRender: ({ text }) => new Date(text).toLocaleDateString() },
  { title: '状态', dataIndex: 'saleStatus', width: 80, customRender: ({ text }) => text ? '已售出' : '待售' },
  { title: '操作', dataIndex: 'action', width: 280, fixed: 'right' }
];

// 获取宠物类型列表
const fetchPetTypes = async () => {
  try {
    const { data } = await typeApi.getAllType();
    petTypes.value = data;
  } catch (error) {
    message.error('获取宠物类型失败');
    console.error('获取宠物类型失败:', error);
  }
};

// 获取宠物列表
const fetchPets = async (currentPage = 0, size = 6) => {
  try {
    loading.value = true;
    const { data } = await petApi.getPetList({
      pageNum: currentPage,
      pageSize: size,
      ...filter
    });
    
    pets.value = data.records;
    total.value = data.total;
    pageNum.value = data.pageNum;
    pageSize.value = data.pageSize;
  } catch (error) {
    message.error('获取宠物列表失败');
    console.error('获取宠物列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理表格变化
const handleTableChange = ({ current, pageSize: size }) => {
  fetchPets(current - 1, size);
};

// 搜索
const handleSearch = () => {
  fetchPets(0);
};

// 重置搜索
const handleReset = () => {
  filter.petName = '';
  filter.type = undefined;
  fetchPets(0);
};

// 显示更新模态框
const showUpdateModal = (pet) => {
  currentPet.value = { 
    ...pet,
    birthDate: pet.birthDate ? dayjs(pet.birthDate) : null,
    type: {
      typeId: pet.type.typeId,
      typeName: pet.type.typeName
    }
  };
  modalVisible.value = true;
};

// 更新宠物
const handleUpdate = async () => {
  try {
    if (!currentPet.value?.petId) {
      message.error('宠物ID不能为空');
      return;
    }
    
    modalLoading.value = true;
    const updateData = {
      petName: currentPet.value.petName,
      typeId: currentPet.value.type.typeId,
      sex: currentPet.value.sex,
      color: currentPet.value.color,
      weight: currentPet.value.weight,
      birthDate: currentPet.value.birthDate ? currentPet.value.birthDate.valueOf() : null,
      description: currentPet.value.description,
      saleStatus: currentPet.value.saleStatus
    };

    console.log('更新数据:', {
      petId: currentPet.value.petId,
      updateData
    });

    await petApi.updatePet(currentPet.value.petId, updateData);
    message.success('更新成功');
    modalVisible.value = false;
    fetchPets(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('更新失败');
    console.error('更新失败:', error);
  } finally {
    modalLoading.value = false;
  }
};

// 删除宠物
const handleDelete = async (petId) => {
  try {
    await petApi.deletePet(petId);
    message.success('删除成功');
    fetchPets(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('删除失败');
    console.error('删除失败:', error);
  }
};

// 上传图片
const handleImageUpload = async (petId, file) => {
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
    await petApi.uploadImage(petId, file);
    message.success('图片更新成功');
    fetchPets(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('图片更新失败');
    console.error('图片更新失败:', error);
  } finally {
    loading.value = false;
  }
};

// 显示创建宠物模态框
const showCreateModal = () => {
  newPet.value = {
    petName: '',
    type: { typeId: '1', typeName: '猫类' },
    sex: '雄性',
    color: '',
    weight: '',
    birthDate: null,
    description: '',
  };
  createModalVisible.value = true;
};

// 创建宠物
const handleCreate = async () => {
  try {
    createModalLoading.value = true;
    const createData = {
      petName: newPet.value.petName,
      typeId: newPet.value.type.typeId,
      sex: newPet.value.sex,
      color: newPet.value.color,
      weight: newPet.value.weight,
      birthDate: newPet.value.birthDate ? newPet.value.birthDate.valueOf() : null,
      description: newPet.value.description,
      saleStatus: false
    };
    await petApi.createPet(createData);
    message.success('创建成功');
    createModalVisible.value = false;
    fetchPets(pageNum.value, pageSize.value);
  } catch (error) {
    message.error('创建失败');
    console.error('创建失败:', error);
  } finally {
    createModalLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  fetchPetTypes();
  fetchPets();
});
</script>

<template>
  <div class="pet-list">
    <!-- 搜索区域 -->
    <div class="search-area">
      <div class="search-container">
        <a-form layout="inline">
          <a-form-item>
            <a-select
              v-model:value="filter.type"
              placeholder="选择类型"
              allow-clear
              style="width: 120px"
            >
              <a-select-option 
                v-for="type in petTypes" 
                :key="type.typeId" 
                :value="type.typeId"
              >
                {{ type.typeName }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-input
              v-model:value="filter.petName"
              placeholder="输入名称"
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
        <a-button type="primary" class="create-btn" @click="showCreateModal">创建宠物</a-button>
      </div>
    </div>

    <a-table :columns="columns" :dataSource="pets" :loading="loading" :pagination="{
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
            :src="record.image || '/default-pet.png'"
            alt="pet"
            class="pet-image"
          />
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <a-space>
            <a-button type="primary" @click="showUpdateModal(record)">更新</a-button>
            <a-upload
              :showUploadList="false"
              :beforeUpload="() => false"
              @change="(info) => handleImageUpload(record.petId, info.file)"
            >
              <a-button type="primary" style="background-color: #52c41a; border-color: #52c41a">更新图片</a-button>
            </a-upload>
            <a-popconfirm
              title="确定要删除这个宠物吗？"
              @confirm="handleDelete(record.petId)"
            >
              <a-button type="primary" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 更新宠物模态框 -->
    <a-modal
      v-model:open="modalVisible"
      title="更新宠物信息"
      :confirmLoading="modalLoading"
      @ok="handleUpdate"
      @cancel="modalVisible = false"
    >
      <a-form
        v-if="currentPet"
        :model="currentPet"
        layout="vertical"
      >
        <a-form-item label="名称">
          <a-input v-model:value="currentPet.petName" />
        </a-form-item>
        <a-form-item label="类型">
          <a-select v-model:value="currentPet.type.typeId">
            <a-select-option 
              v-for="type in petTypes" 
              :key="type.typeId" 
              :value="type.typeId"
            >
              {{ type.typeName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="性别">
          <a-select v-model:value="currentPet.sex">
            <a-select-option value="雄性">雄性</a-select-option>
            <a-select-option value="雌性">雌性</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="颜色">
          <a-input v-model:value="currentPet.color" />
        </a-form-item>
        <a-form-item label="体重(kg)">
          <a-input-number v-model:value="currentPet.weight" :min="0" :max="100" :step="0.1" />
        </a-form-item>
        <a-form-item label="出生日期">
          <a-date-picker 
            v-model:value="currentPet.birthDate" 
            style="width: 100%" 
            :valueFormat="'x'"
          />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="currentPet.description" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 创建宠物模态框 -->
    <a-modal
      v-model:open="createModalVisible"
      title="创建宠物"
      :confirmLoading="createModalLoading"
      @ok="handleCreate"
      @cancel="createModalVisible = false"
    >
      <a-form
        :model="newPet"
        layout="vertical"
      >
        <a-form-item 
          label="名称" 
          required
          :rules="[{ required: true, message: '请输入名称' }]"
        >
          <a-input v-model:value="newPet.petName" />
        </a-form-item>
        <a-form-item label="类型">
          <a-select v-model:value="newPet.type.typeId">
            <a-select-option 
              v-for="type in petTypes" 
              :key="type.typeId" 
              :value="type.typeId"
            >
              {{ type.typeName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="性别">
          <a-select v-model:value="newPet.sex">
            <a-select-option value="雄性">雄性</a-select-option>
            <a-select-option value="雌性">雌性</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="颜色">
          <a-input v-model:value="newPet.color" />
        </a-form-item>
        <a-form-item label="体重(kg)">
          <a-input-number v-model:value="newPet.weight" :min="0" :max="100" :step="0.1" />
        </a-form-item>
        <a-form-item label="出生日期">
          <a-date-picker 
            v-model:value="newPet.birthDate" 
            style="width: 100%" 
            :valueFormat="'x'"
          />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="newPet.description" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.pet-list {
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

.pet-image {
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
  .pet-list {
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