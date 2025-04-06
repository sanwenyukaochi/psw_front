import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getGoodList(params) {
        return await httpRequest.get('/api/v1/admin/goodList', { params });
    },

    async createGood(params) {
        return await httpRequest.post('/api/v1/admin/good', params)
    },

    async updateGood(goodId, params) {
        return await httpRequest.put(`/api/v1/admin/good/${goodId}`, params);
    },

    async deleteGood(goodId) {
        return await httpRequest.delete(`/api/v1/admin/good/${goodId}`)
    },

    async uploadImage(goodId, file) {
        const formData = new FormData();
        formData.append('file', file);
        return await httpRequest.post(`/api/v1/admin/good/${goodId}/uploadImage`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

}