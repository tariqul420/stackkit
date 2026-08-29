import { ofetch, type FetchOptions } from "ofetch";

const API_URL = import.meta.env.VITE_API_URL;

type RequestOptions = Omit<FetchOptions<"json">, "method" | "body">;

const client = ofetch.create({
  baseURL: API_URL || "http://localhost:5000/api",
  credentials: "include",
  timeout: 30000,
});

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  url: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<{ data: T }> {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const data = await client<T>(url, {
    ...options,
    method,
    body: body as BodyInit,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
  });

  return { data };
}

export const api = {
  get: <T>(url: string, options?: RequestOptions) => request<T>("GET", url, undefined, options),
  post: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", url, body, options),
  patch: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", url, body, options),
  put: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", url, body, options),
  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>("DELETE", url, undefined, options),
};
