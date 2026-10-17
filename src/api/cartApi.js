import axiosClient from "./axiosClient";

const cartApi = {
    // Gọi API POST /api/cart/ của backend
    addItem(data) {
        return axiosClient.post('/cart/', data);
    }
};

export default cartApi;
