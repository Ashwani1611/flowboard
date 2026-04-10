import api from "./axios";

export const registerUser = (data) => api.post("/users/register/", data);
export const loginUser    = (data) => api.post("/users/login/", data);   // now sends email instead of username
export const getMe        = ()     => api.get("/users/me/");