import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getPetList(params) {
        return await httpRequest.get('/api/v1/admin/petList', { params });
    },

    async createPet(params) {
        return await httpRequest.post('/api/v1/admin/pet', params)
    },

    async updatePet(petId, params) {
        return await httpRequest.put(`/api/v1/admin/pet/${petId}`, params);
    },

    async deletePet(petId) {
        return await httpRequest.delete(`/api/v1/admin/pet/${petId}`)
    },

    async uploadImage(petId, file) {
        const formData = new FormData();
        formData.append('file', file);
        return await httpRequest.post(`/api/v1/admin/pet/${petId}/uploadImage`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

}