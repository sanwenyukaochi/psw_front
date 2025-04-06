<script setup>
import { reactive, onMounted, ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { HeartOutlined } from '@ant-design/icons-vue';
import petApi from "@/api/user/Pet.js";
import typeApi from "@/api/admin/typeListApi.js";

// 状态管理
const loading = ref(false);
const pets = ref([]);
const total = ref(0);
const pageNum = ref(0);
const pageSize = ref(9);
const typeOptions = ref([]);

const filter = reactive({
  petName: '',
  type: undefined,
  sex: undefined,
});

// 当前页码的计算属性
const currentPage = computed({
  get: () => pageNum.value + 1,
  set: (val) => {
    pageNum.value = val - 1;
  }
});

// 获取宠物类型列表
const fetchPetTypes = async () => {
  try {
    const { data } = await typeApi.getAllType();
    typeOptions.value = data.map(type => ({
      value: type.typeId,
      label: type.typeName
    }));
  } catch (error) {
    message.error('获取宠物类型失败');
    console.error('获取宠物类型失败:', error);
  }
};

// 获取宠物列表
const fetchPets = async (currentPage = 0, size = 9) => {
  try {
    loading.value = true;
    const params = {
      pageNum: Number(currentPage),
      pageSize: Number(size),
      ...filter
    };
    const { data } = await petApi.getPetList(params);
    
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

// 处理分页变化
const handlePageChange = (page, size) => {
  fetchPets(page - 1, size);
};

// 搜索
const handleSearch = () => {
  fetchPets(0);
};

// 重置搜索
const handleReset = () => {
  filter.petName = '';
  filter.type = undefined;
  filter.sex = undefined;
  fetchPets(0);
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString();
};

// 初始化
onMounted(() => {
  fetchPetTypes();
  fetchPets();
});
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="pet-container">
        <!-- 左侧筛选区域 -->
        <div class="filter-sidebar">
          <h2 class="filter-title">筛选</h2>
          <a-form layout="vertical">
            <a-form-item label="宠物类型">
              <a-select
                v-model:value="filter.type"
                placeholder="选择类型"
                allow-clear
                style="width: 100%"
              >
                <a-select-option 
                  v-for="type in typeOptions" 
                  :key="type.value" 
                  :value="type.value"
                >
                  {{ type.label }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="性别">
              <a-select
                v-model:value="filter.sex"
                placeholder="选择性别"
                allow-clear
                style="width: 100%"
              >
                <a-select-option value="雄性">雄性</a-select-option>
                <a-select-option value="雌性">雌性</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item>
              <a-input
                v-model:value="filter.petName"
                placeholder="搜索宠物名称"
                allow-clear
              />
            </a-form-item>

            <a-form-item>
              <a-button type="primary" block @click="handleSearch">搜索</a-button>
              <a-button block @click="handleReset" style="margin-top: 8px">重置</a-button>
            </a-form-item>
          </a-form>
        </div>

        <!-- 右侧宠物展示区域 -->
        <div class="pet-content">
          <a-spin :spinning="loading">
            <div class="pet-grid">
              <div v-for="pet in pets" :key="pet.petId" class="pet-card">
                <div class="pet-card-header">
                  <img :src="pet.image || '/default-pet.png'" :alt="pet.petName" class="pet-image"/>
                  <heart-outlined class="favorite-icon" />
                </div>
                <div class="pet-card-content">
                  <h3 class="pet-name">{{ pet.petName }}</h3>
                  <div class="pet-info">
                    <span class="info-item">
                      <span class="label">性别：</span>
                      <span class="value">{{ pet.sex }}</span>
                    </span>
                    <span class="info-item">
                      <span class="label">颜色：</span>
                      <span class="value">{{ pet.color }}</span>
                    </span>
                    <span class="info-item">
                      <span class="label">出生：</span>
                      <span class="value">{{ formatDate(pet.birthDate) }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div class="pagination">
              <a-pagination
                :current="pageNum + 1"
                :total="total"
                :pageSize="pageSize"
                show-quick-jumper
                show-size-changer
                :pageSizeOptions="['6', '9', '12', '15']"
                @change="handlePageChange"
              />
            </div>
          </a-spin>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f0f2f5;
  padding: 24px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.pet-container {
  display: flex;
  gap: 24px;
}

.filter-sidebar {
  width: 250px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 24px;
  flex-shrink: 0;
}

.filter-title {
  margin-bottom: 24px;
  font-size: 18px;
  font-weight: 600;
  color: #1677ff;
}

.checkbox-item, .radio-item {
  margin-bottom: 8px;
}

.pet-content {
  flex: 1;
  min-width: 0;
}

.pet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.pet-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.pet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.pet-card-header {
  position: relative;
}

.pet-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.favorite-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 24px;
  color: #fff;
  cursor: pointer;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.pet-card-content {
  padding: 16px;
}

.pet-name {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1677ff;
}

.pet-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.label {
  color: #666;
  margin-right: 4px;
}

.value {
  color: #333;
}

.pagination {
  margin-top: 24px;
  text-align: center;
}

@media screen and (min-width: 1200px) {
  .pet-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 移动端适配 */
@media screen and (max-width: 1200px) {
  .content-wrapper {
    padding: 0 16px;
  }
}

@media screen and (max-width: 768px) {
  .page-container {
    padding: 12px;
  }

  .content-wrapper {
    padding: 0;
  }

  .pet-container {
    flex-direction: column;
  }

  .filter-sidebar {
    width: 100%;
    position: static;
    margin-bottom: 16px;
  }

  .pet-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .pet-image {
    height: 160px;
  }

  .pet-card-content {
    padding: 12px;
  }

  .pet-name {
    font-size: 14px;
  }

  .info-item {
    font-size: 12px;
  }
}
</style>