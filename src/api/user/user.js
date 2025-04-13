import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getUser() {
        return await httpRequest.get('/api/v1/user/user');
    },

    async updateUser(params) {
        return await httpRequest.put('/api/v1/user/user', params);
    },

    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await httpRequest.post(`/api/v1/user/user/uploadAvatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

}