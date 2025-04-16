<script setup>
import { reactive, onMounted, ref, computed } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { ShoppingOutlined, CheckCircleOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import goodApi from "@/api/user/good.js";
import goodOrderApi from "@/api/user/goodOrder.js";

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

// 购买相关状态
const purchaseVisible = ref(false);
const currentGood = ref(null);
const purchaseCount = ref(1);
const purchaseLoading = ref(false);
const showSuccessAnimation = ref(false);
const successMessage = ref('');

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

// 打开购买弹窗
const openPurchaseModal = (good) => {
  currentGood.value = good;
  purchaseCount.value = 1;
  purchaseVisible.value = true;
};

// 关闭购买弹窗
const closePurchaseModal = () => {
  purchaseVisible.value = false;
  currentGood.value = null;
  purchaseCount.value = 1;
};

// 处理购买数量变化
const handleCountChange = (value) => {
  purchaseCount.value = value;
};

// 提交购买
const handlePurchase = async () => {
  if (!currentGood.value) return;
  
  try {
    purchaseLoading.value = true;
    await goodOrderApi.createGoodOrder(currentGood.value.goodId, { number: purchaseCount.value });
    successMessage.value = `成功购买 ${currentGood.value.goodName} x${purchaseCount.value}`;
    showSuccessAnimation.value = true;
    closePurchaseModal();
    // 刷新商品列表以更新库存
    fetchGoods(pageNum.value, pageSize.value);
    
    // 3秒后自动隐藏动画
    setTimeout(() => {
      showSuccessAnimation.value = false;
    }, 3000);
  } catch (error) {
    message.error(error);
    console.error('购买失败');
  } finally {
    purchaseLoading.value = false;
  }
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
                  <shopping-outlined 
                    class="cart-icon" 
                    @click.stop="openPurchaseModal(good)"
                  />
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

    <!-- 购买弹窗 -->
    <a-modal
      v-model:open="purchaseVisible"
      title="购买商品"
      @cancel="closePurchaseModal"
      :confirmLoading="purchaseLoading"
      @ok="handlePurchase"
    >
      <div v-if="currentGood" class="purchase-modal-content">
        <div class="good-info">
          <img :src="currentGood.image" :alt="currentGood.goodName" class="modal-good-image" />
          <div class="good-details">
            <h3>{{ currentGood.goodName }}</h3>
            <p class="price">{{ formatPrice(currentGood.price) }}</p>
            <p class="stock">库存: {{ currentGood.stock }}</p>
          </div>
        </div>
        
        <div class="purchase-form">
          <a-form-item label="购买数量">
            <a-input-number
              v-model:value="purchaseCount"
              :min="1"
              @change="handleCountChange"
            />
          </a-form-item>
          
          <div class="total-price">
            <span>总价：</span>
            <span class="price">{{ formatPrice(currentGood.price * purchaseCount) }}</span>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 购买成功动画 -->
    <transition name="fade">
      <div v-if="showSuccessAnimation" class="success-animation">
        <div class="success-content">
          <check-circle-outlined class="success-icon" />
          <span>{{ successMessage }}</span>
        </div>
      </div>
    </transition>
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

.purchase-modal-content {
  padding: 16px 0;
}

.good-info {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.modal-good-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.good-details {
  flex: 1;
}

.good-details h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #1677ff;
}

.good-details .price {
  color: #ff4d4f;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.good-details .stock {
  color: #999;
  font-size: 14px;
}

.purchase-form {
  margin-top: 16px;
}

.total-price {
  margin-top: 16px;
  text-align: right;
  font-size: 16px;
}

.total-price .price {
  color: #ff4d4f;
  font-size: 20px;
  font-weight: 600;
  margin-left: 8px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .good-info {
    flex-direction: column;
  }

  .modal-good-image {
    width: 100%;
    height: 200px;
  }
}

/* 成功动画样式 */
.success-animation {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  animation: slideDown 0.5s ease-out;
}

.success-content {
  background: #52c41a;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.success-icon {
  font-size: 20px;
}

/* 动画效果 */
@keyframes slideDown {
  from {
    transform: translate(-50%, -100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>