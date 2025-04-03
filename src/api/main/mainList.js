import httpRequest from "@/axios/axiosConfig.js";

export default {

    async mainPetList(params) {
        return await httpRequest.get('/main/list', { params });
    },

}