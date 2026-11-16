import { apiFetch } from "../providers/api-client.js";

export const syncApi = {
  pair(payload, token) {
    return apiFetch("/api/sync/pair", {
      method: "POST",
      body: payload,
      token,
    });
  },

  push(changes, token) {
    return apiFetch("/api/sync/push", {
      method: "POST",
      body: { changes },
      token,
    });
  },

  pull(cursor, limit, token) {
    return apiFetch(`/api/sync/pull?cursor=${cursor}&limit=${limit}`, { token });
  },

  resolve(payload, token) {
    return apiFetch("/api/sync/resolve", {
      method: "POST",
      body: payload,
      token,
    });
  },

  disable(payload, token) {
    return apiFetch("/api/sync/disable", {
      method: "POST",
      body: payload,
      token,
    });
  },
};
