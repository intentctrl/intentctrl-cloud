import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
  },
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    err.message = err?.response?.data?.message ?? err.message;
    return Promise.reject(err);
  },
);

export default axiosInstance;
