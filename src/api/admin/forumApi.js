import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getForumList(params) {
        return await httpRequest.get('/admin-forum-list', { params });
    },

}