import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getRsaPublicKey(){
        return await httpRequest.get('/api/v1/key/rsaPublicKey');
    },
    async getAdminToken(params) {
        return await httpRequest.post('/api/v1/auth/adminLogin', params);
    },

    async getUserToken(params) {
        return await httpRequest.post('/api/v1/auth/userLogin', params);
    },

}