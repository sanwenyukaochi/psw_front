<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { CalendarOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import goodOrderApi from '@/api/user/goodOrder.js';

// 状态管理
const loading = ref(false);
const orders = ref([]);
const total = ref(0);
const pageNum = ref(0);
const pageSize = ref(4);

// 获取订单列表
const fetchOrders = async () => {
  try {
    loading.value = true;
    const { data } = await goodOrderApi.getGoodOrderList(pageNum.value, pageSize.value);
    orders.value = data.records;
    total.value = data.total;
    pageNum.value = data.pageNum;
    pageSize.value = data.pageSize;
  } catch (error) {
    console.error('获取订单列表失败:', error);
    message.error('获取订单列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handlePageChange = (page, size) => {
  pageNum.value = page - 1;
  pageSize.value = size;
  fetchOrders();
};

// 删除订单
const handleDeleteOrder = (orderId) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个订单吗？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        await goodOrderApi.deleteGoodOrder(orderId);
        message.success('删除成功');
        fetchOrders();
      } catch (error) {
        console.error('删除订单失败:', error);
        message.error('删除订单失败');
      }
    }
  });
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 格式化价格
const formatPrice = (price) => {
  return `¥${price.toFixed(2)}`;
};

// 当前页码的计算属性
const currentPage = computed({
  get: () => pageNum.value + 1,
  set: (val) => {
    pageNum.value = val - 1;
  }
});

// 初始化
onMounted(() => {
  fetchOrders();
});
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="page-header">
        <h1>我的订单</h1>
      </div>

      <a-spin :spinning="loading">
        <div class="order-list">
          <div v-for="order in orders" :key="order.goodOrderId" class="order-card">
            <div class="order-header">
              <div class="order-info">
                <span class="order-id">订单号: {{ order.goodOrderId }}</span>
                <span class="order-date">
                  <calendar-outlined />
                  {{ formatDate(order.createdAt) }}
                </span>
              </div>
              <div class="order-status">
                <a-tag :color="order.shippingStatus ? 'success' : 'warning'">
                  {{ order.shippingStatus ? '已发货' : '待发货' }}
                </a-tag>
              </div>
            </div>

            <div class="order-content">
              <div class="good-info">
                <img :src="order.good.image" :alt="order.good.goodName" class="good-image" />
                <div class="good-details">
                  <h3>{{ order.good.goodName }}</h3>
                  <p>{{ order.good.description }}</p>
                  <div class="good-meta">
                    <span>单价: {{ formatPrice(order.good.price) }}</span>
                    <span>数量: {{ order.count }}</span>
                    <span>总价: {{ formatPrice(order.totalPrice) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="order-actions">
              <a-button 
                v-if="!order.shippingStatus"
                danger 
                @click="handleDeleteOrder(order.goodOrderId)"
              >
                <delete-outlined />
                取消订单
              </a-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <a-pagination
            v-model:current="currentPage"
            :total="total"
            :pageSize="pageSize"
            show-size-changer
            :pageSizeOptions="['4', '5', '6', '7']"
            @change="handlePageChange"
            @showSizeChange="handlePageChange"
          />
        </div>
      </a-spin>
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
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1677ff;
  margin: 0;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.order-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.order-id {
  font-weight: 500;
  color: #1677ff;
}

.order-date {
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.order-content {
  margin-bottom: 16px;
}

.good-info {
  display: flex;
  gap: 12px;
}

.good-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.good-details {
  flex: 1;
}

.good-details h3 {
  font-size: 16px;
  margin: 0 0 4px;
  color: #1677ff;
}

.good-details p {
  color: #666;
  margin-bottom: 4px;
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.good-meta {
  display: flex;
  gap: 12px;
  color: #999;
  font-size: 12px;
}

.order-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.pagination {
  margin-top: 24px;
  text-align: center;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .page-container {
    padding: 12px;
  }

  .good-info {
    flex-direction: column;
  }

  .good-image {
    width: 100%;
    height: 160px;
  }

  .good-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>