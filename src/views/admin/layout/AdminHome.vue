<template>
  <a-layout style="min-height: 100vh">
    <!--sider-->
    <a-layout-sider v-model:collapsed="collapsed" collapsible width=auto>
      <div class="logo" />
      <AdminSider/>
    </a-layout-sider>
    <a-layout>
      <!--header-->
      <a-layout-header style="background: #fff; padding: 0" >
        ☑️✅☑️宠物销售后台管理系统☑️✅☑️
      </a-layout-header>
      <!--content-->
      <a-layout-content style="margin: 0 16px">
        <router-view></router-view>
      </a-layout-content>
      <!--footer-->
      <a-layout-footer style="text-align: center">
        <a href="https://github.com/sanwenyukaochi" target="_blank">
          我是 三文鱼烤翅 ，欢迎访问我的 GitHub ！
        </a>
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script setup>
import { ref } from 'vue';
const collapsed = ref(false);
import AdminSider from "@/views/admin/layout/AdminSider.vue";
</script>
<style scoped>
#components-layout-demo-side .logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
}

.site-layout .site-layout-background {
  background: #fff;
}
[data-theme='dark'] .site-layout .site-layout-background {
  background: #141414;
}
</style>