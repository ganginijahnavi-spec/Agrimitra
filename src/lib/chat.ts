export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  created_at: string;
};

export type ChatSummary = {
  id: string;
  title: string | null;
  language: "en" | "te";
  updated_at: string;
};

export type ChatFunctionResponse = {
  chat_id: string;
  title: string | null;
  message: { role: "assistant"; content: string };
};
