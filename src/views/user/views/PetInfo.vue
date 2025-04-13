<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { ShoppingCartOutlined } from '@ant-design/icons-vue';
import petApi from "@/api/user/pet.js";
import petOrderApi from '@/api/user/petOrder.js';

const route = useRoute();
const router = useRouter();
const pet = ref(null);
const loading = ref(true);
const commentContent = ref('');
const submitting = ref(false);

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleDateString();
};

// 获取宠物信息
const fetchPetInfo = async () => {
  try {
    loading.value = true;
    const { data } = await petApi.getPet(route.params.id);
    pet.value = data;
  } catch (error) {
    message.error('获取宠物信息失败');
    console.error('获取宠物信息失败:', error);
  } finally {
    loading.value = false;
  }
};

// 购买宠物
const handleBuyPet = () => {
  Modal.confirm({
    title: '确认购买',
    content: '确定要购买这只宠物吗？',
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        await petOrderApi.createPetOrder(pet.value.petId);
        message.success('购买成功');
        router.push('/petOrder');
      } catch (error) {
        console.error('购买失败:', error);
        message.error('购买失败');
      }
    }
  });
};

// 提交评论
const handleSubmitComment = async () => {
  if (!commentContent.value.trim()) {
    message.warning('请输入评论内容');
    return;
  }

  try {
    submitting.value = true;
    await petApi.createComment(route.params.id, {
      comment: commentContent.value.trim()
    });
    message.success('评论成功');
    commentContent.value = ''; // 清空输入框
    await fetchPetInfo(); // 重新加载宠物信息以更新评论列表
  } catch (error) {
    message.error('评论失败');
    console.error('评论失败:', error);
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchPetInfo();
});
</script>

<template>
  <div class="page-container">
    <a-spin :spinning="loading">
      <div v-if="pet" class="pet-detail">
        <!-- 宠物基本信息区域 -->
        <div class="pet-info-section">
          <div class="pet-images">
            <img :src="pet.image" :alt="pet.petName" class="main-image" />
          </div>
          <div class="pet-info">
            <h1 class="pet-name">{{ pet.petName }}</h1>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">分类:</span>
                <span class="value">{{ pet.type.typeName }}</span>
              </div>
              <div class="info-item">
                <span class="label">品种:</span>
                <span class="value">{{ pet.petName }}</span>
              </div>
              <div class="info-item">
                <span class="label">颜色:</span>
                <span class="value">{{ pet.color }}</span>
              </div>
              <div class="info-item">
                <span class="label">性别:</span>
                <span class="value">{{ pet.sex }}</span>
              </div>
              <div class="info-item">
                <span class="label">体重:</span>
                <span class="value">{{ pet.weight }}斤</span>
              </div>
              <div class="info-item">
                <span class="label">生日:</span>
                <span class="value">{{ formatDate(pet.birthDate) }}</span>
              </div>
            </div>
            <div class="description">
              <h3>宠物介绍</h3>
              <p>{{ pet.description }}</p>
            </div>
            <div class="type-feature">
              <h3>品种特征</h3>
              <p>{{ pet.type.typeFeature }}</p>
            </div>
            <div class="pet-actions">
              <a-button 
                type="primary" 
                size="large" 
                :disabled="pet.saleStatus"
                @click="handleBuyPet"
              >
                <shopping-cart-outlined />
                {{ pet.saleStatus ? '已售出' : '立即购买' }}
              </a-button>
            </div>
          </div>
        </div>

        <!-- 评论区域 -->
        <div class="comments-section">
          <h2>评论区</h2>
          
          <!-- 评论输入框 -->
          <div class="comment-input-section">
            <a-textarea
              v-model:value="commentContent"
              :rows="4"
              placeholder="说说你的想法..."
              :maxlength="200"
              show-count
            />
            <a-button 
              type="primary"
              :loading="submitting"
              @click="handleSubmitComment"
              class="submit-comment-btn"
            >
              发表评论
            </a-button>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <div v-for="comment in pet.comments" :key="comment.commentId" class="comment-item">
              <div class="comment-header">
                <img :src="comment.user.avatar" :alt="comment.user.username" class="user-avatar" />
                <div class="comment-info">
                  <span class="username">{{ comment.user.username }}</span>
                  <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                </div>
              </div>
              <div class="comment-content">
                {{ comment.comment }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<style scoped>
.page-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.pet-detail {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.pet-info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 48px;
}

.pet-images {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.main-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.pet-info {
  display: flex;
  flex-direction: column;
}

.pet-name {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1677ff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  color: #666;
  margin-right: 8px;
  min-width: 60px;
}

.value {
  color: #333;
  font-weight: 500;
}

.description, .type-feature {
  margin-bottom: 24px;
}

.description h3, .type-feature h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1677ff;
}

.description p, .type-feature p {
  color: #666;
  line-height: 1.6;
}

.pet-actions {
  margin-top: 24px;
  text-align: center;
}

.comments-section {
  margin-top: 48px;
}

.comments-section h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1677ff;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.comment-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 500;
  color: #333;
}

.comment-date {
  font-size: 12px;
  color: #999;
}

.comment-content {
  color: #333;
  line-height: 1.6;
}

.comment-input-section {
  margin-bottom: 32px;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.submit-comment-btn {
  margin-top: 16px;
  height: 40px;
  padding: 0 32px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .page-container {
    padding: 16px;
  }

  .pet-info-section {
    grid-template-columns: 1fr;
  }

  .main-image {
    height: 300px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>