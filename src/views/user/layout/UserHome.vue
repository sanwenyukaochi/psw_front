<script setup>
import UserSlider from "@/views/user/layout/UserSider.vue";
</script>

<template>
  <a-layout>
    <a-layout-header class="header">
      <div class="logo" />
      <UserSlider />
    </a-layout-header>

    <a-layout-content class="content">
      <router-view></router-view>
    </a-layout-content>

    <a-layout-footer class="footer">
      <a href="https://github.com/sanwenyukaochi" target="_blank">
        我是 三文鱼烤翅 ，欢迎访问我的 GitHub ！
      </a>
    </a-layout-footer>
  </a-layout>
</template>

<style scoped>
/* 头部样式 */
.header {
  position: fixed;
  z-index: 1;
  width: 100%;
  background-image: url('@/assets/img/bg/counter_bg.jpg');
}

/* 页面内容样式 */
.content {
  padding: 0;
  margin-top: 64px;
  overflow-y: auto;
}

/* Banner 主要布局 */

/* 左侧大图 */

.banner-left img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 右侧两张小图 */

.banner-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 主要内容区 */

/* 页脚样式 */
.footer {
  text-align: center;
  color: white;
  background-image: url('@/assets/img/bg/counter_bg.jpg');
  background-size: cover;
  background-position: center;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 1px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
}

.footer a {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.footer a:hover {
  color: #f4a261;
}
</style>
