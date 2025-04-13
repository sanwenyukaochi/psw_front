<script setup>
import { reactive, onMounted, ref } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { UserOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, ShoppingOutlined } from '@ant-design/icons-vue';
import goodOrderListApi from '@/api/admin/goodOrderList.js';

// 状态管理
const loading = ref(false);
const orders = ref([]);
const total = ref(0);
const pageNum = ref(0);
const pageSize = ref(6);

// 表格列配置
const columns = [
  { title: '订单号', dataIndex: 'goodOrderId', width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', width: 150 },
  { title: '商品名称', dataIndex: 'good', width: 120 },
  { title: '数量', dataIndex: 'count', width: 80 },
  { title: '总价', dataIndex: 'totalPrice', width: 100 },
  { title: '买家', dataIndex: 'user', width: 120 },
  { title: '状态', dataIndex: 'shippingStatus', width: 100 },
  { title: '操作', dataIndex: 'action', width: 200, fixed: 'right' }
];

// 获取订单列表
const fetchOrders = async (page = pageNum.value, size = pageSize.value) => {
  try {
    loading.value = true;
    const { data } = await goodOrderListApi.getGoodOrderList({
      pageNum: page,
      pageSize: size
    });
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
const handleTableChange = (pagination) => {
  fetchOrders(pagination.current - 1, pagination.pageSize);
};

// 处理发货
const handleShipment = async (orderId) => {
  try {
    await goodOrderListApi.updateShipment(orderId);
    message.success('发货成功');
    fetchOrders();
  } catch (error) {
    console.error('发货失败:', error);
    message.error('发货失败');
  }
};

// 处理取消发货
const handleCancelShipment = async (orderId) => {
  try {
    await goodOrderListApi.updateCancelShipment(orderId);
    message.success('取消发货成功');
    fetchOrders();
  } catch (error) {
    console.error('取消发货失败:', error);
    message.error('取消发货失败');
  }
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 格式化价格
const formatPrice = (price) => {
  return `￥${price.toFixed(2)}`;
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
        <h1>物品订单管理</h1>
      </div>

      <a-table 
        :columns="columns" 
        :dataSource="orders" 
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
        :scroll="{ x: 1000 }"
      >
// ... existing code ...
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'createdAt'">
            <span>
              <calendar-outlined />
              {{ formatDate(record.createdAt) }}
            </span>
          </template>
          <template v-else-if="column.dataIndex === 'good'">
            <div class="good-info">
              <img :src="record.good.image" :alt="record.good.goodName" class="good-image" />
              <span>{{ record.good.goodName }}</span>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'count'">
            <span>{{ record.count }}件</span>
          </template>
          <template v-else-if="column.dataIndex === 'totalPrice'">
            <span class="price">{{ formatPrice(record.totalPrice) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'user'">
            <div class="user-info">
              <img :src="record.user.avatar" :alt="record.user.username" class="user-avatar" />
              <span>{{ record.user.username }}</span>
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'shippingStatus'">
            <a-tag :color="record.shippingStatus ? 'success' : 'warning'">
              {{ record.shippingStatus ? '已发货' : '待发货' }}
            </a-tag>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-space>
              <a-button 
                v-if="!record.shippingStatus" 
                type="primary" 
                @click="handleShipment(record.goodOrderId)"
              >
                <check-circle-outlined />
                发货
              </a-button>
              <a-button 
                v-else 
                danger 
                @click="handleCancelShipment(record.goodOrderId)"
              >
                <close-circle-outlined />
                取消发货
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 24px;
  background: #fff;
  border-radius: 4px;
}

.content-wrapper {
  max-width: none;
  margin: 0;
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

.good-info, .user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.good-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.price {
  color: #ff4d4f;
  font-weight: 500;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .page-container {
    padding: 12px;
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
}
</style>