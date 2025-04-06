import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getPetList(params) {
        return await httpRequest.get('/api/v1/user/petList', { params });
    },

    async getPet(petId) {
        return await httpRequest.delete(`/api/v1/user/pet/${petId}`)
    },

}