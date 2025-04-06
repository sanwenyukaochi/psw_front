import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getForumList(params) {
        return await httpRequest.get('/api/v1/admin/forumList', { params });
    },

    async createForum(params) {
        return await httpRequest.post('/api/v1/admin/forum', params)
    },

    async updateForum(forumId, params) {
        return await httpRequest.put(`/api/v1/admin/forum/${forumId}`, params);
    },

    async deleteForum(forumId) {
        return await httpRequest.delete(`/api/v1/admin/forum/${forumId}`)
    },

    async uploadImage(forumId, file) {
        const formData = new FormData();
        formData.append('file', file);
        return await httpRequest.post(`/api/v1/admin/forum/${forumId}/uploadImage`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

}