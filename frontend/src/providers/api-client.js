import { API_BASE } from "../config.js";

export async function apiFetch(
  path,
  { method = "GET", body, token, signal } = {},
) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    const wrapped = new Error("无法连接服务器，请检查网络或服务状态。");
    wrapped.cause = error;
    throw wrapped;
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const error = new Error(
      data?.error?.message || `请求失败（HTTP ${response.status}）`,
    );
    error.status = response.status;
    error.code = data?.error?.code;
    error.details = data?.error?.details;
    throw error;
  }

  return data;
}
