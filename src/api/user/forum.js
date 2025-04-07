import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getForumList(params) {
        return await httpRequest.get('/api/v1/user/forumList', {params});
    },

    async createForum(params) {
        return await httpRequest.post('/api/v1/user/forum', params)
    },

    async uploadImage(forumId, file) {
        const formData = new FormData();
        formData.append('file', file);
        return await httpRequest.post(`/api/v1/user/forum/${forumId}/uploadImage`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

}