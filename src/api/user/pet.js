import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getPetList(params) {
        return await httpRequest.get('/api/v1/user/petList', { params });
    },

    async getPet(petId) {
        return await httpRequest.get(`/api/v1/user/pet/${petId}`)
    },

    async getAllType() {
        return await httpRequest.get('/api/v1/user/allTypeList');
    },

    async createComment(petId, params) {
        return await httpRequest.post(`/api/v1/user/pet/${petId}/comment`, params)
    },

}