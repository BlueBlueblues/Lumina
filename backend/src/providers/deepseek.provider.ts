import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import { z, type ZodTypeAny } from "zod";
import { config } from "../config.js";
import { AppError, ServiceUnavailableError } from "../lib/errors.js";

export interface TextMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class DeepSeekProvider {
  private readonly client: OpenAI | null;

  constructor() {
    this.client = config.DEEPSEEK_API_KEY
      ? new OpenAI({
          apiKey: config.DEEPSEEK_API_KEY,
          baseURL: config.DEEPSEEK_BASE_URL,
          timeout: 45_000,
          maxRetries: 1,
        })
      : null;
  }

  get configured(): boolean {
    return this.client !== null;
  }

  private requireClient(): OpenAI {
    if (!this.client) {
      throw new ServiceUnavailableError(
        "ai_unavailable",
        "AI provider is not configured on this server.",
      );
    }
    return this.client;
  }

  private async complete(
    messages: ChatCompletionMessageParam[],
    options: CompletionOptions & { json?: boolean },
  ): Promise<string> {
    const client = this.requireClient();
    try {
      const response = await client.chat.completions.create({
        model: options.model ?? config.DEEPSEEK_CHAT_MODEL,
        messages,
        temperature: options.temperature ?? config.AI_TEMPERATURE,
        ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
        ...(options.json ? { response_format: { type: "json_object" as const } } : {}),
      });
      const content = response.choices[0]?.message?.content;
      if (!content?.trim()) {
        throw new Error("AI provider returned an empty response.");
      }
      return content;
    } catch (error) {
      if (error instanceof AppError) throw error;

      const status = (error as { status?: number }).status;
      console.error(
        `[deepseek] request failed${status ? ` (HTTP ${status})` : ""}:`,
        error instanceof Error ? error.message : error,
      );
      throw new AppError(
        502,
        "ai_provider_error",
        status === 429
          ? "AI provider rate limit reached. Please try again later."
          : "AI provider request failed.",
      );
    }
  }

  async text(messages: TextMessage[], options: CompletionOptions = {}): Promise<string> {
    const sdkMessages = messages.map((message) => ({
      role: message.role,
      content: message.content,
    })) as ChatCompletionMessageParam[];
    return this.complete(sdkMessages, options);
  }

  async *streamText(messages: TextMessage[], options: CompletionOptions = {}, signal?: AbortSignal) {
    const stream = await this.requireClient().chat.completions.create({
      model: options.model ?? config.DEEPSEEK_CHAT_MODEL,
      messages: messages as ChatCompletionMessageParam[], temperature: options.temperature ?? 0,
      max_tokens: options.maxTokens ?? 500, response_format: {type:"json_object"}, stream: true,
    }, {signal});
    try { for await (const chunk of stream) { const text=chunk.choices[0]?.delta?.content; if(text) yield text; } }
    finally { stream.controller.abort(); }
  }

  async toolTurn(messages: ChatCompletionMessageParam[], tools: ChatCompletionTool[], choice: "auto" | "required") {
    try {
      const result = await this.requireClient().chat.completions.create({
        model: config.DEEPSEEK_CHAT_MODEL, messages, tools, tool_choice: choice,
        temperature: 0, max_tokens: 1_500,
      });
      const message = result.choices[0]?.message;
      if (!message) throw new Error("Empty tool response");
      return message;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(502, "tool_provider_error", "模型工具调用失败，请稍后重试。");
    }
  }

  async json<S extends ZodTypeAny>(
    messages: TextMessage[],
    schema: S,
    options: CompletionOptions = {},
  ): Promise<z.infer<S>> {
    const sdkMessages = messages.map((message) => ({
      role: message.role,
      content: message.content,
    })) as ChatCompletionMessageParam[];
    const raw = await this.complete(sdkMessages, { ...options, json: true });
    return parseJson(raw, schema);
  }

  async visionJson<S extends ZodTypeAny>(
    systemPrompt: string,
    userPrompt: string,
    imageDataUrl: string,
    schema: S,
    options: CompletionOptions = {},
  ): Promise<z.infer<S>> {
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ];
    const raw = await this.complete(messages, { ...options, json: true });
    return parseJson(raw, schema);
  }
}

function parseJson<S extends ZodTypeAny>(raw: string, schema: S): z.infer<S> {
  const text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? text;

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start < 0 || end <= start) {
      throw invalidResponse();
    }
    try {
      parsed = JSON.parse(candidate.slice(start, end + 1));
    } catch {
      throw invalidResponse();
    }
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    console.error("[deepseek] response failed schema validation:", result.error.issues);
    throw invalidResponse();
  }
  return result.data;
}

function invalidResponse(): AppError {
  return new AppError(
    502,
    "ai_invalid_response",
    "AI provider returned an unexpected response.",
  );
}

export const deepSeek = new DeepSeekProvider();
