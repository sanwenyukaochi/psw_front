<script setup>
import { h } from "vue";
import { HomeFilled, PieChartOutlined } from "@ant-design/icons-vue";
import bgImage from "@/assets/img/bg/counter_bg.jpg";
import logoImage from '@/assets/img/logo/w_logo0.png';
import router from "@/router/index.js";
const items = [
  {key: '1', label: '主页', icon: () => h(PieChartOutlined), onClick: () => router.push('/main')},
  {key: '2', label: '宠物购买', icon: () => h(PieChartOutlined), onClick: () => router.push('/pet')},
  {key: '3', label: '商店', icon: () => h(HomeFilled), onClick: () => router.push('/good')},
  {key: '4', label: '论坛', icon: () => h(HomeFilled), onClick: () => router.push('/forum')},
  {key: '5', label: '公告', icon: () => h(HomeFilled),},
  {key: '6', label: '个人中心', icon: () => h(HomeFilled),},
];
</script>

<template>
  <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
    <a-menu
        theme="dark"
        mode="horizontal"
        :items="items"
        :style="{
        lineHeight: '64px',
        backgroundColor: 'transparent',
        backgroundImage: `url(${bgImage})`,
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        padding: '0 20px',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
        display: 'inline-flex',  // 防止菜单占满父容器宽度
      }"
    >
    </a-menu>
    <img :src="logoImage" alt="admin logo" style="height: 60px;">
    <div style="color: white;">宠物销售管理系统</div>
  </div>
</template>

<style scoped>

</style>
