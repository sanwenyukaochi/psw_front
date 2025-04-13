<script setup>
import { reactive, onMounted, ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { ShoppingOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import goodApi from "@/api/user/good.js";

// 状态管理
const router = useRouter();
const loading = ref(false);
const goods = ref([]);
const total = ref(0);
const pageNum = ref(0);
const pageSize = ref(12);

const filter = reactive({
  goodName: '',
  minPrice: undefined,
  maxPrice: undefined,
});

// 当前页码的计算属性
const currentPage = computed({
  get: () => pageNum.value + 1,
  set: (val) => {
    pageNum.value = val - 1;
  }
});

// 获取商品列表
const fetchGoods = async (currentPage = 0, size = 12) => {
  try {
    loading.value = true;
    const params = {
      pageNum: Number(currentPage),
      pageSize: Number(size),
      ...filter
    };
    const { data } = await goodApi.getGoodList(params);
    
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

// 处理分页变化
const handlePageChange = (page, size) => {
  fetchGoods(page - 1, size);
};

// 搜索
const handleSearch = () => {
  fetchGoods(0);
};

// 重置搜索
const handleReset = () => {
  filter.goodName = '';
  filter.minPrice = undefined;
  filter.maxPrice = undefined;
  fetchGoods(0);
};

// 格式化价格
const formatPrice = (price) => {
  return `¥${price.toFixed(2)}`;
};

// 初始化
onMounted(() => {
  fetchGoods();
});
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="good-container">
        <!-- 左侧筛选区域 -->
        <div class="filter-sidebar">
          <h2 class="filter-title">筛选</h2>
          <a-form layout="vertical">
            <a-form-item label="商品名称">
              <a-input
                v-model:value="filter.goodName"
                placeholder="搜索商品名称"
                allow-clear
              />
            </a-form-item>

            <a-form-item label="价格区间">
              <div class="price-range">
                <a-input-number
                  v-model:value="filter.minPrice"
                  placeholder="最低价"
                  :min="0"
                  style="width: 110px"
                />
                <span class="price-separator">-</span>
                <a-input-number
                  v-model:value="filter.maxPrice"
                  placeholder="最高价"
                  :min="0"
                  style="width: 110px"
                />
              </div>
            </a-form-item>

            <a-form-item>
              <a-button type="primary" block @click="handleSearch">搜索</a-button>
              <a-button block @click="handleReset" style="margin-top: 8px">重置</a-button>
            </a-form-item>
          </a-form>
        </div>

        <!-- 右侧商品展示区域 -->
        <div class="good-content">
          <a-spin :spinning="loading">
            <div class="good-grid">
              <div v-for="good in goods" :key="good.goodId" class="good-card">
                <div class="good-card-header">
                  <img :src="good.image || '/default-good.png'" :alt="good.goodName" class="good-image"/>
                  <shopping-outlined class="cart-icon" />
                </div>
                <div class="good-card-content">
                  <h3 class="good-name">{{ good.goodName }}</h3>
                  <p class="good-description">{{ good.description }}</p>
                  <div class="good-footer">
                    <span class="price">{{ formatPrice(good.price) }}</span>
                    <span class="stock">库存: {{ good.stock }}</span>
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
                :pageSizeOptions="['8', '12', '16', '24']"
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
  background: #f0f2f5;
  padding: 24px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.good-container {
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

.price-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-separator {
  color: #999;
}

.good-content {
  flex: 1;
  min-width: 0;
}

.good-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.good-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.good-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.good-card-header {
  position: relative;
}

.good-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.cart-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 24px;
  color: #fff;
  cursor: pointer;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.good-card-content {
  padding: 16px;
}

.good-name {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1677ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.good-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  height: 42px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 12px;
}

.good-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #ff4d4f;
  font-size: 18px;
  font-weight: 600;
}

.stock {
  color: #999;
  font-size: 14px;
}

.pagination {
  margin-top: 24px;
  text-align: center;
}

@media screen and (min-width: 1200px) {
  .good-grid {
    grid-template-columns: repeat(4, 1fr);
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

  .good-container {
    flex-direction: column;
  }

  .filter-sidebar {
    width: 100%;
    position: static;
    margin-bottom: 16px;
  }

  .good-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .good-image {
    height: 160px;
  }

  .good-card-content {
    padding: 12px;
  }

  .good-name {
    font-size: 14px;
  }

  .price {
    font-size: 16px;
  }

  .stock {
    font-size: 12px;
  }
}
</style>