import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getPetOrderList(pageNum = 0, pageSize = 4) {
        return await httpRequest.get('/api/v1/user/petOrderList', {
            params: {
                pageNum,
                pageSize
            }
        });
    },

    async createPetOrder(petId) {
        return await httpRequest.post(`/api/v1/user/petOrder/${petId}`);
    },

    async deletePetOrder(petOrderId) {
        return await httpRequest.delete(`/api/v1/user/petOrder/${petOrderId}`);
    },

}