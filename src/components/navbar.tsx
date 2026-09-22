"use client";

import { useState } from "react";
import { LogOut, Menu, Sprout, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/language-switcher";
import { signOutAction } from "@/lib/actions/auth";

export function Navbar({ user }: { user: { email: string } | null }) {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sprout className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg tracking-tight">AgriMitra AI</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          {user ? (
            <>
              <Button variant="ghost" render={<Link href="/profile" />}>
                <UserRound className="size-4" aria-hidden="true" />
                {t("profile")}
              </Button>
              <form action={signOutAction}>
                <Button type="submit" variant="outline">
                  <LogOut className="size-4" aria-hidden="true" />
                  {t("logout")}
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" render={<Link href="/login" />}>
                {t("login")}
              </Button>
              <Button render={<Link href="/register" />}>{t("register")}</Button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t("menu")}
                  className="shrink-0"
                />
              }
            >
              <Menu className="size-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="flex items-center gap-2 px-4 pt-4 text-primary">
                <Sprout className="size-5" aria-hidden="true" />
                AgriMitra AI
              </SheetTitle>
              <nav className="mt-4 flex flex-col gap-2 px-4">
                <SheetClose
                  render={
                    <Link
                      href="/"
                      className="rounded-md px-3 py-3 text-base font-medium hover:bg-accent/40"
                    />
                  }
                >
                  {t("home")}
                </SheetClose>

                {user ? (
                  <>
                    <SheetClose
                      render={
                        <Link
                          href="/profile"
                          className="rounded-md px-3 py-3 text-base font-medium hover:bg-accent/40"
                        />
                      }
                    >
                      {t("profile")}
                    </SheetClose>
                    <form action={signOutAction}>
                      <Button type="submit" variant="outline" size="lg" className="mt-2 w-full">
                        <LogOut className="size-4" aria-hidden="true" />
                        {t("logout")}
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <SheetClose
                      render={
                        <Link
                          href="/login"
                          className="rounded-md px-3 py-3 text-base font-medium hover:bg-accent/40"
                        />
                      }
                    >
                      {t("login")}
                    </SheetClose>
                    <SheetClose
                      render={
                        <Button size="lg" className="mt-2" render={<Link href="/register" />} />
                      }
                    >
                      {t("register")}
                    </SheetClose>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
