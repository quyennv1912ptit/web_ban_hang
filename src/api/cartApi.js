import axiosClient from "./axiosClient";

const cartApi = {
    // Gọi API POST /api/cart/items của FastAPI
    addItem(data) {
        return axiosClient.post('/cart/items', data);
    }
};

export default cartApi;