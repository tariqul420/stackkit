import axios from "axios";
import { envVars } from "../env";

const api = axios.create({
  baseURL: envVars.API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default api;
