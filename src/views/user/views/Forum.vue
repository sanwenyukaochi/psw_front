<script setup>
import { reactive, onMounted, ref, computed } from 'vue';
import { message, Modal, Upload, Form } from 'ant-design-vue';
import { CalendarOutlined, UserOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import forumApi from "@/api/user/forum.js";

// 状态管理
const router = useRouter();
const loading = ref(false);
const submitting = ref(false);
const posts = ref([]);
const total = ref(0);
const pageNum = ref(0);
const pageSize = ref(6);
const currentPost = ref(null); // 当前选中的帖子
const createModalVisible = ref(false);

const filter = reactive({
  title: '',
});

const newPost = reactive({
  forumTitle: '',
  forumContent: '',
  file: null
});

const formRef = ref();
const fileList = ref([]);

// 当前页码的计算属性
const currentPage = computed({
  get: () => pageNum.value + 1,
  set: (val) => {
    pageNum.value = val - 1;
  }
});

// 获取帖子列表
const fetchPosts = async (currentPage = 0, size = 6) => {
  try {
    loading.value = true;
    const params = {
      pageNum: Number(currentPage),
      pageSize: Number(size),
      ...filter
    };
    const { data } = await forumApi.getForumList(params);
    
    posts.value = data.records;
    total.value = data.total;
    pageNum.value = data.pageNum;
    pageSize.value = data.pageSize;
    
    // 默认选中第一个帖子
    if (posts.value.length > 0 && !currentPost.value) {
      currentPost.value = posts.value[0];
    }
  } catch (error) {
    message.error('获取帖子列表失败');
    console.error('获取帖子列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理分页变化
const handlePageChange = (page) => {
  fetchPosts(page - 1);
};

// 搜索
const handleSearch = () => {
  fetchPosts(0);
};

// 重置搜索
const handleReset = () => {
  filter.title = '';
  fetchPosts(0);
};

// 查看帖子详情
const viewPostDetail = (post) => {
  currentPost.value = post;
};

// 打开发帖对话框
const showCreateModal = () => {
  createModalVisible.value = true;
};

// 关闭发帖对话框
const handleCancel = () => {
  createModalVisible.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  newPost.forumTitle = '';
  newPost.forumContent = '';
  newPost.file = null;
  fileList.value = [];
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 提交发帖
const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    
    submitting.value = true;
    
    // 1. 创建帖子
    const params = {
      forumTitle: newPost.forumTitle,
      forumContent: newPost.forumContent
    };
    
    const { data } = await forumApi.createForum(params);
    const forumId = data.forumId;
    
    // 2. 如果有文件，上传图片
    if (fileList.value.length > 0 && fileList.value[0].originFileObj) {
      await forumApi.uploadImage(forumId, fileList.value[0].originFileObj);
    }
    
    message.success('发布成功');
    createModalVisible.value = false;
    resetForm();
    
    // 重新加载帖子列表
    await fetchPosts(0);
    
  } catch (error) {
    console.error('发布失败:', error);
    message.error('发布失败');
  } finally {
    submitting.value = false;
  }
};

// 上传前校验
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('只能上传图片文件!');
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('图片必须小于5MB!');
  }
  return false;
};

// 文件列表变化
const handleFileChange = ({ fileList: newFileList }) => {
  fileList.value = newFileList;
};

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 初始化
onMounted(() => {
  fetchPosts();
});
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="forum-header">
        <h1 class="forum-title">宠物论坛</h1>
        <a-button type="primary" @click="showCreateModal">
          <plus-outlined />
          发布论坛
        </a-button>
      </div>
      
      <div class="search-section">
        <a-input-search
          v-model:value="filter.title"
          placeholder="论坛标题"
          style="width: 200px"
          @search="handleSearch"
        />
        <a-button @click="handleReset" style="margin-left: 8px">重置</a-button>
      </div>

      <div class="forum-container">
        <!-- 左侧论坛列表 -->
        <div class="forums-sidebar">
          <h2 class="sidebar-title">所有论坛</h2>
          <div class="forum-list">
            <div 
              v-for="post in posts" 
              :key="post.forumId" 
              class="forum-list-item"
              :class="{ active: currentPost && currentPost.forumId === post.forumId }"
              @click="viewPostDetail(post)"
            >
              <img :src="post.forumImage" alt="" class="forum-list-img" />
              <div class="forum-list-info">
                <h3 class="forum-list-title">{{ post.forumTitle }}</h3>
                <div class="forum-list-meta">
                  <span class="forum-date">
                    <calendar-outlined />
                    {{ formatDate(post.createdAt) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页 -->
          <div class="pagination">
            <a-pagination
              size="small"
              :current="pageNum + 1"
              :total="total"
              :pageSize="pageSize"
              simple
              @change="handlePageChange"
            />
          </div>
        </div>

        <!-- 右侧帖子内容 -->
        <div class="forum-content">
          <a-spin :spinning="loading">
            <div v-if="currentPost" class="post-detail">
              <img :src="currentPost.forumImage" alt="" class="post-image" />
              
              <div class="post-header">
                <h2 class="post-title">{{ currentPost.forumTitle }}</h2>
                <div class="post-meta">
                  <span class="post-author">
                    <user-outlined />
                    {{ currentPost.createBy.username }}
                  </span>
                  <span class="post-date">
                    <calendar-outlined />
                    {{ formatDate(currentPost.createdAt) }}
                  </span>
                </div>
              </div>
              
              <div class="post-body">
                <p>{{ currentPost.forumContent }}</p>
              </div>
            </div>
            
            <div v-else class="post-empty">
              <p>选择一个帖子查看详情</p>
            </div>
          </a-spin>
        </div>
      </div>
    </div>
  </div>

  <!-- 发布论坛对话框 -->
  <a-modal
    v-model:visible="createModalVisible"
    title="发布论坛"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :confirmLoading="submitting"
    okText="发布"
    cancelText="取消"
    width="600px"
  >
    <a-form
      ref="formRef"
      :model="newPost"
      :rules="{
        forumTitle: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        forumContent: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      }"
      layout="vertical"
    >
      <a-form-item name="forumTitle" label="标题">
        <a-input v-model:value="newPost.forumTitle" placeholder="请输入论坛标题" />
      </a-form-item>
      
      <a-form-item name="forumContent" label="内容">
        <a-textarea 
          v-model:value="newPost.forumContent" 
          placeholder="请输入论坛内容" 
          :rows="6" 
          :maxlength="1000"
          show-count
        />
      </a-form-item>
      
      <a-form-item label="配图" name="file">
        <a-upload
          v-model:fileList="fileList"
          :before-upload="beforeUpload"
          @change="handleFileChange"
          list-type="picture"
          :maxCount="1"
        >
          <a-button>
            <upload-outlined />
            选择图片
          </a-button>
          <template #itemRender="{ file }">
            <div class="upload-item">
              <img v-if="file.url || file.thumbUrl" :src="file.url || file.thumbUrl" alt="图片预览" class="upload-preview" />
              <div class="upload-info">
                <span class="upload-name">{{ file.name }}</span>
                <a-button type="text" @click="fileList = []">删除</a-button>
              </div>
            </div>
          </template>
        </a-upload>
        <div class="upload-tip">支持jpg、png格式，大小不超过5MB</div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f0f2f5;
  padding: 24px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.forum-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.forum-title {
  font-size: 24px;
  font-weight: 600;
  color: #1677ff;
  margin: 0;
}

.search-section {
  display: flex;
  margin-bottom: 24px;
}

.forum-container {
  display: flex;
  gap: 24px;
}

.forums-sidebar {
  width: 300px;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: #1677ff;
  margin: 0 0 16px;
}

.forum-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.forum-list-item {
  display: flex;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.forum-list-item:hover, .forum-list-item.active {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.forum-list-item.active {
  border-left: 3px solid #1677ff;
}

.forum-list-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
}

.forum-list-info {
  padding: 8px;
  flex: 1;
}

.forum-list-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.forum-list-meta {
  font-size: 12px;
  color: #999;
}

.forum-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.post-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 24px;
}

.post-header {
  margin-bottom: 24px;
}

.post-title {
  font-size: 24px;
  font-weight: 600;
  color: #1677ff;
  margin: 0 0 16px;
}

.post-meta {
  display: flex;
  gap: 16px;
  color: #666;
  font-size: 14px;
}

.post-author, .post-date, .forum-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-body {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
}

.pagination {
  margin-top: 24px;
  text-align: center;
}

.post-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #999;
}

.upload-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-preview {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.upload-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-name {
  font-size: 12px;
  color: #666;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .page-container {
    padding: 12px;
  }

  .content-wrapper {
    padding: 0;
  }

  .forum-container {
    flex-direction: column;
  }

  .forums-sidebar {
    width: 100%;
    margin-bottom: 16px;
  }

  .forum-content {
    padding: 16px;
  }

  .post-title {
    font-size: 20px;
  }

  .post-body {
    font-size: 14px;
  }
}
</style>