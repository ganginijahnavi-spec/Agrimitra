import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatSidebar } from "@/components/chat/chat-sidebar";

export default async function ChatLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({ href: "/login", locale });
  }

  const { data: chats } = await supabase
    .from("chats")
    .select("id, title, language, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-6xl flex-col md:flex-row">
      <ChatSidebar chats={chats ?? []} />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
