import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getNoticeList(params) {
        return await httpRequest.get('/api/v1/admin/noticeList', { params });
    },

    async createNotice(params) {
        return await httpRequest.post('/api/v1/admin/notice', params)
    },

    async updateNotice(noticeId, params) {
        return await httpRequest.put(`/api/v1/admin/notice/${noticeId}`, params);
    },

    async deleteNotice(noticeId) {
        return await httpRequest.delete(`/api/v1/admin/notice/${noticeId}`)
    },

}