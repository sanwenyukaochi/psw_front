<template>
  <a-layout style="min-height: 100vh">
    <!--sider-->
    <a-layout-sider v-model:collapsed="collapsed" collapsible width=auto>
      <div class="logo" />
      <AdminSider/>
    </a-layout-sider>
    <a-layout>
      <!--header-->
      <a-layout-header class="title" >
        ☑️✅☑️宠物销售后台管理系统☑️✅☑️
      </a-layout-header>
      <!--content-->
      <a-layout-content style="margin: 0 16px">
        <router-view></router-view>
      </a-layout-content>
      <!--footer-->
      <a-layout-footer class="footer">
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

/* 页脚样式 */
.footer {
  text-align: center;

  background-size: cover;
  background-position: center;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 1px;
}

.footer a {

  text-decoration: none;
  transition: color 0.3s;
}

.footer a:hover {
  color: #f4a261;
}

/* 标题样式 */
.title {
  color: #ffffff;
  background-color: #4885ed;
  background-size: cover;
  background-position: center;
  font-size: 20px;
  font-weight: bold;
  padding: 0 16px;
}
</style>