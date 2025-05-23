import httpRequest from "@/axios/axiosConfig.js";

export default {

    async mainPetList() {
        return await httpRequest.get('/api/v1/user/mainList');
    },

}