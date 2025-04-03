import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getNoticeList(params) {
        return await httpRequest.get('/admin-notice-list', { params });
    },

}