import httpRequest from '@/axios/axiosConfig';

const chatApi = {
  // 获取AI回复
  getChat: async (message) => {
    try {
      const response = await httpRequest.get('/v1/chat/chatClient', {
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