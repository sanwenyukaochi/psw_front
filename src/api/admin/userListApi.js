import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getUserList(params) {
        return await httpRequest.get('/api/v1/admin/userList', { params });
    },

    async createUser(params) {
        return await httpRequest.post('/api/v1/admin/user', params)
    },

    async updateUser(userId, params) {
        return await httpRequest.put(`/api/v1/admin/user/${userId}`, params);
    },

    async deleteUser(userId) {
        return await httpRequest.delete(`/api/v1/admin/user/${userId}`)
    },

    async uploadAvatar(userId, file) {
        const formData = new FormData();
        formData.append('file', file);
        return await httpRequest.post(`/api/v1/admin/user/${userId}/uploadAvatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

}