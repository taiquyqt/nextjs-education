// src/api/api-client.ts
import axios, { AxiosRequestConfig } from "axios";


export const apiClient = axios.create({
    baseURL: "http://localhost:8080/api",
    withCredentials: true,
    timeout: 15000,
});

// Gắn token tự động
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (res) => res.data,
    (err) => Promise.reject(err)
);

export async function apiCall<T>(
    path: string,
    config: AxiosRequestConfig = {}
): Promise<T> {
    return apiClient.request<T>({ url: path, ...config });
}
