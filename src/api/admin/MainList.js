import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getMainList() {
        return await httpRequest.get('/api/v1/admin/mainList');
    },

}