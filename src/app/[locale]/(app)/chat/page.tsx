import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatWindow } from "@/components/chat/chat-window";

export default async function NewChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ prefill?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { prefill } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({ href: "/login", locale });
  }

  return (
    <ChatWindow
      key="new"
      chatId={null}
      initialMessages={[]}
      language={locale === "te" ? "te" : "en"}
      initialInput={prefill}
    />
  );
}
