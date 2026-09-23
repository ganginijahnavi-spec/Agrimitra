"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { callEdgeFunction } from "@/lib/functions";
import type { ChatFunctionResponse } from "@/lib/chat";

export type SendChatMessageResult =
  | { status: "success"; chatId: string; title: string | null; assistantMessage: string }
  | { status: "error"; errorKey: "unauthorized" | "rateLimited" | "unavailable" | "generic" };

export async function sendChatMessageAction(input: {
  chatId: string | null;
  message: string;
  language: "en" | "te";
}): Promise<SendChatMessageResult> {
  const { data, error, status } = await callEdgeFunction<ChatFunctionResponse>("chat", {
    method: "POST",
    body: { chat_id: input.chatId, message: input.message, language: input.language },
  });

  if (error || !data) {
    const errorKey =
      status === 401
        ? "unauthorized"
        : status === 429
          ? "rateLimited"
          : status === 502
            ? "unavailable"
            : "generic";
    return { status: "error", errorKey };
  }

  const locale = await getLocale();
  revalidatePath(`/${locale}/chat`);
  revalidatePath(`/${locale}/dashboard`);

  return {
    status: "success",
    chatId: data.chat_id,
    title: data.title,
    assistantMessage: data.message.content,
  };
}
