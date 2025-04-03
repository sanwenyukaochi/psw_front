import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getPetList(params) {
        return await httpRequest.get('/admin-pet-list', { params });
    },

    async updatePet(id, params) {
        return await httpRequest.put(`/admin-pet/${id}`, params);
    }

}