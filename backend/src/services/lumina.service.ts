import { config } from "../config.js";
import { sentenceSources, selectGroundedText, type Sentence } from "./grounded-writing.js";
import {
  LUMINA_OBSERVE_PROMPT,
  LUMINA_PHOTO_QUESTION_PROMPT,
  LUMINA_TEXT_INTEGRATE_PROMPT,
  LUMINA_TEXT_REPLY_PROMPT,
  LUMINA_WRITE_PROMPT,
} from "../prompts/lumina.prompts.js";
import { deepSeek } from "../providers/deepseek.provider.js";
import {
  luminaFactsResultSchema,
  luminaQuestionResultSchema,
  luminaReplyResultSchema,
  luminaTextResultSchema,
  type LuminaObserveRequest,
  type LuminaPhotoQuestionRequest,
  type LuminaTextIntegrateRequest,
  type LuminaTextReplyRequest,
  type LuminaWriteRequest,
} from "../schemas/lumina.schema.js";

export async function observeLuminaPhoto(input: LuminaObserveRequest) {
  const userPrompt = [
    `拍摄时间：${input.iso}`,
    "请观察照片，输出画面事实 JSON。",
    "subjects 只列明确可见的主体；absence 只列值得注意的缺席；palette 给出最多 5 个主色。",
  ].join("\n");

  return deepSeek.visionJson(
    LUMINA_OBSERVE_PROMPT,
    userPrompt,
    input.image,
    luminaFactsResultSchema,
    { maxTokens: 900, model: config.DEEPSEEK_VISION_MODEL },
  );
}

export async function writeLuminaText(input: LuminaWriteRequest) {
  const user=sentenceSources([input.note ?? "",input.extra ?? ""]);
  const observations=[input.facts.scene ? `照片分析（尚待用户核对）：${input.facts.scene}。` : "",input.facts.light ? `光线分析：${input.facts.light}。` : "",input.facts.subjects?.length ? `画面主体分析：${input.facts.subjects.join("、")}。` : ""];
  const extra=sentenceSources(observations,"observation");
  const mood=input.mood?.label ? [{id:"",text:`心情标注：${input.mood.label}。`,kind:"mood" as const}] : [];
  const sources: Sentence[]=[...user,...extra,...mood].map((item,i)=>({...item,id:`s${i}`}));
  return selectGroundedText(sources,input.variant);
}

export async function replyLuminaText(input: LuminaTextReplyRequest) {
  const last=[...input.turns].reverse().find(t=>t.role==="me")?.text ?? "";
  const selected=await selectGroundedText(sentenceSources([last]));
  return {reply:`你写下的是：${selected.text}`,question:input.turns.some(t=>t.role==="it") ? "" : "这一刻，你还想补充哪一点？"};
}

export async function integrateLuminaText(input: LuminaTextIntegrateRequest) {
  return selectGroundedText(sentenceSources(input.turns.filter(t=>t.role==="me").map(t=>t.text)));
}

export async function questionLuminaPhoto(
  input: LuminaPhotoQuestionRequest,
) {
  return deepSeek.json(
    [
      { role: "system", content: LUMINA_PHOTO_QUESTION_PROMPT },
      {
        role: "user",
        content: JSON.stringify({
          facts: input.facts,
          mood: input.mood ?? null,
          note: input.note,
        }),
      },
    ],
    luminaQuestionResultSchema,
    { maxTokens: 200 },
  );
}
