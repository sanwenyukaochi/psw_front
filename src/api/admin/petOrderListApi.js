import httpRequest from "@/axios/axiosConfig.js";

export default {

    async getPetOrderList(params) {
        return await httpRequest.get('/api/v1/admin/petOrderList', { params });
    },

    async updateShipment(petOrderId) {
        return await httpRequest.put(`/api/v1/admin/petOrderShipment/${petOrderId}`);
    },

    async updateCancelShipment(petOrderId) {
        return await httpRequest.put(`/api/v1/admin/petOrderCancelShipment/${petOrderId}`);
    },

}