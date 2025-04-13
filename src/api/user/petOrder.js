import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getPetOrderList() {
        return await httpRequest.get('/api/v1/user/petOrderList');
    },

    async createPetOrder(petId) {
        return await httpRequest.post(`/api/v1/user/petOrder/${petId}`);
    },

    async deletePetOrder(petOrderId) {
        return await httpRequest.delete(`/api/v1/user/petOrder/${petOrderId}`);
    },

}