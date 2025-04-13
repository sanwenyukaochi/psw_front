<template>
  <div class="chat-container">
    <div class="chat-box">
      <div class="messages" ref="messageBox">
        <TransitionGroup name="message-fade">
          <div 
            v-for="msg in messages" 
            :key="msg.id" 
            class="message"
            :class="{ 
              'message-user': msg.type === 'user',
              'message-ai': msg.type === 'ai',
              'message-loading': msg.type === 'loading'
            }"
          >
            <template v-if="msg.type === 'loading'">
              <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </template>
            <template v-else>
              <span class="message-sender">{{ msg.type === 'user' ? '我' : '宠物顾问' }}:</span>
              <div class="message-content" v-html="msg.displayContent || ''"></div>
            </template>
          </div>
        </TransitionGroup>
      </div>
      <div class="input-area">
        <input 
          type="text" 
          v-model="message" 
          placeholder="请描述您宠物的情况..." 
          @keyup.enter="sendMessage"
          :disabled="isLoading"
        />
        <button @click="sendMessage" :disabled="isLoading">
          {{ isLoading ? '发送中...' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';

// 配置marked选项
marked.setOptions({
  breaks: true, // 支持GitHub风格的换行
  gfm: true,    // 启用GitHub风格的Markdown
  sanitize: false // 允许HTML标签
});

export default {
  data() {
    return {
      message: '',
      messages: [],
      isLoading: false,
      messageId: 0,
      controller: null
    };
  },
  methods: {
    formatMessage(content) {
      if (!content) return '';
      return marked(content);
    },
    async sendMessage() {
      if (this.message.trim() !== '' && !this.isLoading) {
        const userMessage = this.message;
        this.isLoading = true;
        
        // 添加用户消息
        this.addMessage('user', userMessage);
        this.message = '';
        
        // 添加等待动画消息
        const loadingId = this.addMessage('loading', '');
        
        try {
          // 创建 AbortController 用于可能的取消请求
          this.controller = new AbortController();
          const response = await fetch(
            `http://127.0.0.1:8088/api/v1/chat/chatClient?message=${encodeURIComponent(userMessage)}`,
            {
              signal: this.controller.signal
            }
          );

          // 添加AI消息占位并移除加载动画
          const aiMessageId = this.addMessage('ai', '');
          this.removeMessage(loadingId);

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulatedText = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // 解码新收到的数据
            const text = decoder.decode(value, { stream: true });
            accumulatedText += text;

            // 更新消息显示
            this.updateMessage(aiMessageId, accumulatedText);
            
            // 滚动到底部
            this.$nextTick(() => {
              this.scrollToBottom();
            });
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log('请求被取消');
          } else {
            console.error('发送消息失败:', error);
            this.updateMessage(loadingId, '抱歉，系统出现了一些问题，请稍后再试。');
          }
        } finally {
          this.isLoading = false;
          this.controller = null;
        }
      }
    },
    addMessage(type, content) {
      const id = ++this.messageId;
      this.messages.push({
        id,
        type,
        content,
        displayContent: this.formatMessage(content)
      });
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      return id;
    },
    updateMessage(id, content) {
      const message = this.messages.find(m => m.id === id);
      if (message) {
        message.content = content;
        message.displayContent = this.formatMessage(content);
      }
    },
    removeMessage(id) {
      const index = this.messages.findIndex(msg => msg.id === id);
      if (index !== -1) {
        this.messages.splice(index, 1);
      }
    },
    scrollToBottom() {
      const messageBox = this.$refs.messageBox;
      messageBox.scrollTop = messageBox.scrollHeight;
    }
  },
  beforeUnmount() {
    // 组件销毁前取消未完成的请求
    if (this.controller) {
      this.controller.abort();
    }
  },
  created() {
    const welcomeMessage = `您好！我是您的专业宠物健康顾问，拥有丰富的兽医临床经验和动物行为学知识。

我可以为您提供：

• 专业的宠物健康评估和建议
• 科学的饮食营养指导方案
• 行为心理分析与训练建议
• 疾病预防和保健咨询
• 日常护理专业指导

作为您的宠物健康伙伴，我将始终秉持专业、严谨的态度，为您的爱宠提供全方位的健康咨询服务。请注意，对于需要紧急救治或重症情况，建议您立即前往专业兽医医院就医。

很高兴能为您服务，请问您想了解些什么？`;
    
    this.addMessage('ai', welcomeMessage);
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
  background-color: #f5f5f5;
}

.chat-box {
  width: 100%;
  max-width: 800px;
  height: 600px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.message {
  padding: 6px 10px;
  border-radius: 8px;
  max-width: 80%;
  animation: message-pop 0.3s ease-out;
}

.message-user {
  background-color: #007bff;
  color: white;
  align-self: flex-end;
}

.message-ai {
  background-color: #f8f9fa;
  align-self: flex-start;
}

.message-loading {
  background-color: #f8f9fa;
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 8px;
  margin: 4px 0;
}

.message-sender {
  font-weight: bold;
  margin-right: 4px;
}

.loading-dots {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 20px;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  background-color: #007bff;
  border-radius: 50%;
  display: inline-block;
  animation: dot-bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }
.loading-dots span:nth-child(3) { animation-delay: 0s; }

.input-area {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

input[type="text"] {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

input[type="text"]:focus {
  border-color: #007bff;
}

input[type="text"]:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 消息动画 */
.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.3s ease;
}

.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes message-pop {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dot-bounce {
  0%, 80%, 100% { 
    transform: scale(0);
  }
  40% { 
    transform: scale(1);
  }
}

.message-content {
  display: inline-block;
  word-break: break-word;
}

.list-item {
  margin: 0;
  position: relative;
}

strong {
  color: #2c3e50;
  font-weight: 600;
}

.message-ai .message-content {
  line-height: 1.6;
}

/* 添加Markdown样式 */
.message-content :deep(p) {
  margin: 0;
  line-height: 1.3;
}

.message-content :deep(ul),
.message-content :deep(ol) {
  margin: 0;
  padding-left: 1em;
}

.message-content :deep(li) {
  margin: 0;
  line-height: 1.3;
}

.message-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.message-content :deep(pre) {
  margin: 0;
  padding: 0.5em;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.message-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.message-content :deep(blockquote) {
  margin: 0;
  padding: 0 0 0 0.5em;
  border-left: 2px solid #ddd;
}

.message-content :deep(h1),
.message-content :deep(h2),
.message-content :deep(h3),
.message-content :deep(h4),
.message-content :deep(h5),
.message-content :deep(h6) {
  margin: 0;
  line-height: 1.3;
}

.message-content :deep(a) {
  color: #0366d6;
  text-decoration: none;
}

.message-content :deep(a:hover) {
  text-decoration: underline;
}

.message-content :deep(table) {
  margin: 0;
}

.message-content :deep(td),
.message-content :deep(th) {
  padding: 0.2em 0.3em;
}

/* 用户消息中的Markdown样式调整 */
.message-user .message-content :deep(code),
.message-user .message-content :deep(pre) {
  background-color: rgba(255, 255, 255, 0.1);
}

.message-user .message-content :deep(blockquote) {
  border-left-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
}

.message-user .message-content :deep(a) {
  color: #fff;
  text-decoration: underline;
}
</style>

