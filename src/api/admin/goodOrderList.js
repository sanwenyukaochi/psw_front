import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getGoodOrderList(params) {
        return await httpRequest.get('/api/v1/admin/goodOrderList', { params });
    },

    async updateShipment(goodOrderId) {
        return await httpRequest.put(`/api/v1/admin/goodOrderShipment/${goodOrderId}`);
    },

    async updateCancelShipment(goodOrderId) {
        return await httpRequest.put(`/api/v1/admin/goodOrderCancelShipment/${goodOrderId}`);
    },

}