<script setup>
import { reactive, ref, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { UserOutlined, CalendarOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import petOrderApi from '@/api/user/petOrder.js';

// 状态管理
const loading = ref(false);
const orders = ref([]);
const total = ref(0);
const pageNum = ref(0);
const pageSize = ref(6);

// 获取订单列表
const fetchOrders = async () => {
  try {
    loading.value = true;
    const { data } = await petOrderApi.getPetOrderList();
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

// 删除订单
const handleDeleteOrder = (orderId) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个订单吗？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        await petOrderApi.deletePetOrder(orderId);
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
          <div v-for="order in orders" :key="order.petOrderId" class="order-card">
            <div class="order-header">
              <div class="order-info">
                <span class="order-id">订单号: {{ order.petOrderId }}</span>
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
              <div class="pet-info">
                <img :src="order.pet.image" :alt="order.pet.petName" class="pet-image" />
                <div class="pet-details">
                  <h3>{{ order.pet.petName }}</h3>
                  <p>{{ order.pet.description }}</p>
                  <div class="pet-meta">
                    <span>品种: {{ order.pet.type.typeName }}</span>
                    <span>性别: {{ order.pet.sex }}</span>
                    <span>颜色: {{ order.pet.color }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="order-actions">
              <a-button 
                v-if="!order.shippingStatus"
                danger 
                @click="handleDeleteOrder(order.petOrderId)"
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
            v-model:current="pageNum"
            :total="total"
            :pageSize="pageSize"
            show-size-changer
            @change="fetchOrders"
            @showSizeChange="fetchOrders"
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

.pet-info {
  display: flex;
  gap: 12px;
}

.pet-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.pet-details {
  flex: 1;
}

.pet-details h3 {
  font-size: 16px;
  margin: 0 0 4px;
  color: #1677ff;
}

.pet-details p {
  color: #666;
  margin-bottom: 4px;
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pet-meta {
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

  .pet-info {
    flex-direction: column;
  }

  .pet-image {
    width: 100%;
    height: 160px;
  }

  .pet-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>