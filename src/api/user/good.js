import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getGoodList(params) {
        return await httpRequest.get('/api/v1/user/goodList', {params});
    },

}