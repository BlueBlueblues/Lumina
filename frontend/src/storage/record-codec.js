const META_PREFIX = "LUMINA_META:";
const ANCHORS = [
  { key: "喜", phi: 45, hex: "#f2cf96" },
  { key: "怒", phi: 135, hex: "#e7b0ad" },
  { key: "哀", phi: 225, hex: "#b6c6d5" },
  { key: "乐", phi: 315, hex: "#b3d6c1" },
];

function dayKey(timestamp) {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function mainText(record) {
  const chat = (record.chat ?? [])
    .filter((turn) => turn && turn.role === "me")
    .map((turn) => String(turn.text ?? "").trim())
    .filter(Boolean)
    .join("\n");

  return String(
    record.final ||
      record.draft ||
      record.note ||
      chat ||
      record.reply ||
      "",
  ).trim();
}

function deriveTitle(record) {
  const text = mainText(record);
  if (text) return text.replace(/\s+/g, " ").slice(0, 24);
  const facts = record.facts ?? {};
  if (facts.scene) return String(facts.scene).slice(0, 24);
  return record.kind === "text" ? "文字记录" : "照片记录";
}

function factsToLines(facts) {
  if (!facts || typeof facts !== "object") return [];
  const lines = [];
  if (facts.scene) lines.push(`场景：${facts.scene}`);
  if (facts.time) lines.push(`时间：${facts.time}`);
  if (facts.light) lines.push(`光线：${facts.light}`);
  for (const subject of facts.subjects ?? []) lines.push(`主体：${subject}`);
  for (const missing of facts.absence ?? []) lines.push(`没有：${missing}`);
  for (const span of facts.text_spans ?? []) lines.push(`文字：${span}`);
  return lines.slice(0, 12);
}

function buildMetaText(record) {
  const facts = record.facts ?? null;
  const compactFacts = facts
    ? {
        scene: facts.scene ?? null,
        time: facts.time ?? null,
        light: facts.light ?? null,
        subjects: (facts.subjects ?? []).slice(0, 8).map((item) => String(item).slice(0, 60)),
        absence: (facts.absence ?? []).slice(0, 8).map((item) => String(item).slice(0, 60)),
        text_spans: (facts.text_spans ?? []).slice(0, 8).map((item) => String(item).slice(0, 60)),
        palette: (facts.palette ?? []).slice(0, 5),
        brightness: facts.brightness ?? null,
        saturation: facts.saturation ?? null,
        conf: facts.conf ?? null,
      }
    : null;

  let meta = {
    facts: compactFacts,
    palette: (record.palette ?? []).slice(0, 5),
    mood: record.mood ?? null,
  };
  let text = JSON.stringify(meta);

  if (text.length > 1_900) {
    meta = {
      facts: compactFacts
        ? {
            scene: compactFacts.scene,
            time: compactFacts.time,
            light: compactFacts.light,
          }
        : null,
      palette: meta.palette,
      mood: meta.mood,
    };
    text = JSON.stringify(meta);
  }

  return text;
}

function parseMeta(memory) {
  const facts = Array.isArray(memory.aiFacts) ? memory.aiFacts : [];
  const metaItem = facts.find(
    (item) => typeof item === "string" && item.startsWith(META_PREFIX),
  );
  if (!metaItem) return null;
  try {
    return JSON.parse(metaItem.slice(META_PREFIX.length));
  } catch {
    return null;
  }
}

function moodFromLabel(label) {
  const text = String(label ?? "").trim();
  if (!text) return null;
  const anchor = ANCHORS.find((item) => text.includes(item.key)) ?? ANCHORS[0];
  const r = 0.5;
  const rad = (anchor.phi * Math.PI) / 180;
  return {
    phi: anchor.phi,
    r,
    valence: Number((r * Math.cos(rad)).toFixed(3)),
    arousal: Number((r * Math.sin(rad)).toFixed(3)),
    anchor: anchor.key,
    label: text,
    color: anchor.hex,
  };
}

export function recordToMemory(record, existing, deviceId) {
  const createdAt = Date.parse(record.ts) || Date.now();
  const content = mainText(record);
  const aiFacts = [
    ...factsToLines(record.facts),
    META_PREFIX + buildMetaText(record),
  ];
  const moodLabel = record.mood?.label || record.mood?.anchor;

  return {
    id: record.id,
    title: deriveTitle(record),
    content: content || record.facts?.scene || (record.kind === "text" ? "文字记录" : "照片记录"),
    recordDate: dayKey(createdAt),
    mood: moodLabel || null,
    tags: [],
    aiFacts,
    supplement: record.note || record.extra || null,
    original: { version: 1, note: String(record.note ?? ""), extra: String(record.extra ?? ""), chat: Array.isArray(record.chat) ? record.chat.map((t) => ({ role: t.role === "me" ? "me" : "it", text: String(t.text ?? ""), ...(t.question ? { question: String(t.question) } : {}) })) : [] },
    hasPhoto: Boolean(record.thumb) || record.kind === "photo",
    createdAt,
    updatedAt: createdAt,
    revision: existing?.revision ?? 0,
    deviceId: existing?.deviceId ?? deviceId,
    deletedAt: null,
  };
}

export function memoryToRecord(memory, local) {
  const meta = parseMeta(memory);
  const facts = meta?.facts ?? local?.facts ?? null;
  const palette = meta?.palette ?? local?.palette ?? [];
  const mood = meta?.mood ?? local?.mood ?? moodFromLabel(memory.mood);
  const kind = memory.hasPhoto ? "photo" : local?.kind ?? "text";

  return {
    id: memory.id,
    ts: new Date(memory.createdAt).toISOString(),
    kind,
    thumb: local?.thumb ?? null,
    palette,
    mood,
    facts,
    note: memory.original?.note ?? local?.note ?? memory.supplement ?? "",
    reply: local?.reply ?? "",
    question: local?.question ?? "",
    extra: memory.original?.extra ?? local?.extra ?? "",
    draft: local?.draft ?? "",
    final: memory.content ?? local?.final ?? "",
    chat: memory.original?.chat ?? local?.chat ?? [],
    trace: local?.trace ?? null,
    demo: local?.demo ?? false,
  };
}

export function normalizeOriginal(value) {
  if (!value) return null;
  return { version: 1, note: value.note ?? "", extra: value.extra ?? "", chat: (value.chat ?? []).map(t=>({ role:t.role, text:t.text, ...(t.question ? {question:t.question} : {}) })) };
}

export function syncFieldsChanged(existing, next) {
  return (
    existing.title !== next.title ||
    existing.content !== next.content ||
    existing.recordDate !== next.recordDate ||
    (existing.mood ?? null) !== (next.mood ?? null) ||
    JSON.stringify(existing.tags) !== JSON.stringify(next.tags) ||
    JSON.stringify(existing.aiFacts) !== JSON.stringify(next.aiFacts) ||
    (existing.supplement ?? null) !== (next.supplement ?? null) ||
    JSON.stringify(normalizeOriginal(existing.original)) !== JSON.stringify(normalizeOriginal(next.original)) ||
    existing.hasPhoto !== next.hasPhoto ||
    existing.deletedAt !== next.deletedAt
  );
}

