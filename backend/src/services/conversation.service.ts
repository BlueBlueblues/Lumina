import { CONVERSATION_SYSTEM_PROMPT } from "../prompts/conversation.prompt.js";
import { deepSeek, type TextMessage } from "../providers/deepseek.provider.js";
import type { ConversationRequest } from "../schemas/ai.schema.js";

export async function converse(
  input: ConversationRequest,
): Promise<{ reply: string }> {
  const messages: TextMessage[] = [
    { role: "system", content: CONVERSATION_SYSTEM_PROMPT },
  ];

  if (input.context?.trim()) {
    messages.push({
      role: "system",
      content: `本地记忆上下文（仅用于本次回答，不要声称记住了未提供的内容）：\n${input.context.trim()}`,
    });
  }

  messages.push(...input.messages);

  const reply = await deepSeek.text(messages, { maxTokens: 900 });
  return { reply: reply.trim() };
}
