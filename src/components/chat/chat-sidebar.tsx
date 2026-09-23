"use client";

import { useState } from "react";
import { MessageSquare, Plus, History } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { ChatSummary } from "@/lib/chat";
import { cn } from "@/lib/utils";

function ChatList({ chats, onNavigate }: { chats: ChatSummary[]; onNavigate?: () => void }) {
  const t = useTranslations("Chat");
  const format = useFormatter();
  const pathname = usePathname();

  if (chats.length === 0) {
    return <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("noChatsYet")}</p>;
  }

  return (
    <nav className="flex flex-col gap-1">
      {chats.map((chat) => {
        const href = `/chat/${chat.id}`;
        const active = pathname === href;
        return (
          <Link
            key={chat.id}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-start gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent/40",
              active && "bg-accent/60 font-medium text-foreground",
            )}
          >
            <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block truncate">{chat.title || t("untitledChat")}</span>
              <span className="block text-xs text-muted-foreground">
                {format.relativeTime(new Date(chat.updated_at), { now: new Date() })}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function ChatSidebar({ chats }: { chats: ChatSummary[] }) {
  const t = useTranslations("Chat");
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/70 md:flex">
        <div className="border-b border-border/70 p-3">
          <Button render={<Link href="/chat" />} className="w-full">
            <Plus className="size-4" aria-hidden="true" />
            {t("newChat")}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <ChatList chats={chats} />
        </div>
      </aside>

      {/* Mobile */}
      <div className="flex items-center gap-2 border-b border-border/70 p-3 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="outline" size="sm" />}>
            <History className="size-4" aria-hidden="true" />
            {t("history")}
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetTitle className="px-4 pt-4">{t("history")}</SheetTitle>
            <div className="mt-2 flex-1 overflow-y-auto px-2">
              <ChatList chats={chats} onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <Button render={<Link href="/chat" />} size="sm" className="flex-1">
          <Plus className="size-4" aria-hidden="true" />
          {t("newChat")}
        </Button>
      </div>
    </>
  );
}
