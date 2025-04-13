<script setup>
import { reactive, onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import { CalendarOutlined } from '@ant-design/icons-vue';
import noticeApi from "@/api/user/notice.js";

// 状态管理
const loading = ref(false);
const notices = ref([]);
const total = ref(0);
const pageNum = ref(0);
const pageSize = ref(6);
const activeKey = ref('');

// 获取公告列表
const fetchNotices = async (currentPage = 0, size = 6) => {
  try {
    loading.value = true;
    const params = {
      pageNum: Number(currentPage),
      pageSize: Number(size),
    };
    const { data } = await noticeApi.getNoticeList(params);
    
    notices.value = data.records;
    total.value = data.total;
    pageNum.value = data.pageNum;
    pageSize.value = data.pageSize;
    
    // 默认展开第一条公告
    if (notices.value.length > 0 && !activeKey.value) {
      activeKey.value = notices.value[0].noticeId;
    }
  } catch (error) {
    message.error('获取公告列表失败');
    console.error('获取公告列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handlePageChange = (page) => {
  fetchNotices(page - 1, pageSize.value);
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 初始化
onMounted(() => {
  fetchNotices();
});
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="notice-header">
        <h1 class="notice-title">系统公告</h1>
      </div>

      <div class="notice-list">
        <a-spin :spinning="loading">
          <a-collapse v-model:activeKey="activeKey" :bordered="false" accordion>
            <a-collapse-panel 
              v-for="notice in notices" 
              :key="notice.noticeId"
              :header="notice.noticeTitle"
            >
              <template #extra>
                <span class="notice-date">
                  <calendar-outlined />
                  {{ formatDate(notice.createdAt) }}
                </span>
              </template>
              <div class="notice-content">
                <p>{{ notice.noticeContent }}</p>
              </div>
            </a-collapse-panel>
          </a-collapse>
          
          <!-- 分页 -->
          <div class="pagination">
            <a-pagination
              v-if="total > pageSize"
              size="small"
              :current="pageNum + 1"
              :total="total"
              :pageSize="pageSize"
              @change="handlePageChange"
              show-less-items
            />
          </div>
        </a-spin>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  padding: 24px;
}

.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
}

.notice-header {
  margin-bottom: 32px;
  text-align: center;
  position: relative;
}

.notice-title {
  font-size: 32px;
  font-weight: 600;
  background: linear-gradient(90deg, #1677ff, #69c0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  animation: fadeInDown 0.8s ease-out;
}

.notice-list {
  animation: fadeIn 1s ease-out;
}

:deep(.ant-collapse) {
  background: transparent;
}

:deep(.ant-collapse > .ant-collapse-item) {
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

:deep(.ant-collapse > .ant-collapse-item:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

:deep(.ant-collapse-header) {
  font-size: 16px;
  font-weight: 500;
  color: #333 !important;
  transition: color 0.3s ease;
  padding: 16px 24px !important;
}

:deep(.ant-collapse-header:hover) {
  color: #1677ff !important;
}

:deep(.ant-collapse-content) {
  background: rgba(255, 255, 255, 0.5);
  border-top: 1px solid rgba(22, 119, 255, 0.1);
}

.notice-date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  padding: 4px 12px;
  background: rgba(22, 119, 255, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.notice-date:hover {
  background: rgba(22, 119, 255, 0.2);
  transform: scale(1.05);
}

.notice-content {
  padding: 16px 24px;
  font-size: 15px;
  line-height: 1.8;
  color: #555;
  animation: fadeIn 0.5s ease-out;
}

.pagination {
  margin-top: 24px;
  text-align: center;
}

/* 动画定义 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .page-container {
    padding: 12px;
  }

  .content-wrapper {
    padding: 0 12px;
  }

  .notice-title {
    font-size: 24px;
  }

  :deep(.ant-collapse-header) {
    padding: 12px 16px !important;
    font-size: 15px;
  }

  .notice-content {
    padding: 12px 16px;
    font-size: 14px;
  }

  .notice-date {
    font-size: 12px;
    padding: 2px 8px;
  }
}
</style>