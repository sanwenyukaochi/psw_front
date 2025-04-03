import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getGoodList(params) {
        return await httpRequest.get('/admin-good-list', { params });
    },

}