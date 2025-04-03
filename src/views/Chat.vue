<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import chatApi from '@/api/chat/chatApi.js';

// 聊天消息列表
const messages = ref([
  {
    id: 1,
    content: '你好！我是AI助手，有什么可以帮你的吗？',
    type: 'received',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=1'
  }
]);

// 输入框内容
const inputMessage = ref('');
const messageListRef = ref(null);
const loading = ref(false);

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
  }
};

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) {
    message.warning('请输入消息内容');
    return;
  }

  if (loading.value) {
    message.warning('请等待AI回复后再发送新消息');
    return;
  }

  // 添加用户消息
  const userMessage = {
    id: messages.value.length + 1,
    content: inputMessage.value,
    type: 'sent',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2'
  };
  messages.value.push(userMessage);
  const userInput = inputMessage.value;
  inputMessage.value = '';
  await scrollToBottom();

  // 创建AI回复消息
  const aiMessage = {
    id: messages.value.length + 1,
    content: '',
    type: 'received',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=1'
  };
  messages.value.push(aiMessage);

  try {
    loading.value = true;
    const response = await chatApi.getChat(userInput);
    
    // 处理流式响应
    const reader = response.data.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      aiMessage.content += chunk;
      await scrollToBottom();
    }
  } catch (error) {
    message.error('获取AI回复失败，请重试');
    console.error('AI回复错误:', error);
    aiMessage.content = '抱歉，获取回复失败，请重试。';
  } finally {
    loading.value = false;
  }
};

// 按回车发送消息
const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

onMounted(() => {
  scrollToBottom();
});
</script>

<template>
  <div class="chat-container">
    <!-- 聊天消息列表 -->
    <div class="message-list" ref="messageListRef">
      <div v-for="msg in messages" :key="msg.id" class="message-item" :class="msg.type">
        <div class="message-content">
          <img :src="msg.avatar" class="avatar" :alt="msg.type === 'sent' ? '我' : 'AI'" />
          <div class="bubble">
            <div class="text">{{ msg.content }}</div>
            <div class="time">{{ msg.time }}</div>
          </div>
        </div>
      </div>
      <div v-if="loading" class="message-item received">
        <div class="message-content">
          <img src="https://api.dicebear.com/7.x/bottts/svg?seed=1" class="avatar" alt="AI" />
          <div class="bubble typing">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <a-textarea
        v-model:value="inputMessage"
        placeholder="请输入消息..."
        :auto-size="{ minRows: 1, maxRows: 4 }"
        @keypress="handleKeyPress"
        :disabled="loading"
      />
      <a-button 
        type="primary" 
        @click="sendMessage" 
        :loading="loading"
      >发送</a-button>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scroll-behavior: smooth;
}

.message-item {
  margin-bottom: 20px;
}

.message-content {
  display: flex;
  align-items: flex-start;
  max-width: 70%;
}

.message-item.sent .message-content {
  margin-left: auto;
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  margin: 0 8px;
}

.bubble {
  background: #fff;
  padding: 10px 15px;
  border-radius: 4px;
  position: relative;
  min-width: 40px;
}

.message-item.sent .bubble {
  background: #95ec69;
}

.text {
  word-break: break-word;
  white-space: pre-wrap;
}

.time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}

.input-area {
  padding: 20px;
  background: #fff;
  border-top: 1px solid #e8e8e8;
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.input-area :deep(.ant-input) {
  border-radius: 4px;
  resize: none;
}

.input-area :deep(.ant-btn) {
  height: 32px;
  padding: 0 20px;
}

/* 打字动画 */
.typing {
  padding: 12px 15px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #90949c;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: 200ms; }
.typing-indicator span:nth-child(2) { animation-delay: 300ms; }
.typing-indicator span:nth-child(3) { animation-delay: 400ms; }

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }

  .input-area {
    padding: 10px;
  }

  .avatar {
    width: 32px;
    height: 32px;
  }

  .bubble {
    padding: 8px 12px;
  }
}
</style>