import { apiFetch } from "../providers/api-client.js";

export const aiProvider = {
  vision({ imageDataUrl, prompt }) {
    return apiFetch("/api/ai/vision", {
      method: "POST",
      body: { imageDataUrl, prompt },
    });
  },

  writing(payload) {
    return apiFetch("/api/ai/writing", {
      method: "POST",
      body: payload,
    });
  },

  conversation(payload) {
    return apiFetch("/api/ai/conversation", {
      method: "POST",
      body: payload,
    });
  },

  recall(payload) {
    return apiFetch("/api/ai/recall", {
      method: "POST",
      body: payload,
    });
  },
};
