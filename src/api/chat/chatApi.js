import axios from 'axios';

const chatApi = {
  // 获取AI回复
  getChat: async (message) => {
    try {
      const response = await axios.get('http://127.0.0.1:8088/api/v1/chat/chatClient', {
        params: { message },
        responseType: 'stream'
      });
      return response;
    } catch (error) {
      console.error('Chat API Error:', error);
      throw error;
    }
  }
};

export default chatApi; 