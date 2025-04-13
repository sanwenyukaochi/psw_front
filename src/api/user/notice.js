import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getNoticeList(params) {
        return await httpRequest.get('/api/v1/user/noticeList', {params});
    },

}