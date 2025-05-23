<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { VideoCameraOutlined } from '@ant-design/icons-vue';
import homeApi from '@/api/user/home.js';

const props = defineProps({
  onStream: Function
});

const router = useRouter();
const loading = ref(false);
const pets = ref([]);

// 获取首页宠物列表
const fetchMainPets = async () => {
  try {
    loading.value = true;
    const { data } = await homeApi.mainPetList();
    pets.value = data;
  } catch (error) {
    console.error('获取首页宠物列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 换一批宠物
const refreshPets = async () => {
  await fetchMainPets();
};

// 跳转到宠物详情页
const goToPetDetail = (petId) => {
  router.push(`/pet/${petId}`);
};

// 直播弹窗由父组件控制
const goToStream = (streamUrl) => {
  if (props.onStream) {
    props.onStream(streamUrl);
  } else {
    message.info('该宠物暂无直播');
  }
};

// 初始化
onMounted(() => {
  fetchMainPets();
});
</script>

<template>
  <div class="pet-section">
    <div class="section-header">
      <h2 class="section-title">宠物推荐</h2>
      <a-button 
        type="primary" 
        @click="refreshPets" 
        :loading="loading"
        class="refresh-btn"
      >
        换一批
      </a-button>
    </div>
    <a-spin :spinning="loading">
      <div class="pet-grid">
        <div 
          v-for="pet in pets" 
          :key="pet.petId" 
          class="pet-card"
          @click="goToPetDetail(pet.petId)"
        >
          <div class="pet-card-inner">
            <div class="pet-image-container">
              <img :src="pet.image" :alt="pet.petName" class="pet-image" />
              <video-camera-outlined 
                class="stream-icon" 
                @click.stop="goToStream(pet.streamUrl)"
              />
              <div class="pet-type-tag">{{ pet.type.typeName }}</div>
            </div>
            <div class="pet-info">
              <h3 class="pet-name">{{ pet.petName }}</h3>
              <div class="pet-meta">
                <span class="pet-sex">{{ pet.sex }}</span>
                <span class="pet-color">{{ pet.color }}</span>
              </div>
              <div class="pet-weight">
                <span class="label">体重：</span>
                <span class="value">{{ pet.weight }}kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<style scoped>
.pet-section {
  width: 100%;
  position: relative;
  z-index: 2;
}

.section-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
}

.section-title {
  text-align: center;
  color: #ffffff;
  font-size: 28px;
  font-weight: 600;
  position: relative;
  margin: 0;
}

.refresh-btn {
  position: absolute;
  right: 0;
  background: #1e40af;
  border: none;
  height: 40px;
  padding: 0 24px;
  font-size: 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: #1e3a8a;
  transform: translateY(-2px);
}

.pet-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 20px 0;
}

.pet-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  animation: slideUp 0.5s ease-out;
  animation-fill-mode: both;
}

.pet-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.pet-image-container {
  position: relative;
  padding-top: 100%;
  overflow: hidden;
}

.pet-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.pet-card:hover .pet-image {
  transform: scale(1.1);
}

.stream-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 24px;
  color: #fff;
  cursor: pointer;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 2;
}

.stream-icon:hover {
  color: #1677ff;
  transform: scale(1.2);
}

.pet-type-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: #1e40af;
  font-weight: 500;
  z-index: 2;
}

.pet-info {
  padding: 16px;
}

.pet-name {
  font-size: 18px;
  color: #333;
  margin: 0 0 12px;
  font-weight: 600;
}

.pet-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.pet-sex, .pet-color {
  font-size: 13px;
  color: #666;
  padding: 2px 10px;
  background: #f0f0f0;
  border-radius: 20px;
}

.pet-weight {
  font-size: 13px;
  color: #666;
}

.pet-weight .label {
  color: #999;
}

.pet-weight .value {
  color: #1e40af;
  font-weight: 500;
}

/* 动画效果 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 为每个卡片添加不同的动画延迟 */
.pet-card:nth-child(1) { animation-delay: 0.1s; }
.pet-card:nth-child(2) { animation-delay: 0.2s; }
.pet-card:nth-child(3) { animation-delay: 0.3s; }
.pet-card:nth-child(4) { animation-delay: 0.4s; }
.pet-card:nth-child(5) { animation-delay: 0.5s; }
.pet-card:nth-child(6) { animation-delay: 0.6s; }
.pet-card:nth-child(7) { animation-delay: 0.7s; }
.pet-card:nth-child(8) { animation-delay: 0.8s; }

/* 响应式设计 */
@media screen and (max-width: 1200px) {
  .pet-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .pet-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .section-title {
    font-size: 24px;
  }
}

@media screen and (max-width: 480px) {
  .pet-grid {
    grid-template-columns: 1fr;
  }
}
</style>