<script setup>
import {h, ref, onMounted, watch} from "vue";
import {useRouter, useRoute} from 'vue-router';

const router = useRouter();
const route = useRoute();

import {
  PieChartOutlined,
  HomeFilled,
  HeartFilled,
  SnippetsFilled,
  StarFilled,
  CrownFilled,
  CreditCardFilled,
  AppstoreFilled,
  FireFilled,
  SoundFilled,
  RobotFilled
} from '@ant-design/icons-vue';

// 根据路由路径获取对应的菜单key
const getMenuKeyByPath = (path) => {
  const pathMap = {
    '/mainList': '1',
    '/userList': '3',
    '/petList': '4',
    '/goodList': '5',
    '/typeList': '6',
    '/petOrderList': '7',
    '/goodOrderList': '8',
    '/forumList': '9',
    '/noticeList': '10',
    '/chat': '11'
  };
  return pathMap[path] || '1';
};

const selectedKeys = ref([getMenuKeyByPath(route.path)]);
const openKeys = ref([]);

// 监听路由变化，更新选中状态
watch(() => route.path, (newPath) => {
  selectedKeys.value = [getMenuKeyByPath(newPath)];
});

const handleOpenChange = (keys) => {
  const latestOpenKey = keys.find(key => openKeys.value.indexOf(key) === -1);
  if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].indexOf(latestOpenKey) === -1) {
    openKeys.value = keys;
  } else {
    openKeys.value = latestOpenKey ? [latestOpenKey] : [];
  }
};

const items = [
  {key: '1', label: '主页', icon: () => h(HomeFilled), onClick: () => router.push('/mainList')},
  {key: '3', label: '用户管理', icon: () => h(HeartFilled), onClick: () => router.push('/userList'),},
  {key: '4', label: '宠物管理', icon: () => h(SnippetsFilled), onClick: () => router.push('/petList'),},
  {key: '5', label: '商品管理', icon: () => h(StarFilled), onClick: () => router.push('/goodList'),},
  {key: '6', label: '宠物分类管理', icon: () => h(CrownFilled), onClick: () => router.push('/typeList'),},
  {key: '7', label: '宠物订单管理', icon: () => h(CreditCardFilled), onClick: () => router.push('/petOrderList'),},
  {key: '8', label: '商品订单管理', icon: () => h(AppstoreFilled), onClick: () => router.push('/goodOrderList'),},
  {key: '9', label: '论坛管理', icon: () => h(FireFilled), onClick: () => router.push('/forumList'),},
  {key: '10', label: '公告管理', icon: () => h(SoundFilled), onClick: () => router.push('/noticeList'),},
  {key: '11', label: '宠物顾问', icon: () => h(RobotFilled), onClick: () => router.push('/chat'),},
];

// 初始化时设置选中状态
onMounted(() => {
  selectedKeys.value = [getMenuKeyByPath(route.path)];
});
</script>

<template>
  <a-menu
      v-model:selectedKeys="selectedKeys"
      theme="dark"
      mode="inline"
      :open-keys="openKeys"
      :items="items"
      @openChange="handleOpenChange"
  >
  </a-menu>
</template>

<style scoped>
:deep(.ant-menu-item), :deep(.ant-menu-submenu-title) {
  height: 60px !important;
  line-height: 60px !important;
  font-size: 16px;
}

:deep(.ant-menu-item-icon) {
  font-size: 18px;
}
</style>