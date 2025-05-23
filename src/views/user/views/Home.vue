<script setup>
import { ref } from 'vue';
import h3_banner_slide01 from "@/assets/img/banner/h3_banner_slide01.jpg";
import h3_banner_img01 from "@/assets/img/banner/h3_banner_img01.jpg";
import h3_banner_img02 from "@/assets/img/banner/h3_banner_img02.jpg";
import shopBg from "@/assets/img/bg/shop_bg.jpg";
import MainPetList from "@/components/MainPetList.vue";

const streamVisible = ref(false);
const currentStreamUrl = ref('');

const goToStream = (streamUrl) => {
  if (streamUrl) {
    currentStreamUrl.value = streamUrl;
    streamVisible.value = true;
  } else {
    alert('暂无直播');
  }
};
const handleStreamClose = () => {
  streamVisible.value = false;
  currentStreamUrl.value = '';
};
</script>

<template>
  <div class="banner-container">
    <!-- 左侧大图 -->
    <div class="banner-left">
      <img :src="h3_banner_slide01" alt="bg">
    </div>

    <!-- 右侧两张小图 -->
    <div class="banner-right">
      <div class="banner-small">
        <img :src="h3_banner_img01" alt="bg">
      </div>
      <div class="banner-small">
        <img :src="h3_banner_img02" alt="bg">
      </div>
    </div>
  </div>

  <div class="content-section" :style="{ backgroundImage: `url(${shopBg})` }">
    <div class="banner-container">
      <MainPetList :onStream="goToStream" />
    </div>
  </div>

  <!-- 直播弹窗 -->
  <a-modal
    v-model:open="streamVisible"
    title="宠物直播"
    :footer="null"
    width="800px"
    @cancel="handleStreamClose"
  >
    <div class="stream-container">
      <img
        v-if="currentStreamUrl"
        :src="currentStreamUrl"
        alt="宠物直播流"
        class="stream-img"
      />
    </div>
  </a-modal>

<!--  <div class="content-section">-->
<!--    <div class="banner-container">Content</div>-->
<!--            <MainGoodList/>-->
<!--  </div>-->
</template>

<style scoped>

/* Banner 主要布局 */
.banner-container {
  max-width: 1200px;  /* 与商品和宠物卡片容器宽度一致 */
  margin: 0 auto;     /* 居中显示 */
  padding: 35px;      /* 与商品和宠物卡片容器padding一致 */
  display: flex;
  gap: 20px;
}

/* 左侧大图 */
.banner-left {
  flex: 2;
  border-radius: 10px;
  overflow: hidden;
}

.banner-left img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 右侧两张小图 */
.banner-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.banner-small {
  height: calc(50% - 10px);  /* 减去gap的一半 */
  border-radius: 10px;
  overflow: hidden;
}

.banner-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 主要内容区 */
.content-section {
  background: #fff;
  padding: 24px;
  min-height: 380px;
}

/* 页脚样式 */

.footer a {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.footer a:hover {
  color: #f4a261;
}

.stream-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.stream-img {
  width: 100%;
  max-height: 600px;
  object-fit: contain;
}
</style>