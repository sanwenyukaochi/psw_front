<style scoped>
</style>

<script setup>
import {h, ref} from "vue";
import {useRouter} from 'vue-router';

const router = useRouter();
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

const selectedKeys = ref(['1']);
const openKeys = ref(['sub1']); // 用于控制展开的子菜单
const handleOpenChange = (keys) => {
  const latestOpenKey = keys.find(key => openKeys.value.indexOf(key) === -1);
  if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].indexOf(latestOpenKey) === -1) {
    openKeys.value = keys;
  } else {
    openKeys.value = latestOpenKey ? [latestOpenKey] : [];
  }
};

const items = [
  {key: '1', label: '主页', icon: () => h(PieChartOutlined),},
  {key: '2', label: '主页', icon: () => h(HomeFilled),},
  {key: '3', label: '用户管理', icon: () => h(HeartFilled), onClick: () => router.push('/userList'),},
  {key: '4', label: '宠物管理', icon: () => h(SnippetsFilled), onClick: () => router.push('/petList'),},
  {key: '5', label: '商品管理', icon: () => h(StarFilled), onClick: () => router.push('/goodList'),},
  {key: '6', label: '宠物分类管理', icon: () => h(CrownFilled), onClick: () => router.push('/typeList'),},
  {key: '7', label: '宠物订单管理', icon: () => h(CreditCardFilled), onClick: () => router.push('/'),},
  {key: '8', label: '商品订单管理', icon: () => h(AppstoreFilled), onClick: () => router.push('/'),},
  {key: '9', label: '论坛管理', icon: () => h(FireFilled), onClick: () => router.push('/forumList'),},
  {key: '10', label: '公告管理', icon: () => h(SoundFilled), onClick: () => router.push('/noticeList'),},
  {key: '11', label: 'AI问答', icon: () => h(RobotFilled), onClick: () => router.push('/chat'),},
];

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
  //height: 60px !important;
  //line-height: 60px !important;
}
</style>