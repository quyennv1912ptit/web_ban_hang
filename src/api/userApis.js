import axiosClient from "./axiosClient"

export const syncUser = (data) => axiosClient.post("/users/sync", data)

export const getUserInfo = () => axiosClient.get("/users/me")