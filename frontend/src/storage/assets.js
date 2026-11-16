import { dbDelete, dbGetAll, dbPut, randomId } from "./indexeddb.js";

const MAX_PHOTO_BYTES = 25 * 1024 * 1024;
const MAX_VISION_DATA_URL_LENGTH = 12_000_000;

export function isSupportedImage(file) {
  return Boolean(file && file.type && file.type.startsWith("image/"));
}

async function makeThumbnail(blob, maxSize = 640) {
  try {
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const thumbnail = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82),
    );
    return thumbnail ?? blob;
  } catch {
    return blob;
  }
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("读取图片失败"));
    reader.readAsDataURL(blob);
  });
}

export async function savePhoto(memoryId, file) {
  if (!isSupportedImage(file)) {
    throw new Error("请选择图片文件。");
  }
  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error("照片超过 25MB，请先压缩后再添加。");
  }

  const thumbnail = await makeThumbnail(file);
  const now = Date.now();

  await dbPut("assets", {
    id: randomId(),
    memoryId,
    kind: "original",
    blob: file,
    mime: file.type,
    createdAt: now,
  });

  await dbPut("assets", {
    id: randomId(),
    memoryId,
    kind: "thumbnail",
    blob: thumbnail,
    mime: thumbnail.type || "image/jpeg",
    createdAt: now,
  });
}

export async function listAssets(memoryId) {
  const all = await dbGetAll("assets");
  return all.filter((asset) => asset.memoryId === memoryId);
}

export async function getThumbnail(memoryId) {
  const assets = await listAssets(memoryId);
  return (
    assets.find((asset) => asset.kind === "thumbnail")?.blob ??
    assets.find((asset) => asset.kind === "original")?.blob ??
    null
  );
}

export async function getOriginal(memoryId) {
  const assets = await listAssets(memoryId);
  return assets.find((asset) => asset.kind === "original")?.blob ?? null;
}

export async function deleteAssetsForMemory(memoryId) {
  const assets = await listAssets(memoryId);
  for (const asset of assets) {
    await dbDelete("assets", asset.id);
  }
}

export async function blobToVisionDataUrl(blob) {
  try {
    const bitmap = await createImageBitmap(blob);
    const maxSize = 1280;
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    if (dataUrl.length > MAX_VISION_DATA_URL_LENGTH) {
      throw new Error("照片太大，无法用于 AI 观察。");
    }
    return dataUrl;
  } catch (error) {
    if (error instanceof Error && error.message.includes("太大")) throw error;
    const dataUrl = await blobToDataUrl(blob);
    if (dataUrl.length > MAX_VISION_DATA_URL_LENGTH) {
      throw new Error("照片太大，无法用于 AI 观察。");
    }
    return dataUrl;
  }
}
