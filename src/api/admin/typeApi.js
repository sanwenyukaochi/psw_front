import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getTypeList(params) {
        return await httpRequest.get('/api/v1/admin/typeList', { params });
    },

    async createType(params) {
        return await httpRequest.post('/api/v1/admin/type', params)
    },

    async updateType(typeId, params) {
        return await httpRequest.put(`/api/v1/admin/type/${typeId}`, params);
    },

    async deleteType(typeId) {
        return await httpRequest.delete(`/api/v1/admin/type/${typeId}`);
    },

    async getAllType() {
        return await httpRequest.get('/api/v1/admin/allTypeList');
    },

}