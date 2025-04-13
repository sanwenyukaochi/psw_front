<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Card, Statistic, Row, Col, message } from 'ant-design-vue';
import { UserOutlined, ShoppingOutlined, ShoppingCartOutlined, CommentOutlined } from '@ant-design/icons-vue';
import * as echarts from 'echarts';
import MainListApi from '@/api/admin/MainList.js';

const loading = ref(false);
const statistics = ref({
  petCount: 0,
  goodCount: 0,
  userCount: 0,
  forumCount: 0
});
const typeStats = ref([]);

// 获取统计数据
const fetchStatistics = async () => {
  try {
    loading.value = true;
    const { data } = await MainListApi.getMainList();
    statistics.value = data.statistics;
    typeStats.value = data.typeStats;
    initChart();
  } catch (error) {
    console.error('获取统计数据失败:', error);
    message.error('获取统计数据失败');
  } finally {
    loading.value = false;
  }
};

// 初始化图表
const initChart = () => {
  const chartDom = document.getElementById('typeChart');
  if (!chartDom) return;
  
  const myChart = echarts.init(chartDom);
  const option = {
    title: {
      text: '宠物类型分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: '宠物类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: typeStats.value.map(item => ({
          value: item.petCount,
          name: item.typeName
        }))
      }
    ]
  };
  
  myChart.setOption(option);
  
  const resizeHandler = () => {
    myChart.resize();
  };
  window.addEventListener('resize', resizeHandler, { passive: true });

  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler);
    myChart.dispose();
  });
};

onMounted(() => {
  fetchStatistics();
  initChart();
});
</script>

<template>
  <div class="main-container">
    <div class="statistics-cards">
      <Row :gutter="16">
        <Col :span="6">
          <Card>
            <Statistic
              title="宠物总数"
              :value="statistics.petCount"
              :value-style="{ color: '#1677ff' }"
            >
              <template #prefix>
                <ShoppingCartOutlined />
              </template>
            </Statistic>
          </Card>
        </Col>
        <Col :span="6">
          <Card>
            <Statistic
              title="商品总数"
              :value="statistics.goodCount"
              :value-style="{ color: '#52c41a' }"
            >
              <template #prefix>
                <ShoppingOutlined />
              </template>
            </Statistic>
          </Card>
        </Col>
        <Col :span="6">
          <Card>
            <Statistic
              title="用户总数"
              :value="statistics.userCount"
              :value-style="{ color: '#722ed1' }"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </Statistic>
          </Card>
        </Col>
        <Col :span="6">
          <Card>
            <Statistic
              title="论坛帖子数"
              :value="statistics.forumCount"
              :value-style="{ color: '#fa8c16' }"
            >
              <template #prefix>
                <CommentOutlined />
              </template>
            </Statistic>
          </Card>
        </Col>
      </Row>
    </div>

    <div class="chart-container">
      <Card>
        <div id="typeChart" style="width: 100%; height: 400px;"></div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  padding: 24px;
  background: #fff;
  border-radius: 4px;
}

.statistics-cards {
  margin-bottom: 24px;
}

.chart-container {
  margin-top: 24px;
}

:deep(.ant-card) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid #f0f0f0;
}

:deep(.ant-statistic-title) {
  font-size: 14px;
  color: #888;
}

:deep(.ant-statistic-content) {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

:deep(.ant-statistic .anticon) {
  background-color: #f0f0f0;
  border-radius: 50%;
  padding: 8px;
  margin-right: 8px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .main-container {
    padding: 12px;
  }

  :deep(.ant-row) {
    margin: 0 -8px;
  }

  :deep(.ant-col) {
    padding: 0 8px;
    margin-bottom: 16px;
  }

  .chart-container {
    margin-top: 16px;
  }
}
</style>