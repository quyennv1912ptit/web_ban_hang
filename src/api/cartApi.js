import axiosClient from "./axiosClient";

const cartApi = {
    getItems() {
        return axiosClient.get('/cart/');
    },
    addItem(data) {
        return axiosClient.post('/cart/', data);
    },
    updateItem(productId, quantity) {
        return axiosClient.put(`/cart/${productId}`, { quantity });
    },
    removeItem(productId) {
        return axiosClient.delete(`/cart/${productId}`);
    },
    clear() {
        return axiosClient.delete('/cart/');
    },
};

export default cartApi;
