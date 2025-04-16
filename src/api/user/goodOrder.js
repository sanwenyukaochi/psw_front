import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getGoodOrderList(pageNum = 0, pageSize = 4) {
        return await httpRequest.get('/api/v1/user/goodOrderList', {
            params: {
                pageNum,
                pageSize
            }
        });
    },

    async createGoodOrder(goodId, params) {
        return await httpRequest.post(`/api/v1/user/goodOrder/${goodId}`, params);
    },

    async deleteGoodOrder(goodOrderId) {
        return await httpRequest.delete(`/api/v1/user/goodOrder/${goodOrderId}`);
    },

}