import { envVars } from "@/lib/env";
import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

const axiosInstance = axios.create({
  baseURL: envVars.API_URL,
  withCredentials: true,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processRefreshQueue(error: unknown) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(null);
  });
  refreshQueue = [];
}

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry &&
        !originalRequest.url?.includes("/v1/auth/refresh-token")) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then(() => axiosInstance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post("/v1/auth/refresh-token", {});
        processRefreshQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processRefreshQueue(refreshError);
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const data = error.response?.data as {
      message?: string;
      error?: string;
    } | null;
    const message = data?.message ?? data?.error ?? error.message ?? "An error occurred";
    return Promise.reject(new Error(message));
  },
);

export { axiosInstance as api };
export default axiosInstance;
