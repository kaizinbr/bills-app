import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authClient } from "@/lib/auth-client";

const api = axios.create({
    // Use o IP da máquina quando executar em um dispositivo físico.
    baseURL: "http://192.168.18.152:3000/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: false,
});

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const cookies = await authClient.getCookie();

        if (cookies) {
            config.headers.set("Cookie", cookies);
        }

        return config;
    },
    async (error: AxiosError) => {
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Opcional: limpar a sessão ou redirecionar para login.
            // await authClient.signOut();
        }

        return Promise.reject(error);
    },
);

export default api;
